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
import io.micrometer.core.instrument.Timer;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.io.Closeable;
import java.time.Duration;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.LinkedBlockingQueue;


@Slf4j
public class DurableEventHubProducerClient implements Closeable {

    public static final String HUB_TAG = "hub";
    public static final int MAX_OFFERING_ATTEMPTS = 2;
    public static final int MAX_BATCH_SIZE = 100;
    public static final Duration MIN_OFFERING_BACKOFF = Duration.ofMillis(100);

    private final EventHubProperties properties;
    private final EventHubProperties.ProducerProperties hubProperties;
    private final String hubName;
    private final ObjectMapper mapper;

    private final Counter offeringCounter;
    private final Counter sendingCounter;
    private final Counter errorCounter;
    private final Timer sendingTimer;

    private final LinkedBlockingQueue<Pair<EventData, CompletableFuture<Object>>> queue;
    private final List<DurableEventHubProducerWorker> workers = new LinkedList<>();


    @Builder
    public DurableEventHubProducerClient(final EventHubProperties properties,
                                         final String hubName,
                                         final ObjectMapper mapper,
                                         final MeterRegistry meterRegistry) {
        this.properties = properties;
        this.hubProperties = properties.getProducers().get(hubName);
        this.queue = new LinkedBlockingQueue<>(this.hubProperties.getBufferSize());
        this.hubName = hubName;
        this.mapper = mapper;
        this.offeringCounter = meterRegistry.counter(
                "event-hub.offered",
                Tags.of(HUB_TAG, hubName));
        this.sendingCounter = meterRegistry.counter(
                "event-hub.sent",
                Tags.of(HUB_TAG, hubName));
        this.errorCounter = meterRegistry.counter(
                "event-hub.sendingError",
                Tags.of(HUB_TAG, hubName));
        this.sendingTimer = meterRegistry.timer(
                "event-hub.sendingLatency",
                Tags.of(HUB_TAG, hubName));
    }


    public synchronized void start() {
        while (workers.size() < hubProperties.getSendingWorkers()) {
            DurableEventHubProducerWorker worker = new DurableEventHubProducerWorker(
                    queue,
                    hubName,
                    MAX_BATCH_SIZE,
                    hubProperties.getSendingPeriod(),
                    sendingCounter,
                    errorCounter,
                    sendingTimer,
                    this::createNewClient);
            worker.setDaemon(true);
            worker.start();
            workers.add(worker);
        }
    }

    private EventHubProducerAsyncClient createNewClient() {
        return new EventHubClientBuilder()
                .connectionString(
                        properties.getConnectionString(),
                        hubProperties.getDestination())
                .buildAsyncProducerClient();
    }

    public Mono<Void> send(final Event event) {
        return Mono.just(event)
                .map(this::transformToEventData)
                .flatMap(data -> {
                    CompletableFuture<Object> result = new CompletableFuture<>();
                    if (queue.offer(Pair.of(data, result))) {
                        offeringCounter.increment();
                        return Mono.just(result);
                    } else {
                        return Mono.error(new EventHubProducerOverloadedError());
                    }
                })
                .retryWhen(Retry.backoff(MAX_OFFERING_ATTEMPTS, MIN_OFFERING_BACKOFF))
                .doOnError(e -> log.error("An event [{}] can't be offered for sending in hub [{}]",
                        event.getId(), hubName))
                .flatMap(Mono::fromFuture)
                .then();
    }

    private EventData transformToEventData(final Event event) {
        EventData data;
        try {
            data = new EventData(mapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            log.error("An error has occurred in hub [{}] during event [{}] serialization: {}",
                    hubName,
                    event.getId(),
                    event);
            throw new EventHubProducerParsingError(e);
        }
        return data;
    }


    @Override
    public void close() {
        workers.forEach(DurableEventHubProducerWorker::close);
        workers.clear();
    }

    public static class EventHubProducerError extends RuntimeException {
        public EventHubProducerError(final Throwable cause) {
            super(cause);
        }

        public EventHubProducerError() {
            super();
        }
    }

    public static class EventHubProducerParsingError extends EventHubProducerError {
        public EventHubProducerParsingError(final Throwable cause) {
            super(cause);
        }
    }

    public static class EventHubProducerOverloadedError extends EventHubProducerError {
    }
}
