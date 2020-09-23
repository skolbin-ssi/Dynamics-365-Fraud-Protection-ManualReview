// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.cosmos.utilities.PageProcessingUtility;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.DurableEventHubProcessorClientRegistry;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.DurableEventHubProducerClientRegistry;
import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubProcessorClient;
import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubProducerClient;
import com.griddynamics.msd365fp.manualreview.model.ItemLock;
import com.griddynamics.msd365fp.manualreview.model.event.Event;
import com.griddynamics.msd365fp.manualreview.model.event.internal.*;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.griddynamics.msd365fp.manualreview.queues.repository.QueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DEFAULT_QUEUE_PAGE_SIZE;

@Slf4j
@RequiredArgsConstructor
@Service
public class StreamService {

    public static final String ITEM_ASSIGNMENT_EVENT_HUB = "item-assignment-event-hub";
    public static final String ITEM_LOCK_EVENT_HUB = "item-lock-event-hub";
    public static final String QUEUE_SIZE_EVENT_HUB = "queue-size-event-hub";
    public static final String OVERALL_SIZE_EVENT_HUB = "overall-size-event-hub";
    public static final String ITEM_LABEL_EVENT_HUB = "item-label-event-hub";
    public static final String ITEM_RESOLUTION_EVENT_HUB = "item-resolution-event-hub";
    public static final String QUEUE_UPDATE_EVENT_HUB = "queue-update-event-hub";
    private final ModelMapper modelMapper;
    private final QueueRepository queueRepository;

    @Setter(onMethod = @__({@Autowired}))
    private DurableEventHubProducerClientRegistry producerRegistry;
    @Setter(onMethod = @__({@Autowired}))
    private DurableEventHubProcessorClientRegistry processorRegistry;

    public boolean checkStreamingHealth() {
        long failures = 0;
        failures += processorRegistry.values().stream()
                .filter(DurableEventHubProcessorClient::requireRestart)
                .count();
        failures += producerRegistry.values().stream()
                .filter(DurableEventHubProducerClient::requireRestart)
                .count();
        log.debug("Streaming healthcheck has discovered [{}] failures", failures);
        return failures < 1;
    }

    /**
     * Sends event to the {@link DurableEventHubProducerClient}
     *
     * @param event   the event object
     * @param channel the name of producer
     * @return true when event was successfully sent
     */
    public <T extends Event> boolean sendEvent(T event, String channel) {
        log.info("Sending event to [{}] with body: [{}]", channel, event);
        boolean success = producerRegistry.get(channel).send(event);
        if (success) {
            log.info("Event [{}] sending has been started successfully.", event.getId());
        } else {
            log.warn("Event [{}] has not been sent: [{}]", event.getId(), event);
        }
        return success;
    }

    /**
     * Sending of Item assignment event.
     * The method should be used in case if there were NOT any
     * assignments before (e.g. item was just enriched).
     * Otherwise use {@link this.sendItemAssignmentEvent(Item, Set)}
     */
    public void sendItemAssignmentEvent(final Item item) {
        try {
            Set<String> newIds = item.getQueueIds();
            if (CollectionUtils.isEmpty(newIds)) {
                newIds = getActiveResidualQueues().stream().map(Queue::getId).collect(Collectors.toSet());
            }
            sendItemAssignmentEvent(item, newIds, Set.of());
        } catch (BusyException e) {
            log.error("Event [{}] for item [{}] wasn't sent due to database overload",
                    ItemAssignmentEvent.class, item.getId());
        }
    }

    /**
     * Sending of Item assignment event.
     * The method should be used in case if item had any
     * assignments before. The empty queueIds will be treated as set of
     * residual queues (except newIds when item is inactive).
     * Otherwise use {@link this.sendItemAssignmentEvent(Item)}
     */
    public void sendItemAssignmentEvent(final Item item, final Set<String> oldQueueIds) {
        try {
            Set<String> newIds = item.getQueueIds();
            Set<String> oldIds = oldQueueIds;
            if (CollectionUtils.isEmpty(newIds) && item.isActive()) {
                newIds = getActiveResidualQueues().stream().map(Queue::getId).collect(Collectors.toSet());
            }
            if (CollectionUtils.isEmpty(oldIds)) {
                oldIds = getActiveResidualQueues().stream().map(Queue::getId).collect(Collectors.toSet());
            }
            sendItemAssignmentEvent(item, newIds, oldIds);
        } catch (BusyException e) {
            log.error("Event [{}] for item [{}] wasn't sent due to database overload",
                    ItemAssignmentEvent.class, item.getId());
        }
    }

    private void sendItemAssignmentEvent(final Item item, final Set<String> newIds, final Set<String> oldIds) {
        ItemAssignmentEvent event = ItemAssignmentEvent.builder()
                .id(item.getId())
                .newQueueIds(newIds)
                .oldQueueIds(oldIds)
                .actioned(OffsetDateTime.now())
                .build();
        sendEvent(event, ITEM_ASSIGNMENT_EVENT_HUB);
    }

    public void sendItemLockEvent(Item item, ItemLock prevLock, LockActionType actionType) {
        ItemLockEvent event = ItemLockEvent.builder()
                .id(item.getId())
                .actionType(actionType)
                .build();
        if (actionType.isRelease()) {
            event.setQueueId(prevLock.getQueueId());
            event.setQueueViewId(prevLock.getQueueViewId());
            event.setOwnerId(prevLock.getOwnerId());
            event.setLocked(prevLock.getLocked());
            event.setReleased(OffsetDateTime.now());
        } else {
            event.setQueueId(item.getLock().getQueueId());
            event.setQueueViewId(item.getLock().getQueueViewId());
            event.setOwnerId(item.getLock().getOwnerId());
            event.setLocked(item.getLock().getLocked());
        }
        sendEvent(event, ITEM_LOCK_EVENT_HUB);
    }

    public boolean sendQueueSizeEvent(Queue queue) {
        QueueSizeUpdateEvent event = modelMapper.map(queue, QueueSizeUpdateEvent.class);
        return sendEvent(event, QUEUE_SIZE_EVENT_HUB);
    }

    public boolean sendOverallSizeEvent(int size) {
        OverallSizeUpdateEvent event = new OverallSizeUpdateEvent(size, OffsetDateTime.now());
        return sendEvent(event, OVERALL_SIZE_EVENT_HUB);
    }

    public void sendItemLabelEvent(final Item item, final Item oldItem) {
        ItemLabelEvent event = ItemLabelEvent.builder()
                .id(item.getId())
                .label(item.getLabel())
                .assesmentResult(item.getAssessmentResult())
                .decisionApplyingDuration(
                        Duration.between(oldItem.getLock().getLocked(), item.getLabel().getLabeled()))
                .build();
        sendEvent(event, ITEM_LABEL_EVENT_HUB);
    }

    public void sendItemResolvedEvent(final Item item) {
        ItemResolutionEvent event = modelMapper.map(item, ItemResolutionEvent.class);
        sendEvent(event, ITEM_RESOLUTION_EVENT_HUB);
    }

    public void sendQueueUpdateEvent(final Queue queue) {
        QueueUpdateEvent event = modelMapper.map(queue, QueueUpdateEvent.class);
        sendEvent(event, QUEUE_UPDATE_EVENT_HUB);
    }

    //TODO: caching
    private Collection<Queue> getActiveResidualQueues() throws BusyException {
        return PageProcessingUtility.getAllPages(
                continuation -> queueRepository.getQueueList(
                        true, true, DEFAULT_QUEUE_PAGE_SIZE, continuation));
    }
}
