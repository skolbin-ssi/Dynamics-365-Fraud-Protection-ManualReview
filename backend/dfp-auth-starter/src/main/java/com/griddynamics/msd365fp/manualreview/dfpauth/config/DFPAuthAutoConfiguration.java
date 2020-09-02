package com.griddynamics.msd365fp.manualreview.dfpauth.config;

import com.griddynamics.msd365fp.manualreview.azuregraph.client.AnalystClient;
import com.griddynamics.msd365fp.manualreview.dfpauth.config.properties.DFPRoleExtractorProperties;
import com.griddynamics.msd365fp.manualreview.dfpauth.security.DFPRoleExtractionFilter;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(DFPRoleExtractorProperties.class)
public class DFPAuthAutoConfiguration {

    @Bean
    @ConditionalOnBean(AnalystClient.class)
    DFPRoleExtractionFilter dfpRoleFilter(
            AnalystClient analystClient,
            DFPRoleExtractorProperties properties) throws IncorrectConfigurationException {
        return new DFPRoleExtractionFilter(analystClient, properties);
    }

}

