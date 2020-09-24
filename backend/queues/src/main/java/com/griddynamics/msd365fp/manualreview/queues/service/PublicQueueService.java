// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConditionException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.QueueConfigurationDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.QueueCreationDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.QueueOverviewDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.QueueViewDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.griddynamics.msd365fp.manualreview.queues.util.QueueViewUtility;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.SetUtils;
import org.apache.commons.lang3.SerializationUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicQueueService {

    private final PublicQueueClient publicQueueClient;
    private final PublicItemClient publicItemClient;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final TaskService taskService;
    private final StreamService streamService;

    @Value("${mr.items.near-to-timeout}")
    private Duration defaultTimeToTimeout;
    @Value("${mr.items.near-to-sla}")
    private Duration defaultTimeToSLA;
    @Value("${mr.items.unlock-timeout}")
    private Duration unlockTimeout;
    @Value("${azure.cosmosdb.default-ttl}")
    private Duration defaultTtl;

    public QueueViewDTO getQueue(final String id) throws NotFoundException {
        QueueView queueView = publicQueueClient.getActiveQueueView(id);
        publicItemClient.recalculateQueueViewSizes(new ArrayList<>(Collections.singletonList(queueView)));
        Collection<String> activeUsers = userService.getActiveUserIds();
        QueueViewDTO result = modelMapper.map(queueView, QueueViewDTO.class);
        result.getReviewers().retainAll(activeUsers);
        result.getSupervisors().retainAll(activeUsers);

        return result;
    }

    public Collection<QueueViewDTO> getQueues(final QueueViewType viewType) throws BusyException {
        Collection<QueueView> queueViews = publicQueueClient.getActiveQueueViewList(null, viewType);
        publicItemClient.recalculateQueueViewSizes(queueViews);
        Collection<String> activeUsers = userService.getActiveUserIds();
        return queueViews.stream()
                .map(queueView -> {
                    QueueViewDTO result = modelMapper.map(queueView, QueueViewDTO.class);
                    result.getReviewers().retainAll(activeUsers);
                    result.getSupervisors().retainAll(activeUsers);
                    return result;
                })
                .collect(Collectors.toList());
    }

    public List<QueueViewDTO> createQueue(final QueueCreationDTO creationDTO) throws IncorrectConfigurationException {
        log.info("Trying to create a queue: [{}]", creationDTO);
        Queue queue = modelMapper.map(creationDTO, Queue.class);
        checkQueueAssignments(queue);

        OffsetDateTime created = OffsetDateTime.now();

        String queueId = UUID.randomUUID().toString();
        queue.setId(queueId);
        queue.setCreated(created);
        queue.setActive(true);
        QueueViewUtility.addViewToQueue(queue, QueueViewType.REGULAR);
        if (creationDTO.getAllowedLabels().contains(Label.ESCALATE)) {
            QueueViewUtility.addViewToQueue(queue, QueueViewType.ESCALATION);
        }

        publicQueueClient.createQueue(queue);
        streamService.sendQueueUpdateEvent(queue);

        // trigger the task for assignment recalculation
        taskService.forceTaskRunByName(ITEM_ASSIGNMENT_TASK_NAME);

        return QueueViewUtility.getAllQueueViews(queue, true)
                .map(qv -> modelMapper.map(qv, QueueViewDTO.class))
                .collect(Collectors.toList());
    }

    @Retry(name = "cosmosOptimisticUpdate")
    public List<QueueViewDTO> updateQueue(final String id, final QueueConfigurationDTO parameters)
            throws NotFoundException, IncorrectConfigurationException {
        log.info("Trying to update queue by ID [{}]: [{}]", id, parameters);
        // get queues
        QueueView queueView = publicQueueClient.getActiveQueueView(id);
        Queue queue = queueView.getQueue();
        Queue oldQueue = SerializationUtils.clone(queue);

        // prepare changes
        modelMapper.map(parameters, queue);
        checkQueueAssignments(queue);

        // update info in the storage
        publicQueueClient.updateQueue(queue, oldQueue);
        streamService.sendQueueUpdateEvent(queue);

        return QueueViewUtility.getAllQueueViews(queue, true)
                .map(qv -> modelMapper.map(qv, QueueViewDTO.class))
                .collect(Collectors.toList());
    }

    @Retry(name = "cosmosOptimisticUpdate")
    public List<QueueViewDTO> deleteQueue(final String id) throws NotFoundException, IncorrectConditionException, IncorrectConfigurationException {
        log.info("Trying to delete queue by ID [{}].", id);
        // get queues
        QueueView queueView = publicQueueClient.getActiveQueueView(id);
        Queue queue = queueView.getQueue();
        Queue oldQueue = SerializationUtils.clone(queue);

        // check conditions
        if (queue.isResidual()) {
            throw new IncorrectConditionException(
                    String.format("Residual queue [%s] can't be deleted", queue.getId()));
        }

        // prepare changes
        queue.deactivate(defaultTtl.toSeconds());

        // update info in the storage
        publicQueueClient.updateQueue(queue, oldQueue);
        streamService.sendQueueUpdateEvent(queue);

        // trigger the task for assignment recalculation
        taskService.forceTaskRunByName(ITEM_ASSIGNMENT_TASK_NAME);

        return QueueViewUtility.getAllQueueViews(queue, true)
                .map(qv -> modelMapper.map(qv, QueueViewDTO.class))
                .collect(Collectors.toList());
    }

    public Map<String, QueueOverviewDTO> getQueueOverviews(
            final Duration timeToTimeout,
            final Duration timeToSla) throws BusyException {
        OffsetDateTime now = OffsetDateTime.now();
        Collection<QueueView> allQueues = publicQueueClient.getActiveQueueViewList(null, QueueViewType.DIRECT);
        Map<String, Long> lockedItemsCount = publicItemClient.countLockedItemsPerQueues(allQueues);
        Map<String, Integer> itemsNearToTimeoutCount = countItemsNearToTimeoutByQueues(allQueues, now, timeToTimeout);
        Map<String, Integer> itemsNearToSlaCount = countItemsNearToSlaByQueues(allQueues, now, timeToSla);

        Map<String, QueueOverviewDTO> result = new HashMap<>();
        allQueues.stream()
                .map(QueueView::getQueueId)
                .forEach(queueId -> {
                    QueueOverviewDTO.QueueOverviewDTOBuilder builder = QueueOverviewDTO.builder()
                            .lockedItemsCount(lockedItemsCount.getOrDefault(queueId, 0L))
                            .nearToTimeoutCount(itemsNearToTimeoutCount.getOrDefault(queueId, 0))
                            .nearToSlaCount(itemsNearToSlaCount.getOrDefault(queueId, 0));
                    result.put(queueId, builder.build());
                });
        return result;
    }

    private Map<String, Integer> countItemsNearToTimeoutByQueues(
            final Collection<QueueView> queueViews,
            final OffsetDateTime now,
            final Duration timeToTimeout) {
        OffsetDateTime lockedBeforeAreNearToTimeout = getTimeoutThreshold(timeToTimeout, now);
        return queueViews.stream()
                .collect(Collectors.toMap(
                        QueueView::getQueueId,
                        queueView -> publicItemClient.countItemsLockedBeforeByQueue(
                                queueView,
                                lockedBeforeAreNearToTimeout)));
    }

    private Map<String, Integer> countItemsNearToSlaByQueues(
            final Collection<QueueView> queueViews,
            final OffsetDateTime now,
            final Duration timeToSla) {
        return queueViews.stream()
                .filter(q -> q.getProcessingDeadline() != null)
                .collect(Collectors.toMap(
                        QueueView::getQueueId,
                        queueView -> publicItemClient.countItemsImportedBeforeByQueue(
                                queueView,
                                getSLAThreshold(timeToSla, queueView, now))));
    }

    public PageableCollection<Item> getItemsForOverviewByQueueView(
            final String queueViewId,
            final Duration timeToTimeout,
            final Duration timeToSla,
            final int size,
            final String continuationToken)
            throws NotFoundException, BusyException {
        QueueView queueView = publicQueueClient.getActiveQueueView(queueViewId);
        OffsetDateTime now = OffsetDateTime.now();

        OffsetDateTime importedBeforeAreNearToSLA = getSLAThreshold(timeToSla, queueView, now);
        OffsetDateTime lockedBeforeAreNearToTimeout = getTimeoutThreshold(timeToTimeout, now);

        return publicItemClient.getUrgentItemPageableList(
                queueView,
                importedBeforeAreNearToSLA,
                lockedBeforeAreNearToTimeout,
                size,
                continuationToken);
    }

    private OffsetDateTime getSLAThreshold(final Duration timeToSla, final QueueView queueView, final OffsetDateTime now) {
        OffsetDateTime importedBeforeAreNearToSLA = null;
        Duration deadlineDuration = queueView.getProcessingDeadline();
        if (deadlineDuration != null) {
            Duration reserveToAllowedSLA = Objects.requireNonNullElse(timeToSla, defaultTimeToSLA);
            OffsetDateTime minAllowedSLATime = now.plus(reserveToAllowedSLA);
            importedBeforeAreNearToSLA = minAllowedSLATime.minus(deadlineDuration);
        }
        return importedBeforeAreNearToSLA;
    }

    private OffsetDateTime getTimeoutThreshold(final Duration timeToTimeout, final OffsetDateTime now) {
        Duration reserveToAllowedTimeout = Objects.requireNonNullElse(timeToTimeout, defaultTimeToTimeout);
        OffsetDateTime minAllowedTimeoutTime = now.plus(reserveToAllowedTimeout);
        return minAllowedTimeoutTime.minus(unlockTimeout);
    }

    private void checkQueueAssignments(final Queue queue) throws IncorrectConfigurationException {
        if (queue.getSupervisors() == null || queue.getSupervisors().isEmpty()) {
            throw new IncorrectConfigurationException(MESSAGE_NO_SUPERVISORS);
        }

        if (!SetUtils.intersection(
                Objects.requireNonNullElse(queue.getReviewers(), Collections.emptySet()),
                queue.getSupervisors()).isEmpty()) {
            throw new IncorrectConfigurationException(MESSAGE_INCORRECT_QUEUE_ASSIGNMENT);
        }

        if (!userService.checkUsersExist(SetUtils.union(
                Objects.requireNonNullElse(queue.getReviewers(), Collections.emptySet()),
                Objects.requireNonNullElse(queue.getSupervisors(), Collections.emptySet())))) {
            throw new IncorrectConfigurationException(MESSAGE_INCORRECT_USER);
        }
    }
}
