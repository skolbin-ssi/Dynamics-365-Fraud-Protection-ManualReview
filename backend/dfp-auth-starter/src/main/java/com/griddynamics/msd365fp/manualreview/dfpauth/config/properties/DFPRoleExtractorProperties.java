// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.dfpauth.config.properties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import java.time.Duration;

@Getter
@AllArgsConstructor
@ConstructorBinding
@ConfigurationProperties(prefix = "azure.dfp-auth")
public class DFPRoleExtractorProperties {
    private final Integer tokenCacheSize;
    private final Duration tokenCacheRetention;

}
