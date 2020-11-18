// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.griddynamics.msd365fp.manualreview.ehub.durable.config.properties.EventHubProperties;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.DurableEventHubProcessorClientRegistry;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.DurableEventHubProducerClientRegistry;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.EventHubProcessorExecutorRegistry;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.HealthCheckProcessor;
import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubClientFactory;
import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubProcessorClient;
import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubProducerClient;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@Slf4j
@RequiredArgsConstructor
@EnableConfigurationProperties({EventHubProperties.class})
public class DurableEventHubAutoConfiguration {


    @Bean
    public DurableEventHubClientFactory eventHubClientFactory(
            final EventHubProperties properties,
            final ObjectMapper mapper,
            final MeterRegistry meterRegistry) {
        return new DurableEventHubClientFactory(properties, mapper, meterRegistry);
    }

    @SuppressWarnings("unchecked")
    @Bean
    @ConditionalOnBean({EventHubProcessorExecutorRegistry.class})
    public DurableEventHubProcessorClientRegistry eventHubProcessorClientRegistry(
            final DurableEventHubClientFactory factory,
            final HealthCheckProcessor healthCheckProcessor,
            final EventHubProcessorExecutorRegistry executorRegistry) {
        DurableEventHubProcessorClientRegistry processorRegistry = new DurableEventHubProcessorClientRegistry();

        executorRegistry.forEach((key, executor) -> processorRegistry.put(
                key,
                factory.buildProcessorClient(
                        key,
                        executor.getKlass(),
                        executor.getConsumer(),
                        error -> logEventHubErrorMessage(error, key),
                        healthCheckProcessor)));

        processorRegistry.values().forEach(DurableEventHubProcessorClient::start);
        return processorRegistry;
    }

    @Bean
    public DurableEventHubProducerClientRegistry eventHubProducerClientRegistry(
            final EventHubProperties properties,
            final DurableEventHubClientFactory factory) {
        DurableEventHubProducerClientRegistry producerRegistry = new DurableEventHubProducerClientRegistry();

        if (properties.getProducers() != null) {
            properties.getProducers().forEach((key, config) -> producerRegistry.put(
                    key,
                    factory.buildProducerClient(key)));
            producerRegistry.values().forEach(DurableEventHubProducerClient::start);
        }
        return producerRegistry;
    }


    private static void logEventHubErrorMessage(Throwable error, String hub) {
        log.warn("EventHub channel [{}] got an error message", hub, error);
    }

}
