package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.AccessTokenDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.MapTokenDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapService {

    public static final String AZURE_MAPS_AUTH_PROPERTIES_NAME = "azure-maps-api";
    private final OAuth2ClientProperties properties;
    private final ModelMapper modelMapper;
    private final WebClient tokenWebClient = WebClient.builder().build();

    public MapTokenDTO getReadToken() throws IncorrectConfigurationException {
        OAuth2ClientProperties.Registration registration = properties.getRegistration().get(AZURE_MAPS_AUTH_PROPERTIES_NAME);
        OAuth2ClientProperties.Provider provider = properties.getProvider().get(AZURE_MAPS_AUTH_PROPERTIES_NAME);
        if (registration == null) {
            throw new IncorrectConfigurationException("Map access isn't configured");
        }
        OffsetDateTime now = OffsetDateTime.now();
        BodyInserters.FormInserter<String> body = BodyInserters
                .fromFormData(OAuth2ParameterNames.GRANT_TYPE, registration.getAuthorizationGrantType())
                .with(OAuth2ParameterNames.CLIENT_ID, registration.getClientId())
                .with(OAuth2ParameterNames.CLIENT_SECRET, registration.getClientSecret())
                .with(OAuth2ParameterNames.SCOPE, String.join(" ", registration.getScope()));
        AccessTokenDTO accessToken = tokenWebClient.post()
                .uri(provider.getTokenUri())
                .body(body)
                .retrieve()
                .bodyToMono(AccessTokenDTO.class)
                .block();
        MapTokenDTO result = modelMapper.map(accessToken, MapTokenDTO.class);
        result.setExpiresAt(now.plus(result.getExpiresIn()));
        return result;

    }
}
