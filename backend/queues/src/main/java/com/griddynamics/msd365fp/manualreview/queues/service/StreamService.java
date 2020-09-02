package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.cosmos.utilities.PageProcessingUtility;
import com.griddynamics.msd365fp.manualreview.model.ItemLabel;
import com.griddynamics.msd365fp.manualreview.model.ItemLock;
import com.griddynamics.msd365fp.manualreview.model.event.Event;
import com.griddynamics.msd365fp.manualreview.model.event.dfp.PurchaseEvent;
import com.griddynamics.msd365fp.manualreview.model.event.internal.*;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.griddynamics.msd365fp.manualreview.queues.repository.QueueRepository;
import com.griddynamics.msd365fp.manualreview.queues.streaming.*;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.modelmapper.ModelMapper;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DEFAULT_QUEUE_PAGE_SIZE;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.EVENT_HUB_SENDING_TIMEOUT_MS;

/**
 * Streaming service defining common streaming operations.
 * Class which inherits this interface should have
 * {@link org.springframework.cloud.stream.annotation.EnableBinding} annotation
 * with provisioned event streams from
 * {@link com.griddynamics.msd365fp.manualreview.queues.streaming} package
 */
@Slf4j
@RequiredArgsConstructor
@Service
@EnableBinding({
        ItemAssignmentEventStream.class,
        ItemResolutionEventStream.class,
        ItemLockEventStream.class,
        ItemLabelEventStream.class,
        DFPEventStream.class,
        QueueSizeEventStream.class,
        QueueUpdateEventStream.class,
        OverallSizeEventStream.class
})
public class StreamService {

    private final ModelMapper modelMapper;
    private final ItemResolutionEventStream itemResolutionEventStream;
    private final ItemAssignmentEventStream itemAssignmentEventStream;
    private final ItemLockEventStream itemLockEventStream;
    private final ItemLabelEventStream itemLabelEventStream;
    private final QueueSizeEventStream queueSizeEventStream;
    private final OverallSizeEventStream overallSizeEventStream;
    private final QueueUpdateEventStream queueUpdateEventStream;
    private final QueueRepository queueRepository;

    @Setter
    private Consumer<Collection<PurchaseEvent>> dfpEventConsumer;

    @StreamListener(DFPEventStream.DFP_INPUT)
    private void getOrderFromDFP(Collection<PurchaseEvent> events) {
        if (dfpEventConsumer != null) {
            dfpEventConsumer.accept(events);
        }
    }

    /**
     * Sends event to the {@link org.springframework.messaging.MessageChannel}
     * which should be marked with {@link org.springframework.cloud.stream.annotation.Output}
     * annotation.
     *
     * @param event          which is sent to {@link org.springframework.messaging.MessageChannel}
     * @param messageChannel allows you to define which messageChannel to choose
     * @return true when event was successfully sent
     */
    public <T extends Event> boolean sendEvent(T event, MessageChannel messageChannel) {
        boolean success = messageChannel.send(new GenericMessage<>(event), EVENT_HUB_SENDING_TIMEOUT_MS);
        if (success) {
            log.info("Event [{}] has been sent successfully.", event.getId());
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
        log.info("Sending event to [{}] with body: [{}]", itemAssignmentEventStream.OUTPUT, event);
        sendEvent(event, itemAssignmentEventStream.output());
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
        log.info("Sending event to [{}] with body: [{}]", itemLockEventStream.OUTPUT, event);
        sendEvent(event, itemLockEventStream.output());
    }

    public boolean sendQueueSizeEvent(Queue queue) {
        QueueSizeUpdateEvent event = modelMapper.map(queue, QueueSizeUpdateEvent.class);
        log.info("Sending event to [{}] with body: [{}]", queueSizeEventStream.OUTPUT, event);
        return sendEvent(event, queueSizeEventStream.output());
    }

    public boolean sendOverallSizeEvent(int size) {
        OverallSizeUpdateEvent event = new OverallSizeUpdateEvent(size, OffsetDateTime.now());
        log.info("Sending event to [{}] with body: [{}]", overallSizeEventStream.OUTPUT, event);
        return sendEvent(event, overallSizeEventStream.output());
    }

    public void sendItemLabelEvent(final Item item, final Item oldItem) {
        ItemLabelEvent event = ItemLabelEvent.builder()
                .id(item.getId())
                .label(item.getLabel())
                .assesmentResult(item.getAssessmentResult())
                .decisionApplyingDuration(
                        Duration.between(oldItem.getLock().getLocked(), item.getLabel().getLabeled()))
                .build();
        log.info("Sending event to [{}] with body: [{}]", itemLabelEventStream.OUTPUT, event);
        sendEvent(event, itemLabelEventStream.output());
    }

    public void sendItemResolvedEvent(final Item item) {
        ItemResolutionEvent event = modelMapper.map(item, ItemResolutionEvent.class);
        log.info("Sending event to [{}] with body: [{}]", itemResolutionEventStream.OUTPUT, event);
        sendEvent(event, itemResolutionEventStream.output());
    }

    public void sendQueueUpdateEvent(final Queue queue) {
        QueueUpdateEvent event = modelMapper.map(queue, QueueUpdateEvent.class);
        log.info("Sending event to [{}] with body: [{}]", queueUpdateEventStream.OUTPUT, event);
        sendEvent(event, queueUpdateEventStream.output());
    }

    @ServiceActivator(inputChannel = DFPEventStream.ERROR_INPUT)
    public void getDFPEventError(Message<?> message) {
        logErrorMessage(message, DFPEventStream.DFP_INPUT);
    }

    private void logErrorMessage(Message<?> errorMessage, String originalInputChannel) {
        log.warn("EventHub channel [{}] got an error message: [{}]", originalInputChannel, errorMessage);
    }

    //TODO: caching
    private Collection<Queue> getActiveResidualQueues() throws BusyException {
        return PageProcessingUtility.getAllPages(
                continuation -> queueRepository.getQueueList(
                        true, true, DEFAULT_QUEUE_PAGE_SIZE, continuation));
    }
}
