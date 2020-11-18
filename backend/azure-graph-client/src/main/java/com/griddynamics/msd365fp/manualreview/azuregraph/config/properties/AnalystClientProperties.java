// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.azuregraph.config.properties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import java.time.Duration;
import java.util.Map;

@Getter
@AllArgsConstructor
@ConstructorBinding
@ConfigurationProperties(prefix = "azure.graph-api")
public class AnalystClientProperties {
    /**
     * Mapping of AD app roles into internal roles for application.
     * Key is an AD app role, value is an internal role
     */
    private final Map<String, String> roleMapping;

    /**
     * URLs and templates for AD service calling.
     * Templates contains placeholders for dynamic information
     */
    private final String roleAssignmentsUrl;
    private final String userRoleAssignmentsUrlTemplate;
    private final String appServicePrincipalUrl;
    private final String usersUrl;
    private final String userUrlTemplate;
    private final String userPhotoUrlTemplate;
    private final Duration timeout;
    private final Long retries;

}
