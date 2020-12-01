package com.griddynamics.msd365fp.manualreview.ehub.durable.streaming;

import com.azure.messaging.eventhubs.EventData;
import com.azure.messaging.eventhubs.EventDataBatch;
import com.azure.messaging.eventhubs.EventHubProducerAsyncClient;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import reactor.core.publisher.Mono;

import java.io.Closeable;
import java.time.Duration;
import java.util.LinkedList;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
public class DurableEventHubProducerWorker extends Thread implements Closeable {

    private final LinkedBlockingQueue<Pair<EventData, CompletableFuture<Object>>> queue;
    private final String hubName;
    private final Duration sendingPeriod;
    private final Counter sendingCounter;
    private final Counter errorCounter;
    private final Timer sendingTimer;
    private final Supplier<EventHubProducerAsyncClient> clientCreator;
    private final int maxBatchSize;


    private EventHubProducerAsyncClient localClient = null;
    private final LinkedList<Pair<EventData, CompletableFuture<Object>>> buffer = new LinkedList<>();
    private final LinkedList<Pair<EventData, CompletableFuture<Object>>> retryBuffer = new LinkedList<>();
    private boolean closed = false;

    public DurableEventHubProducerWorker(final LinkedBlockingQueue<Pair<EventData, CompletableFuture<Object>>> queue,
                                         final String hubName,
                                         final int maxBatchSize,
                                         final Duration sendingPeriod,
                                         final Counter sendingCounter,
                                         final Counter errorCounter,
                                         final Timer sendingTimer,
                                         final Supplier<EventHubProducerAsyncClient> clientCreator) {
        this.queue = queue;
        this.hubName = hubName;
        this.maxBatchSize = maxBatchSize;
        this.sendingPeriod = sendingPeriod;
        this.sendingCounter = sendingCounter;
        this.errorCounter = errorCounter;
        this.sendingTimer = sendingTimer;
        this.clientCreator = clientCreator;
    }


    @Override
    public void run() {
        while (!closed) {

            // prepare tools
            if (localClient == null) {
                localClient = clientCreator.get();
            }

            localClient.createBatch()
                    .map(this::collectDataForBatch)
                    .flatMap(this::sendBatch)
                    .onErrorResume(this::processSendingError)
                    .block();
        }

    }

    private EventDataBatch collectDataForBatch(final EventDataBatch batch) {
        boolean couldContinueBatching;
        do {
            couldContinueBatching = false;
            Pair<EventData, CompletableFuture<Object>> event;
            if (!retryBuffer.isEmpty()) {
                event = retryBuffer.pollFirst();
            } else {
                event = queue.poll();
            }
            if (event != null) {
                if (batch.tryAdd(event.getLeft())) {
                    buffer.add(event);
                    couldContinueBatching = buffer.size() < maxBatchSize;
                } else {
                    retryBuffer.add(event);
                }
            }
        } while (couldContinueBatching);
        return batch;
    }

    private Mono<Void> sendBatch(final EventDataBatch batch) {
        if (batch.getCount() > 0) {
            Timer.Sample sample = Timer.start();
            return localClient.send(batch)
                    .doOnSuccess(v -> {
                        sample.stop(sendingTimer);
                        buffer.forEach(pair -> pair.getRight().complete(""));
                        sendingCounter.increment(buffer.size());
                        buffer.clear();
                    });
        } else {
            return Mono.delay(sendingPeriod).then();
        }
    }

    private Mono<Void> processSendingError(final Throwable e) {
        // log the error
        log.warn("An error has occurred in hub [{}] during event batch sending: {}",
                hubName,
                buffer.stream().map(Pair::getLeft).collect(Collectors.toList()));
        log.warn("An error has occurred in hub [{}] during event batch sending.",
                hubName, e);
        errorCounter.increment();

        // initiate client recreation
        if (localClient != null) {
            localClient.close();
            localClient = null;
        }

        // try to send data back to queue
        buffer.addAll(retryBuffer);
        retryBuffer.clear();
        for (Pair<EventData, CompletableFuture<Object>> event : buffer) {
            if (!queue.offer(event)) {
                retryBuffer.add(event);
            }
        }
        buffer.clear();

        return Mono.empty().then();
    }


    @Override
    public void close() {
        closed = true;
    }
}
