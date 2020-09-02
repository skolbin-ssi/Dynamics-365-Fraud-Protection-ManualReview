package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.azuregraph.client.AnalystClient;
import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import com.griddynamics.msd365fp.manualreview.model.exception.EmptySourceException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.SetUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.ROLES_ALLOWED_FOR_ACCESS;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.USER_ROLES_ALLOWED_FOR_QUEUE_PROCESSING;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final AnalystClient analystClient;
    private final ModelMapper modelMapper;

    public boolean checkUsersExist(final Set<String> users) {
        return analystClient.getAnalystIds(Set.of(USER_ROLES_ALLOWED_FOR_QUEUE_PROCESSING))
                .containsAll(users);
    }

    public Collection<String> getActiveUserIds() {
        return analystClient.getAnalystIds(Set.of(USER_ROLES_ALLOWED_FOR_QUEUE_PROCESSING));
    }

    public Collection<String> getActiveUserIds(final Set<String> roles) {
        return analystClient.getAnalystIds(roles);
    }

    public Collection<UserDTO> getUsers(final Set<String> roles) {
        Set<String> appRoles;
        if (CollectionUtils.isEmpty(roles)) {
            appRoles = Set.of(ROLES_ALLOWED_FOR_ACCESS);
        } else {
            appRoles = SetUtils.intersection(roles, Set.of(ROLES_ALLOWED_FOR_ACCESS));
        }
        return analystClient.getAnalystsWithRoles(appRoles).stream()
                .map(an -> modelMapper.map(an, UserDTO.class))
                .collect(Collectors.toList());
    }

    public UserDTO getCurrentUser() throws NotFoundException {
        return modelMapper.map(
                analystClient.getAnalystById(UserPrincipalUtility.getUserId()),
                UserDTO.class);
    }

    public byte[] getUserPhoto(final String id) throws EmptySourceException {
        return analystClient.getAnalystPhoto(id);
    }
}
