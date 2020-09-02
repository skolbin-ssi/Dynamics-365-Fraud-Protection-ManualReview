package com.griddynamics.msd365fp.manualreview.azuregraph.client;


import com.griddynamics.msd365fp.manualreview.azuregraph.config.properties.AnalystClientProperties;
import com.griddynamics.msd365fp.manualreview.azuregraph.model.*;
import com.griddynamics.msd365fp.manualreview.model.Analyst;
import com.griddynamics.msd365fp.manualreview.model.exception.EmptySourceException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.util.Assert;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import javax.annotation.PostConstruct;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor
public class AnalystClient {

    public static final String USER_ID_PLACEHOLDER = "#user_id#";
    public static final String USER_ROLE_TYPE = "User";

    private final WebClient azureGraphAPIWebClient;
    private final ModelMapper azureClientModelMapper;
    private final AnalystClientProperties properties;

    private final Map<String, AppRoleDTO> roles = new ConcurrentHashMap<>();

    @PostConstruct
    private void init() throws IncorrectConfigurationException {
        if (properties.getUserPhotoUrlTemplate() != null &&
                !properties.getUserPhotoUrlTemplate().contains(USER_ID_PLACEHOLDER)) {
            log.error("Incorrect configuration of the azure.graph-api.user-photo.url-template");
            System.exit(1);
        }
        if (properties.getAppServicePrincipalUrl() != null) {
            this.roles.putAll(getAllRoles());
        }
    }

    public Analyst getAnalystById(final String id) throws NotFoundException {
        UserDTO user = retrieveUser(id);
        List<RoleAssignmentDTO> assignments = retrieveRoleAssignmentsByUserId(id)
                .filter(roleAssignment -> roleAssignment.getDeletedDateTime() == null)
                .collect(Collectors.toList());
        if (assignments.isEmpty()) throw new NotFoundException();
        Analyst result = azureClientModelMapper.map(user, Analyst.class);
        result.setRoles(assignments
                .stream()
                .map(roleAssignment -> findRole(roleAssignment.getAppRoleId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(AppRoleDTO::getValue)
                .flatMap(role -> Stream.ofNullable(properties.getRoleMapping().get(role)))
                .collect(Collectors.toSet()));
        return result;
    }

    public List<Analyst> getAnalystsWithRoles(final Set<String> requestedRoles) {
        Map<String, UserDTO> users = retrieveUsers();
        Stream<Analyst> userStream = retrieveRoleAssignments()
                .filter(roleAssignment -> roleAssignment.getDeletedDateTime() == null)
                .collect(Collectors.groupingBy(RoleAssignmentDTO::getPrincipalId))
                .values()
                .stream()
                .map(roleAssignments -> {
                    Analyst result =
                            Analyst.builder()
                                    .id(roleAssignments.get(0).getPrincipalId())
                                    .displayName(roleAssignments.get(0).getPrincipalDisplayName())
                                    .roles(roleAssignments
                                            .stream()
                                            .map(roleAssignment -> findRole(roleAssignment.getAppRoleId()))
                                            .filter(Optional::isPresent)
                                            .map(Optional::get)
                                            .map(AppRoleDTO::getValue)
                                            .flatMap(role -> Stream.ofNullable(properties.getRoleMapping().get(role)))
                                            .collect(Collectors.toSet()))
                                    .build();
                    azureClientModelMapper.map(users.get(result.getId()), result);
                    return result;
                });
        if (requestedRoles != null) {
            userStream = userStream.filter(userDTO -> !Collections.disjoint(userDTO.getRoles(), requestedRoles));
        }

        return userStream
                .collect(Collectors.toList());
    }

    public List<String> getAnalystIds(final Set<String> requestedRoles) {
        Stream<RoleAssignmentDTO> assignments = retrieveRoleAssignments();
        if (requestedRoles != null) {
            assignments = assignments.filter(assignmentDTO -> {
                Optional<AppRoleDTO> role = findRole(assignmentDTO.getAppRoleId());
                String internalRole = role.map(appRoleDTO -> properties.getRoleMapping()
                        .get(appRoleDTO.getValue()))
                        .orElse(null);
                return internalRole != null && requestedRoles.contains(internalRole);
            });
        }

        return assignments.map(RoleAssignmentDTO::getPrincipalId)
                .distinct()
                .collect(Collectors.toList());
    }

    public byte[] getAnalystPhoto(final String id) throws EmptySourceException {
        Assert.notNull(properties.getUserPhotoUrlTemplate(), "Photo retrieving isn't configured");
        List<RoleAssignmentDTO> assignments = retrieveRoleAssignmentsByUserId(id)
                .filter(roleAssignment -> roleAssignment.getDeletedDateTime() == null)
                .collect(Collectors.toList());
        if (assignments.isEmpty()) throw new EmptySourceException();
        try {
            return azureGraphAPIWebClient
                    .get()
                    .uri(properties.getUserPhotoUrlTemplate().replace(USER_ID_PLACEHOLDER, id))
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new EmptySourceException();
        }
    }

    private Optional<AppRoleDTO> findRole(final String roleId) {
        return Optional.ofNullable(roles.computeIfAbsent(roleId, id -> retrieveServicePrincipals()
                .map(ServicePrincipalDTO::getAppRoles)
                .flatMap(List::stream)
                .filter(appRole -> roleId.equals(appRole.getId()))
                .findFirst()
                .orElse(null)));
    }

    private Map<String, AppRoleDTO> getAllRoles() {
        return retrieveServicePrincipals()
                .map(ServicePrincipalDTO::getAppRoles)
                .flatMap(List::stream)
                .collect(Collectors.toMap(AppRoleDTO::getId, ar -> ar));
    }

    private Stream<ServicePrincipalDTO> retrieveServicePrincipals() {
        Assert.notNull(properties.getAppServicePrincipalUrl(),
                "Service principal retrieving isn't configured");
        ServicePrincipalDTO res = azureGraphAPIWebClient
                .get()
                .uri(properties.getAppServicePrincipalUrl())
                .retrieve()
                .bodyToMono(ServicePrincipalDTO.class)
                .block(Duration.of(1, ChronoUnit.MINUTES));

        return Stream.ofNullable(res);
    }

    private UserDTO retrieveUser(final String id) {
        Assert.notNull(properties.getUserUrlTemplate(), "User retrieving isn't configured");
        return azureGraphAPIWebClient
                .get()
                .uri(properties.getUserUrlTemplate().replace(USER_ID_PLACEHOLDER, id))
                .retrieve()
                .bodyToMono(UserDTO.class)
                .block();
    }

    private Map<String, UserDTO> retrieveUsers() {
        Assert.notNull(properties.getUsersUrl(), "Multiple user retrieving isn't configured");
        String url = properties.getUsersUrl();

        return retrieveGraphListData(url, UsersDTO.class).stream()
                .collect(Collectors.toMap(UserDTO::getId, u -> u));

    }

    private Stream<RoleAssignmentDTO> retrieveRoleAssignments() {
        Assert.notNull(properties.getRoleAssignmentsUrl(), "Role assignment retrieving isn't configured");
        String url = properties.getRoleAssignmentsUrl();

        return retrieveGraphListData(url, RoleAssignmentsDTO.class).stream()
                .filter(roleAssignment -> roleAssignment.getDeletedDateTime() == null)
                .filter(roleAssignment -> USER_ROLE_TYPE.equals(roleAssignment.getPrincipalType()));

    }


    private Stream<RoleAssignmentDTO> retrieveRoleAssignmentsByUserId(final String id) {
        Assert.notNull(properties.getUserRoleAssignmentsUrlTemplate(),
                "Role assignment retrieving for user isn't configured");
        String url = properties.getUserRoleAssignmentsUrlTemplate().replace(USER_ID_PLACEHOLDER, id);

        return retrieveGraphListData(url, RoleAssignmentsDTO.class).stream();
    }


    private <E, T extends ODataListResponse<E>> List<E> retrieveGraphListData(String url, Class<T> cls) {
        LinkedList<E> result = new LinkedList<>();
        do {
            T response = azureGraphAPIWebClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(cls)
                    .block();
            url = null;
            if (response != null) {
                if (response.getNextLink() != null) {
                    url = URLDecoder.decode(response.getNextLink(), Charset.defaultCharset());
                }
                if (response.getValue() != null) {
                    result.addAll(response.getValue());
                }
            }
        } while (url != null);
        return result;
    }


}
