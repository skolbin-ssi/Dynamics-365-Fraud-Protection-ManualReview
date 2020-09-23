// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.streaming;


import com.azure.core.amqp.exception.AmqpErrorCondition;
import com.azure.core.amqp.exception.AmqpException;
import com.azure.messaging.eventhubs.EventProcessorClient;
import com.azure.messaging.eventhubs.EventProcessorClientBuilder;
import com.azure.messaging.eventhubs.checkpointstore.blob.BlobCheckpointStore;
import com.azure.messaging.eventhubs.models.*;
import com.azure.storage.blob.BlobContainerAsyncClient;
import com.azure.storage.blob.BlobContainerClientBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.griddynamics.msd365fp.manualreview.ehub.durable.config.properties.EventHubProperties;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;


@Slf4j
public class DurableEventHubProcessorClient<T> {

    public static final String NONE_PARTITION = "NONE";
    public static final String PARTITION_TAG = "partition";
    public static final String HUB_TAG = "hub";
    public static final int MAX_EHUB_PARTITIONS = 32;

    private final EventHubProperties properties;
    private final String hubName;
    private final ObjectMapper mapper;
    private final Class<T> klass;
    private final Consumer<T> eventProcessor;
    private final Consumer<Throwable> errorProcessor;
    private final MeterRegistry meterRegistry;

    private final Map<String, EventPosition> positionMap = new ConcurrentHashMap<>();
    private final Map<String, Counter> processingLagCounters = new ConcurrentHashMap<>();
    private final Map<String, Counter> processingCounters = new ConcurrentHashMap<>();
    private final Map<String, Counter> errorCounters = new ConcurrentHashMap<>();
    private final Map<String, Counter> rebalancingCounters = new ConcurrentHashMap<>();
    private final Map<String, OffsetDateTime> localCheckpoints = new ConcurrentHashMap<>();
    private EventProcessorClient internalClient;
    private final int errorThreshhold;
    private final AtomicInteger errorsFound = new AtomicInteger(0);

    @Builder
    public DurableEventHubProcessorClient(final EventHubProperties properties,
                                          final String hubName,
                                          final ObjectMapper mapper,
                                          final Class<T> klass,
                                          final Consumer<T> eventProcessor,
                                          final Consumer<Throwable> errorProcessor,
                                          final MeterRegistry meterRegistry) {
        this.properties = properties;
        this.hubName = hubName;
        this.mapper = mapper;
        this.klass = klass;
        this.eventProcessor = eventProcessor;
        this.errorProcessor = errorProcessor;
        this.meterRegistry = meterRegistry;
        this.errorThreshhold = properties.getConsumerErrorThreshold();
    }

    public synchronized void start() {
        if (internalClient == null) {
            EventHubProperties.ConsumerProperties consumer = Objects.requireNonNull(properties.getConsumers().get(hubName),
                    "Incorrect EvenHub Consumer configuration");

            BlobContainerAsyncClient blobContainerAsyncClient = new BlobContainerClientBuilder()
                    .connectionString(properties.getCheckpointConnectionString())
                    .containerName(properties.getConsumers().get(hubName).getDestination())
                    .buildAsyncClient();

            final Optional<Boolean> isContainerExist = blobContainerAsyncClient.exists().blockOptional();
            if (isContainerExist.isEmpty() || !isContainerExist.get()) {
                blobContainerAsyncClient.create().block(Duration.ofMinutes(5L));
            }
            for (int i = 0; i < MAX_EHUB_PARTITIONS; i++) {
                positionMap.put(String.valueOf(i), EventPosition.earliest());
            }

            EventProcessorClientBuilder eventProcessorClientBuilder = new EventProcessorClientBuilder()
                    .connectionString(
                            properties.getConnectionString(),
                            properties.getConsumers().get(hubName).getDestination())
                    .consumerGroup(consumer.getGroup())
                    .processEvent(this::onReceive)
                    .processError(this::onError)
                    .checkpointStore(new BlobCheckpointStore(blobContainerAsyncClient))
                    .processPartitionInitialization(this::onInitialize)
                    .processPartitionClose(this::onClose)
                    .trackLastEnqueuedEventProperties(true)
                    .initialPartitionEventPosition(positionMap);

            internalClient = eventProcessorClientBuilder.buildEventProcessorClient();
        }

        log.info("Start EventHub listening for [{}]", hubName);
        internalClient.start();
    }

    public boolean requireRestart() {
        return errorsFound.get() > errorThreshhold;
    }

    protected void onReceive(EventContext eventContext) {
        String partition = eventContext.getPartitionContext().getPartitionId();
        Long sequenceNumber = eventContext.getEventData().getSequenceNumber();
        log.info("Processing event from partition [{}] in [{}] with sequence number [{}]",
                partition,
                hubName,
                sequenceNumber);

        Counter lagCounter = processingLagCounters.get(partition);
        Counter processingCounter = processingCounters.get(partition);
        long lag = eventContext.getLastEnqueuedEventProperties().getSequenceNumber() - sequenceNumber;
        OffsetDateTime received = OffsetDateTime.now();

        try {
            T body = mapper.readValue(
                    eventContext.getEventData().getBody(), klass);
            eventProcessor.accept(body);
        } catch (Exception e) {
            errorProcessor.accept(e);
        }

        processingCounter.increment();
        lagCounter.increment(lag);
        if (lag == 0 ||
                localCheckpoints.get(partition)
                        .plus(properties.getCheckpointInterval())
                        .isBefore(received)) {
            log.info("Updating checkpoint for partition [{}] in [{}] on sequence number [{}]",
                    partition,
                    hubName,
                    sequenceNumber);
            localCheckpoints.put(partition, received);
            eventContext.updateCheckpoint();
        }

    }

    protected void onError(ErrorContext errorContext) {
        String partition = Objects.requireNonNullElse(
                errorContext.getPartitionContext().getPartitionId(),
                NONE_PARTITION);
        if (isRebalancingException(errorContext)) {
            Counter rebalancingCounter = rebalancingCounters.get(partition);
            rebalancingCounter.increment();
        } else {
            log.warn("Error occurred in partition processor for partition [{}] in [{}]:",
                    errorContext.getPartitionContext().getPartitionId(),
                    hubName,
                    errorContext.getThrowable());
            Counter errorCounter = errorCounters.get(partition);
            errorCounter.increment();
            errorsFound.incrementAndGet();
            errorProcessor.accept(errorContext.getThrowable());
        }
    }

    private boolean isRebalancingException(final ErrorContext errorContext) {
        return errorContext.getPartitionContext().getPartitionId() != null &&
                errorContext.getThrowable() instanceof AmqpException &&
                AmqpErrorCondition.LINK_STOLEN.equals(((AmqpException) errorContext.getThrowable()).getErrorCondition());
    }

    /**
     * The initializer.
     * Start position is initialized by provided {@link this#positionMap} in
     * accordance with description in
     * {@link EventProcessorClientBuilder#processPartitionInitialization(Consumer)}
     * that allows to use this handler for position recreation
     * (at least in 5.1.2 version of com.azure:azure-messaging-eventhubs).
     */
    protected void onInitialize(InitializationContext context) {
        // set earliest position for partition processing
        String partition = context.getPartitionContext().getPartitionId();
        positionMap.putIfAbsent(context.getPartitionContext().getPartitionId(), EventPosition.earliest());


        // define metrics
        processingLagCounters.computeIfAbsent(partition, key -> meterRegistry.counter(
                "event-hub.lag",
                Tags.of(HUB_TAG, hubName, PARTITION_TAG, partition)));
        processingCounters.computeIfAbsent(partition, key -> meterRegistry.counter(
                "event-hub.received",
                Tags.of(HUB_TAG, hubName, PARTITION_TAG, partition)));
        errorCounters.computeIfAbsent(partition, key -> meterRegistry.counter(
                "event-hub.errors",
                Tags.of(HUB_TAG, hubName, PARTITION_TAG, partition)));
        errorCounters.computeIfAbsent(NONE_PARTITION, key -> meterRegistry.counter(
                "event-hub.errors",
                Tags.of(HUB_TAG, hubName, PARTITION_TAG, NONE_PARTITION)));
        rebalancingCounters.computeIfAbsent(partition, key -> meterRegistry.counter(
                "event-hub.rebalancing",
                Tags.of(HUB_TAG, hubName, PARTITION_TAG, partition)));

        // prepare local variables
        localCheckpoints.computeIfAbsent(
                partition,
                key -> OffsetDateTime.now().minus(properties.getCheckpointInterval()));

        log.info("Started receiving on partition [{}] in [{}]", partition, hubName);
    }

    protected void onClose(CloseContext context) {
        log.info("Stopped receiving on partition [{}] in [{}]. Reason: {}",
                context.getPartitionContext().getPartitionId(),
                hubName,
                context.getCloseReason());
    }

}
