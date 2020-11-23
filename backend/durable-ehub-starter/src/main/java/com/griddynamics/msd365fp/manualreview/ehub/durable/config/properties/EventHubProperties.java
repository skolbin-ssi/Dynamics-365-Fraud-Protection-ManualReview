// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.config.properties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import java.time.Duration;
import java.util.Map;

@ConstructorBinding
@ConfigurationProperties("azure.event-hub")
@Getter
@AllArgsConstructor
public class EventHubProperties {

    private final String connectionString;
    private final String checkpointStorageAccount;
    private final String checkpointConnectionString;
    private final Map<String, ProducerProperties> producers;
    private final Map<String, ConsumerProperties> consumers;

    @AllArgsConstructor
    @Getter
    @ToString
    public static class ProducerProperties {
        private final String destination;
        private final Duration sendingPeriod;
        private final long sendingWorkers;
        private final int bufferSize;
    }

    @AllArgsConstructor
    @Getter
    public static class ConsumerProperties {
        private final String destination;
        private final String group;
        private final Duration checkpointInterval;
    }

}
