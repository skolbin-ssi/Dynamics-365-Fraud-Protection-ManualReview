// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.streaming;


import com.azure.core.amqp.exception.AmqpErrorCondition;
import com.azure.core.amqp.exception.AmqpException;
import com.azure.messaging.eventhubs.*;
import com.azure.messaging.eventhubs.checkpointstore.blob.BlobCheckpointStore;
import com.azure.messaging.eventhubs.models.*;
import com.azure.storage.blob.BlobContainerAsyncClient;
import com.azure.storage.blob.BlobContainerClientBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.griddynamics.msd365fp.manualreview.ehub.durable.config.properties.EventHubProperties;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.HealthCheckProcessor;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Consumer;


@Slf4j
@RequiredArgsConstructor
public class DurableEventHubProcessorClient<T> {

    public static final String NONE_PARTITION = "NONE";
    public static final String PARTITION_TAG = "partition";
    public static final String HUB_TAG = "hub";
    public static final int MAX_EHUB_PARTITIONS = 32;
    public static final String MR_HEALTH_CHECK_PREFIX = "{\"mr-eh-health-check\":true,\"checkId\":\"";
    public static final String MR_HEALTH_CHECK_SUFFIX = "\"}";
    public static final int HEALTH_CHECK_QUEUE_CAPACITY = 100;
    public static final int HEALTH_CHECK_WORKERS = 3;
    public static final int HEALTH_CHECK_MAX_BATCH_SIZE = 1;

    private final EventHubProperties properties;
    private final String hubName;
    private final ObjectMapper mapper;
    private final Class<T> klass;
    private final Consumer<T> eventProcessor;
    private final Consumer<Throwable> errorProcessor;
    private final HealthCheckProcessor healthcheckProcessor;
    private final MeterRegistry meterRegistry;

    private final Map<String, EventPosition> positionMap = new ConcurrentHashMap<>();
    private final Map<String, Counter> processingLagCounters = new ConcurrentHashMap<>();
    private final Map<String, Counter> processingCounters = new ConcurrentHashMap<>();
    private final Map<String, Counter> healthCheckReceivingCounters = new ConcurrentHashMap<>();
    private final Map<String, Counter> errorCounters = new ConcurrentHashMap<>();
    private final Map<String, Counter> rebalancingCounters = new ConcurrentHashMap<>();
    private final Map<String, OffsetDateTime> localCheckpoints = new ConcurrentHashMap<>();

    private EventProcessorClient internalClient;
    private final List<DurableEventHubProducerWorker> healthcheckProducerWorkers = new LinkedList<>();
    private final LinkedBlockingQueue<Pair<EventData, CompletableFuture<Object>>> healthcheckQueue =
            new LinkedBlockingQueue<>(HEALTH_CHECK_QUEUE_CAPACITY);

    private final Counter healthcheckOfferingCounter;
    private final Counter healthcheckSendingCounter;
    private final Counter healthcheckErrorCounter;
    private final Timer healthcheckSendingTimer;

    public DurableEventHubProcessorClient(final EventHubProperties properties,
                                          final String hubName,
                                          final ObjectMapper mapper,
                                          final Class<T> klass,
                                          final Consumer<T> eventProcessor,
                                          final Consumer<Throwable> errorProcessor,
                                          final HealthCheckProcessor healthcheckProcessor,
                                          final MeterRegistry meterRegistry) {
        this.properties = properties;
        this.hubName = hubName;
        this.mapper = mapper;
        this.klass = klass;
        this.eventProcessor = eventProcessor;
        this.errorProcessor = errorProcessor;
        this.healthcheckProcessor = healthcheckProcessor;
        this.meterRegistry = meterRegistry;

        this.healthcheckOfferingCounter = meterRegistry.counter(
                "event-hub.health-check-offered",
                Tags.of(HUB_TAG, hubName));
        this.healthcheckSendingCounter = meterRegistry.counter(
                "event-hub.health-check-sent",
                Tags.of(HUB_TAG, hubName));
        this.healthcheckErrorCounter = meterRegistry.counter(
                "event-hub.health-check-sendingError",
                Tags.of(HUB_TAG, hubName));
        this.healthcheckSendingTimer = meterRegistry.timer(
                "event-hub.health-check-sendingLatency",
                Tags.of(HUB_TAG, hubName));
    }

    public Mono<Void> sendHealthCheckPing(String id) {
        return Mono.just(new EventData(MR_HEALTH_CHECK_PREFIX + id + MR_HEALTH_CHECK_SUFFIX))
                .flatMap(data -> {
                    CompletableFuture<Object> result = new CompletableFuture<>();
                    if (healthcheckQueue.offer(Pair.of(data, result))) {
                        healthcheckOfferingCounter.increment();
                        return Mono.fromFuture(result);
                    } else {
                        log.info("A health-check [{}] can't be offered for sending in hub [{}]", id, hubName);
                        return Mono.empty();
                    }
                })
                .then();
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
        while (healthcheckProducerWorkers.size() < HEALTH_CHECK_WORKERS) {
            DurableEventHubProducerWorker worker = new DurableEventHubProducerWorker(
                    healthcheckQueue,
                    hubName,
                    HEALTH_CHECK_MAX_BATCH_SIZE,
                    Duration.ofSeconds(2),
                    healthcheckSendingCounter,
                    healthcheckErrorCounter,
                    healthcheckSendingTimer,
                    this::createNewClient);
            worker.setDaemon(true);
            worker.start();
            healthcheckProducerWorkers.add(worker);
        }

        log.info("Start EventHub listening for [{}]", hubName);
        internalClient.start();
    }

    private EventHubProducerAsyncClient createNewClient() {
        return new EventHubClientBuilder()
                .connectionString(
                        properties.getConnectionString(),
                        properties.getConsumers().get(hubName).getDestination())
                .buildAsyncProducerClient();
    }

    protected void onReceive(EventContext eventContext) {
        String partition = eventContext.getPartitionContext().getPartitionId();
        Long sequenceNumber = eventContext.getEventData().getSequenceNumber();

        long lag = eventContext.getLastEnqueuedEventProperties().getSequenceNumber() - sequenceNumber;
        OffsetDateTime received = OffsetDateTime.now();
        byte[] bodyBytes = eventContext.getEventData().getBody();
        String bodyString = new String(bodyBytes);

        if (bodyString.startsWith(MR_HEALTH_CHECK_PREFIX)) {
            healthCheckReceivingCounters.get(partition).increment();
            processHealthCheckEvent(partition, bodyString);
        } else {
            processingCounters.get(partition).increment();
            processDataEvent(partition, sequenceNumber, bodyBytes);
        }

        processingLagCounters.get(partition).increment(lag);
        if (lag == 0 ||
                localCheckpoints.get(partition)
                        .plus(properties.getConsumers().get(hubName).getCheckpointInterval())
                        .isBefore(received)) {
            log.info("Updating checkpoint for partition [{}] in [{}] on sequence number [{}]",
                    partition,
                    hubName,
                    sequenceNumber);
            localCheckpoints.put(partition, received);
            eventContext.updateCheckpoint();
        }

    }

    private void processDataEvent(final String partition, final Long sequenceNumber, final byte[] bodyBytes) {
        log.info("Processing event from partition [{}] in [{}] with sequence number [{}]",
                partition,
                hubName,
                sequenceNumber);

        try {
            T body = mapper.readValue(bodyBytes, klass);
            eventProcessor.accept(body);
        } catch (Exception e) {
            errorProcessor.accept(e);
        }
    }

    private void processHealthCheckEvent(final String partition, final String bodyString) {
        String checkId = bodyString.substring(
                MR_HEALTH_CHECK_PREFIX.length(),
                bodyString.lastIndexOf(MR_HEALTH_CHECK_SUFFIX));
        if (healthcheckProcessor != null) {
            healthcheckProcessor.processConsumerHealthCheck(hubName, partition, checkId);
        } else {
            log.info("Health-check [{}] for [{}] has been received on partition [{}]", checkId, hubName, partition);
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
        healthCheckReceivingCounters.computeIfAbsent(partition, key -> meterRegistry.counter(
                "event-hub.health-check-receiving",
                Tags.of(HUB_TAG, hubName, PARTITION_TAG, partition)));

        // prepare local variables
        localCheckpoints.computeIfAbsent(
                partition,
                key -> OffsetDateTime.now().minus(properties.getConsumers().get(hubName).getCheckpointInterval()));

        log.info("Started receiving on partition [{}] in [{}]", partition, hubName);
    }

    protected void onClose(CloseContext context) {
        String partition = context.getPartitionContext().getPartitionId();
        log.info("Stopped receiving from partition [{}] in [{}]. Reason: {}",
                partition,
                hubName,
                context.getCloseReason());
    }

}
