// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.streaming;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.griddynamics.msd365fp.manualreview.ehub.durable.config.properties.EventHubProperties;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.function.Consumer;

@RequiredArgsConstructor
@Slf4j
public class DurableEventHubClientFactory {

    private final EventHubProperties properties;
    private final ObjectMapper mapper;
    private final MeterRegistry meterRegistry;


    public <T> DurableEventHubProcessorClient<T> buildProcessorClient(
            final String hubName,
            final Class<T> klass,
            final Consumer<T> eventProcessor,
            final Consumer<Throwable> errorProcessor) {
        return DurableEventHubProcessorClient.<T>builder()
                .properties(properties)
                .hubName(hubName)
                .mapper(mapper)
                .klass(klass)
                .eventProcessor(eventProcessor)
                .errorProcessor(errorProcessor)
                .meterRegistry(meterRegistry)
                .build();
    }

    public DurableEventHubProducerClient buildProducerClient(
            final String hubName) {
        return DurableEventHubProducerClient.builder()
                .properties(properties)
                .hubName(hubName)
                .mapper(mapper)
                .meterRegistry(meterRegistry)
                .build();
    }

}
