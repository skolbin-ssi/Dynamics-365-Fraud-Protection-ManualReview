// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.dfpauth.config;

import com.griddynamics.msd365fp.manualreview.azuregraph.client.AnalystClient;
import com.griddynamics.msd365fp.manualreview.dfpauth.config.properties.DFPRoleExtractorProperties;
import com.griddynamics.msd365fp.manualreview.dfpauth.security.DFPRoleExtractionFilter;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@EnableConfigurationProperties(DFPRoleExtractorProperties.class)
public class DFPAuthAutoConfiguration {

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @Bean
    @ConditionalOnBean(AnalystClient.class)
    DFPRoleExtractionFilter dfpRoleFilter(
            AnalystClient analystClient,
            DFPRoleExtractorProperties properties) throws IncorrectConfigurationException {
        return new DFPRoleExtractionFilter(analystClient, properties, List.of(activeProfiles.split(",")));
    }

}

