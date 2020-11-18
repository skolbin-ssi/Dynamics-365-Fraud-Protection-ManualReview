// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.streaming;


import com.azure.messaging.eventhubs.EventData;
import com.azure.messaging.eventhubs.EventHubClientBuilder;
import com.azure.messaging.eventhubs.EventHubProducerAsyncClient;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.griddynamics.msd365fp.manualreview.ehub.durable.config.properties.EventHubProperties;
import com.griddynamics.msd365fp.manualreview.model.event.Event;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import reactor.core.scheduler.Schedulers;

import java.util.Set;


@Slf4j
public class DurableEventHubProducerClient {

    public static final String HUB_TAG = "hub";

    private final EventHubProperties properties;
    private final String hubName;
    private final ObjectMapper mapper;

    private final Counter processingCounter;
    private final Counter errorCounter;

    private EventHubProducerAsyncClient internalClient;

    @Builder
    public DurableEventHubProducerClient(final EventHubProperties properties,
                                         final String hubName,
                                         final ObjectMapper mapper,
                                         final MeterRegistry meterRegistry) {
        this.properties = properties;
        this.hubName = hubName;
        this.mapper = mapper;
        this.processingCounter = meterRegistry.counter(
                "event-hub.sent",
                Tags.of(HUB_TAG, hubName));
        this.errorCounter = meterRegistry.counter(
                "event-hub.sendingError",
                Tags.of(HUB_TAG, hubName));
    }


    public synchronized void start() {
        internalClient = new EventHubClientBuilder()
                .connectionString(
                        properties.getConnectionString(),
                        properties.getProducers().get(hubName).getDestination())
                .buildAsyncProducerClient();
    }

    public boolean send(final Event event) {
        if (internalClient == null) {
            return false;
        }
        EventData data;
        try {
            data = new EventData(mapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            log.error("An error has occurred in hub [{}] during event [{}] serialization: {}",
                    hubName,
                    event.getId(),
                    event);
            return false;
        }
        internalClient.send(Set.of(data))
                .timeout(properties.getSendingTimeout())
                .retry(properties.getSendingRetries())
                .doOnSuccess(res -> processingCounter.increment())
                .doOnError(e -> {
                    log.error("An error has occurred in hub [{}] during event [{}] sending: {}",
                            hubName,
                            event.getId(),
                            data.getBodyAsString());
                    errorCounter.increment();
                })
                .subscribeOn(Schedulers.elastic())
                .subscribe();
        return true;
    }

}
