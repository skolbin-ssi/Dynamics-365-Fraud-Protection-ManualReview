// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.config.properties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import java.time.Duration;
import java.util.Map;

@ConstructorBinding
@ConfigurationProperties("mr")
@Getter
@AllArgsConstructor
public class ApplicationProperties {

    private final String instanceType;
    private final String instanceId;
    private final Map<String, TaskProperties> tasks;
    private final double taskResetTimeoutMultiplier;
    private final double taskWarningTimeoutMultiplier;
    private final TaskExecutor taskExecutor;

    @AllArgsConstructor
    @Getter
    @ToString
    public static class TaskProperties {
        private final boolean enabled;
        private final Duration delay;
        private final Duration timeout;
    }

    @AllArgsConstructor
    @Getter
    public static class TaskExecutor {
        private final Integer corePoolSize;
        private final Integer maxPoolSize;
        private final Integer queueCapacity;
    }
}
