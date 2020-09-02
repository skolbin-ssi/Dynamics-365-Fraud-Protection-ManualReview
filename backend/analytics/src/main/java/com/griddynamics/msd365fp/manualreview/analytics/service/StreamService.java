package com.griddynamics.msd365fp.manualreview.analytics.service;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.*;
import com.griddynamics.msd365fp.manualreview.analytics.repository.*;
import com.griddynamics.msd365fp.manualreview.analytics.streaming.*;
import com.griddynamics.msd365fp.manualreview.model.event.internal.*;
import com.griddynamics.msd365fp.manualreview.model.event.type.ItemPlacementType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections4.SetUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

import java.time.Duration;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.OVERALL_PLACEMENT_ID;

/**
 * Streaming service defining common streaming operations.
 * Class which inherits this interface should have
 * {@link org.springframework.cloud.stream.annotation.EnableBinding} annotation
 * with provisioned event streams from
 * {@link com.griddynamics.msd365fp.manualreview.analytics.streaming} package
 */
@Slf4j
@Service
@RequiredArgsConstructor
@EnableBinding({
        ItemAssignmentEventStream.class,
        ItemLabelEventStream.class,
        ItemResolutionEventStream.class,
        ItemLockEventStream.class,
        QueueSizeEventStream.class,
        QueueUpdateEventStream.class,
        OverallSizeEventStream.class
})
public class StreamService {

    private final ResolutionRepository resolutionRepository;
    private final ItemLockActivityRepository lockActivitiesRepository;
    private final CollectedQueueInfoRepository collectedQueueInfoRepository;
    private final QueueSizeCalculationActivityRepository queueSizeCalculationActivityRepository;
    private final ItemLabelActivityRepository itemLabelActivityRepository;
    private final ItemPlacementActivityRepository itemPlacementActivityRepository;

    private final ModelMapper modelMapper;

    @Value("${azure.cosmosdb.default-ttl}")
    private Duration defaultTtl;

    @StreamListener(ItemLockEventStream.INPUT)
    public void getItemLockEvent(ItemLockEvent event) {
        log.info("Item Lock event [{}] has been received from the Queues BE. [{}]", event.getId(), event);
        ItemLockActivityEntity activity = modelMapper.map(event, ItemLockActivityEntity.class);
        activity.setTtl(defaultTtl.toSeconds());
        lockActivitiesRepository.save(modelMapper.map(event, ItemLockActivityEntity.class));
    }

    @StreamListener(QueueSizeEventStream.INPUT)
    public void getQueueSizeUpdateEvent(QueueSizeUpdateEvent event) {
        log.info("Queue Size Update event has been received from the Queues BE. [{}]", event);
        QueueSizeCalculationActivityEntity activity = modelMapper.map(event, QueueSizeCalculationActivityEntity.class);
        activity.setTtl(defaultTtl.toSeconds());
        queueSizeCalculationActivityRepository.save(modelMapper.map(event, QueueSizeCalculationActivityEntity.class));
    }

    @StreamListener(OverallSizeEventStream.INPUT)
    public void getOverallSizeUpdateEvent(OverallSizeUpdateEvent event) {
        log.info("Overall Size Update event has been received from the Queues BE. [{}]", event);
        QueueSizeCalculationActivityEntity activityEntity =
                modelMapper.map(event, QueueSizeCalculationActivityEntity.class);
        activityEntity.setTtl(defaultTtl.toSeconds());
        queueSizeCalculationActivityRepository.save(activityEntity);
    }

    @StreamListener(ItemAssignmentEventStream.INPUT)
    public void getItemAssignmentEvent(ItemAssignmentEvent event) {
        log.info("ItemAssignment event has been received from the Queues BE. [{}]", event);
        if (event.getId() == null) {
            log.error("ItemAssignment event is configured incorrectly. Event doesn't have itemId. [{}]", event);
            return;
        }
        saveItemAddedToQueueActivities(event);
        saveItemDeletedFromQueueActivities(event);
    }

    /**
     * Save activity entities for item that was added to a queues.
     */
    private void saveItemAddedToQueueActivities(ItemAssignmentEvent event) {
        if (CollectionUtils.isEmpty(event.getOldQueueIds())) {
            ItemPlacementActivityEntity activityEntity = ItemPlacementActivityEntity.builder()
                    .id(event.getId() + "-" + ItemPlacementType.ADDED + "-" + event.getActioned().toString())
                    .actioned(event.getActioned())
                    .type(ItemPlacementType.ADDED)
                    .itemId(event.getId())
                    .queueId(OVERALL_PLACEMENT_ID)
                    .ttl(defaultTtl.toSeconds())
                    .build();
            itemPlacementActivityRepository.save(activityEntity);
            log.info("[{}] overall assignment activity entity for the item [{}] has been saved",
                    activityEntity.getType(), activityEntity.getId());
        }
        SetUtils.difference(event.getNewQueueIds(), event.getOldQueueIds())
                .forEach(queueId -> {
                    ItemPlacementActivityEntity activityEntity = ItemPlacementActivityEntity.builder()
                            .id(event.getId() + "-" + queueId + "-" + event.getActioned().toString())
                            .actioned(event.getActioned())
                            .type(ItemPlacementType.ADDED)
                            .itemId(event.getId())
                            .queueId(queueId)
                            .ttl(defaultTtl.toSeconds())
                            .build();
                    itemPlacementActivityRepository.save(activityEntity);
                    log.info("[{}] assignment activity entity for the item [{}] in queue [{}] has been saved",
                            activityEntity.getType(), activityEntity.getId(), queueId);
                });
    }

    /**
     * Save activity entities for item that was deleted from a queue.
     */
    private void saveItemDeletedFromQueueActivities(ItemAssignmentEvent event) {
        if (CollectionUtils.isEmpty(event.getNewQueueIds())) {
            ItemPlacementActivityEntity activityEntity = ItemPlacementActivityEntity.builder()
                    .id(event.getId() + "-" + ItemPlacementType.RELEASED + "-" + event.getActioned().toString())
                    .actioned(event.getActioned())
                    .type(ItemPlacementType.RELEASED)
                    .itemId(event.getId())
                    .queueId(OVERALL_PLACEMENT_ID)
                    .ttl(defaultTtl.toSeconds())
                    .build();
            itemPlacementActivityRepository.save(activityEntity);
            log.info("[{}] overall assignment activity entity for the item [{}] has been saved",
                    activityEntity.getType(), activityEntity.getId());
        }
        SetUtils.difference(event.getOldQueueIds(), event.getNewQueueIds())
                .forEach(queueId -> {
                    ItemPlacementActivityEntity activityEntity = ItemPlacementActivityEntity.builder()
                            .id(event.getId() + "-" + queueId + "-" + event.getActioned().toString())
                            .actioned(event.getActioned())
                            .type(ItemPlacementType.RELEASED)
                            .itemId(event.getId())
                            .queueId(queueId)
                            .ttl(defaultTtl.toSeconds())
                            .build();
                    itemPlacementActivityRepository.save(activityEntity);
                    log.info("[{}] assignment activity entity for the item [{}] in queue [{}] has been saved",
                            activityEntity.getType(), activityEntity.getId(), queueId);
                });
    }

    @StreamListener(ItemLabelEventStream.INPUT)
    public void getItemLabelEvent(ItemLabelEvent event) {
        log.info("ItemLabel event has been received from the Queues BE. [{}]", event);
        if (event.getId() == null) {
            log.error("ItemLabel event is configured incorrectly. Event has null itemId. [{}]", event);
            return;
        }
        saveItemLabelActivity(event);
    }

    private void saveItemLabelActivity(final ItemLabelEvent event) {
        ItemLabelActivityEntity entity = ItemLabelActivityEntity.builder()
                .id(event.getId() + "-" + event.getLabel().getLabeled())
                .analystId(event.getLabel().getAuthorId())
                .label(event.getLabel().getValue())
                .labeled(event.getLabel().getLabeled())
                .queueId(event.getLabel().getQueueId())
                .queueViewId(event.getLabel().getQueueViewId())
                .merchantRuleDecision(event.getAssesmentResult() == null ?
                        null :
                        event.getAssesmentResult().getMerchantRuleDecision())
                .decisionApplyingDuration(event.getDecisionApplyingDuration())
                .ttl(defaultTtl.toSeconds())
                .build();
        itemLabelActivityRepository.save(entity);
        log.info("[{}] label activity entity for the item [{}] has been saved", entity.getLabel(), entity.getId());
    }

    @StreamListener(ItemResolutionEventStream.INPUT)
    public void getItemResolutionEvent(ItemResolutionEvent event) {
        log.info("ItemResolution event has been received from the Queues BE. [{}]", event);
        if (event.getId() == null) {
            log.error("ItemResolution event is configured incorrectly. Event has null itemId. [{}]", event);
            return;
        }
        Resolution activity = modelMapper.map(event, Resolution.class);
        activity.setTtl(defaultTtl.toSeconds());
        resolutionRepository.save(modelMapper.map(event, Resolution.class));
    }

    @StreamListener(QueueUpdateEventStream.INPUT)
    public void getQueueUpdateEvent(QueueUpdateEvent event) {
        log.info("QueueUpdate event has been received from the Queues BE. [{}]", event);
        if (event.getId() == null) {
            log.error("QueueUpdate event is configured incorrectly. Event has null queueId. [{}]", event);
            return;
        }
        CollectedQueueInfoEntity infoEntity = modelMapper.map(event, CollectedQueueInfoEntity.class);
        infoEntity.setTtl(defaultTtl.toSeconds());
        collectedQueueInfoRepository.save(modelMapper.map(event, CollectedQueueInfoEntity.class));
    }

    @ServiceActivator(inputChannel = OverallSizeEventStream.ERROR_INPUT)
    public void getOverallSizeEventError(Message<?> message) {
        logErrorMessage(message, OverallSizeEventStream.INPUT);
    }

    @ServiceActivator(inputChannel = QueueSizeEventStream.ERROR_INPUT)
    public void getQueueSizeEventError(Message<?> message) {
        logErrorMessage(message, QueueSizeEventStream.INPUT);
    }

    @ServiceActivator(inputChannel = QueueUpdateEventStream.ERROR_INPUT)
    public void getQueueUpdateEventError(Message<?> message) {
        logErrorMessage(message, QueueUpdateEventStream.INPUT);
    }

    @ServiceActivator(inputChannel = ItemLockEventStream.ERROR_INPUT)
    public void getItemLockEventError(Message<?> message) {
        logErrorMessage(message, ItemLockEventStream.INPUT);
    }

    @ServiceActivator(inputChannel = ItemAssignmentEventStream.ERROR_INPUT)
    public void getItemAssignmentEventError(Message<?> message) {
        logErrorMessage(message, ItemAssignmentEventStream.INPUT);
    }

    @ServiceActivator(inputChannel = ItemLabelEventStream.ERROR_INPUT)
    public void getItemLabelEventError(Message<?> message) {
        logErrorMessage(message, ItemLabelEventStream.INPUT);
    }

    @ServiceActivator(inputChannel = ItemResolutionEventStream.ERROR_INPUT)
    public void getItemResolutionEventError(Message<?> message) {
        logErrorMessage(message, ItemResolutionEventStream.INPUT);
    }

    private void logErrorMessage(Message<?> errorMessage, String originalInputChannel) {
        log.warn("EventHub channel [{}] got an error message: [{}]", originalInputChannel, errorMessage);
    }
}
