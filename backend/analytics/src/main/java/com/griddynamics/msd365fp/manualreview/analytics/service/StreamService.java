// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.*;
import com.griddynamics.msd365fp.manualreview.analytics.repository.*;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.DurableEventHubProcessorClientRegistry;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.DurableEventHubProducerClientRegistry;
import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubProcessorClient;
import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubProducerClient;
import com.griddynamics.msd365fp.manualreview.model.event.internal.*;
import com.griddynamics.msd365fp.manualreview.model.event.type.ItemPlacementType;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections4.SetUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.OVERALL_PLACEMENT_ID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreamService {

    private final ResolutionRepository resolutionRepository;
    private final ItemLockActivityRepository lockActivitiesRepository;
    private final CollectedQueueInfoRepository collectedQueueInfoRepository;
    private final QueueSizeCalculationActivityRepository queueSizeCalculationActivityRepository;
    private final ItemLabelActivityRepository itemLabelActivityRepository;
    private final ItemPlacementActivityRepository itemPlacementActivityRepository;

    private final ModelMapper modelMapper;
    @Setter(onMethod = @__({@Autowired}))
    private DurableEventHubProducerClientRegistry producerRegistry;
    @Setter(onMethod = @__({@Autowired}))
    private DurableEventHubProcessorClientRegistry processorRegistry;

    @Value("${azure.cosmosdb.default-ttl}")
    private Duration defaultTtl;

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

    public void processItemLockEvent(ItemLockEvent event) {
        log.info("Item Lock event [{}] has been received from the Queues BE. [{}]", event.getId(), event);
        ItemLockActivityEntity activity = modelMapper.map(event, ItemLockActivityEntity.class);
        activity.setTtl(defaultTtl.toSeconds());
        lockActivitiesRepository.save(modelMapper.map(event, ItemLockActivityEntity.class));
    }

    public void processQueueSizeUpdateEvent(QueueSizeUpdateEvent event) {
        log.info("Queue Size Update event has been received from the Queues BE. [{}]", event);
        QueueSizeCalculationActivityEntity activity = modelMapper.map(event, QueueSizeCalculationActivityEntity.class);
        activity.setTtl(defaultTtl.toSeconds());
        queueSizeCalculationActivityRepository.save(modelMapper.map(event, QueueSizeCalculationActivityEntity.class));
    }

    public void processOverallSizeUpdateEvent(OverallSizeUpdateEvent event) {
        log.info("Overall Size Update event has been received from the Queues BE. [{}]", event);
        QueueSizeCalculationActivityEntity activityEntity =
                modelMapper.map(event, QueueSizeCalculationActivityEntity.class);
        activityEntity.setTtl(defaultTtl.toSeconds());
        queueSizeCalculationActivityRepository.save(activityEntity);
    }

    public void processItemAssignmentEvent(ItemAssignmentEvent event) {
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

    public void processItemLabelEvent(ItemLabelEvent event) {
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
                .riskScore(event.getAssesmentResult().getRiskScore())
                .ttl(defaultTtl.toSeconds())
                .build();
        itemLabelActivityRepository.save(entity);
        log.info("[{}] label activity entity for the item [{}] has been saved", entity.getLabel(), entity.getId());
    }

    public void processItemResolutionEvent(ItemResolutionEvent event) {
        log.info("ItemResolution event has been received from the Queues BE. [{}]", event);
        if (event.getId() == null) {
            log.error("ItemResolution event is configured incorrectly. Event has null itemId. [{}]", event);
            return;
        }
        Resolution activity = modelMapper.map(event, Resolution.class);
        activity.setTtl(defaultTtl.toSeconds());
        resolutionRepository.save(modelMapper.map(event, Resolution.class));
    }

    public void processQueueUpdateEvent(QueueUpdateEvent event) {
        log.info("QueueUpdate event has been received from the Queues BE. [{}]", event);
        if (event.getId() == null) {
            log.error("QueueUpdate event is configured incorrectly. Event has null queueId. [{}]", event);
            return;
        }
        CollectedQueueInfoEntity infoEntity = modelMapper.map(event, CollectedQueueInfoEntity.class);
        infoEntity.setTtl(defaultTtl.toSeconds());
        collectedQueueInfoRepository.save(modelMapper.map(event, CollectedQueueInfoEntity.class));
    }
}
