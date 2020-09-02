package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.cosmos.utilities.PageProcessingUtility;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.EmptySourceException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.repository.ItemRepository;
import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.prepost.PreFilter;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class PublicItemClient {

    private final ItemRepository itemRepository;


    @PostFilter("@dataSecurityService.checkPermissionForItemReading(authentication, filterObject, #queueView)")
    public PageableCollection<Item> getActiveItemPageableList(
            @NonNull QueueView queueView,
            int pageSize,
            @Nullable String continuationToken) throws BusyException {
        return PageProcessingUtility.getNotEmptyPage(
                continuationToken,
                continuation -> {
                    if (queueView.isResidual()) {
                        return itemRepository.findActiveItemsByQueueIdsEmpty(
                                queueView.getViewType(),
                                pageSize,
                                continuation,
                                new Sort.Order(queueView.getSorting().getOrder(), queueView.getSorting().getField().getPath()),
                                null,
                                null);
                    } else {
                        return itemRepository.findActiveItemsByQueueView(
                                queueView.getViewType(),
                                queueView.getQueueId(),
                                pageSize,
                                continuation,
                                new Sort.Order(queueView.getSorting().getOrder(), queueView.getSorting().getField().getPath()),
                                null,
                                null);
                    }
                });
    }


    @PostFilter("@dataSecurityService.checkPermissionForItemReading(authentication, filterObject, #queueView)")
    public PageableCollection<Item> getLockedItemPageableList(
            @Nullable String ownerId,
            @Nullable QueueView queueView,
            int pageSize,
            @Nullable String continuationToken) throws BusyException {
        return PageProcessingUtility.getNotEmptyPage(
                continuationToken,
                continuation -> itemRepository.findLockedItems(
                        ownerId,
                        queueView == null ? null : queueView.getViewId(),
                        pageSize,
                        continuation));
    }


    @PostFilter("@dataSecurityService.checkPermissionForItemReading(authentication, filterObject, #queueView)")
    public PageableCollection<Item> getUrgentItemPageableList(
            @NonNull QueueView queueView,
            @Nullable OffsetDateTime importedBefore,
            @Nullable OffsetDateTime lockedBefore,
            int pageSize,
            @Nullable String continuationToken) throws BusyException {
        return PageProcessingUtility.getNotEmptyPage(
                continuationToken,
                continuation -> itemRepository.findUrgentItems(
                        queueView.getViewType(),
                        queueView.getQueueId(),
                        importedBefore,
                        lockedBefore,
                        pageSize,
                        continuation));
    }


    @PostAuthorize("@dataSecurityService.checkPermissionForItemReading(authentication, returnObject, #queueView)")
    public Item getActiveItem(
            @NonNull String id,
            @Nullable QueueView queueView) throws NotFoundException {
        return itemRepository
                .findItemById(
                        id,
                        true,
                        queueView == null ? null : queueView.getViewType(),
                        queueView == null ? null : queueView.getQueueId(),
                        queueView == null ? null : queueView.isResidual())
                .orElseThrow(() -> new NotFoundException(MESSAGE_ITEM_NOT_FOUND));
    }


    @PostAuthorize("@dataSecurityService.checkPermissionForItemReading(authentication, returnObject, #queueView)")
    public Item getFirstFreeActiveItem(@NonNull QueueView queueView) throws BusyException, EmptySourceException {
        PageableCollection<Item> result;
        if (queueView.isResidual()) {
            result = PageProcessingUtility.getNotEmptyPage(
                    TOP_ELEMENT_IN_CONTAINER_CONTINUATION,
                    continuation -> itemRepository.findActiveItemsByQueueIdsEmpty(
                            queueView.getViewType(),
                            TOP_ELEMENT_IN_CONTAINER_PAGE_SIZE,
                            continuation,
                            new Sort.Order(queueView.getSorting().getOrder(), queueView.getSorting().getField().getPath()),
                            false,
                            false));
        } else {
            result = PageProcessingUtility.getNotEmptyPage(
                    TOP_ELEMENT_IN_CONTAINER_CONTINUATION,
                    continuation -> itemRepository.findActiveItemsByQueueView(
                            queueView.getViewType(),
                            queueView.getQueueId(),
                            TOP_ELEMENT_IN_CONTAINER_PAGE_SIZE,
                            continuation,
                            new Sort.Order(queueView.getSorting().getOrder(), queueView.getSorting().getField().getPath()),
                            false,
                            false));
        }
        if (result.getSize() < 1) throw new EmptySourceException();
        return result.getValues().iterator().next();
    }


    @PreAuthorize("@dataSecurityService.checkPermissionForItemUpdate(authentication, #oldVersion)")
    public void updateItem(@NonNull Item newVersion, @NonNull Item oldVersion) {
        itemRepository.save(newVersion);
        if (newVersion.getLock().getOwnerId() == null && oldVersion.getLock().getOwnerId() != null) {
            log.info("Item [{}] has been unlocked from queue [{}] by [{}].",
                    newVersion.getId(), oldVersion.getLock().getQueueId(), oldVersion.getLock().getOwnerId());
        } else if (!newVersion.isActive() && newVersion.getLabel().getValue() != null
                && newVersion.getLabel().getValue().isFormsResolution()) {
            log.info("Item [{}] has been labeled with resolution label [{}] in queue [{}] by [{}].",
                    newVersion.getId(), newVersion.getLabel().getValue(), newVersion.getLabel().getQueueId(),
                    newVersion.getLabel().getAuthorId());
        } else if (newVersion.getEscalation() != null) {
            log.info("Item [{}] has been labeled with label [{}] in queue [{}] by [{}].",
                    newVersion.getId(), newVersion.getLabel().getValue(), newVersion.getLabel().getQueueId(),
                    newVersion.getLabel().getAuthorId());
        } else if (newVersion.getTags().size() > oldVersion.getTags().size()) {
            log.info("Item [{}] acquired new tag: [{}]",
                    newVersion.getId(), CollectionUtils.subtract(newVersion.getTags(), oldVersion.getTags()));
        } else if (newVersion.getTags().size() < oldVersion.getTags().size()) {
            log.info("Item [{}] tag has been removed: [{}]",
                    newVersion.getId(), CollectionUtils.subtract(oldVersion.getTags(), newVersion.getTags()));
        } else if (newVersion.getNotes().size() > oldVersion.getTags().size()) {
            log.info("Item [{}] acquired new note: [{}]",
                    newVersion.getId(), CollectionUtils.subtract(newVersion.getNotes(), oldVersion.getNotes()));
        } else if (newVersion.getNotes().size() < oldVersion.getTags().size()) {
            log.info("Item [{}] note has been removed: [{}]",
                    newVersion.getId(), CollectionUtils.subtract(oldVersion.getNotes(), newVersion.getNotes()));
        } else {
            log.info("Item [{}] has been modified.", newVersion.getId());
        }
    }


    @PreAuthorize("@dataSecurityService.checkPermissionForItemLock(authentication, #item, #queueView)")
    public void lockItem(@NonNull QueueView queueView, @NonNull Item item) {
        item.lock(queueView.getQueueId(), queueView.getViewId(), UserPrincipalUtility.getUserId());
        itemRepository.save(item);
        log.info("Item [{}] has been locked in queue view [{}].", item.getId(), queueView.getViewId());
    }


    @PreFilter("@dataSecurityService.checkPermissionForQueueViewReading(authentication, filterObject)")
    public void recalculateQueueViewSizes(Collection<QueueView> queueViews) {
        Map<QueueViewType, List<QueueView>> listsByViewTypes = queueViews.stream()
                .collect(Collectors.groupingBy(QueueView::getViewType));

        listsByViewTypes.forEach((type, queueViewSubList) -> {

            Set<QueueView> assignableQueues = queueViewSubList.stream().filter(q -> !q.isResidual()).collect(Collectors.toSet());
            if (!assignableQueues.isEmpty()) {
                Map<String, Integer> sizes = itemRepository.countQueueViewSizes(
                        assignableQueues.stream().map(QueueView::getQueueId).collect(Collectors.toSet()),
                        type);
                assignableQueues.forEach(queueView -> {
                    Integer newSize = sizes.getOrDefault(queueView.getQueueId(), 0);
                    log.debug("Revising size of queue view [{}] from [{}] to [{}].",
                            queueView.getViewId(), queueView.getSize(), newSize);
                    queueView.setSize(newSize);
                });
            }

            Set<QueueView> residualQueues = queueViewSubList.stream().filter(QueueView::isResidual).collect(Collectors.toSet());
            if (!residualQueues.isEmpty()) {
                int size = itemRepository.countResidualQueueViewSize(type);
                residualQueues.forEach(queue -> {
                    log.debug("Revising size of the residual queue [{}] from [{}] to [{}].",
                            RESIDUAL_QUEUE_NAME, queue.getSize(), size);
                    queue.setSize(size);
                });
            }

        });

    }

    @PreAuthorize("@dataSecurityService.checkPermissionForQueueViewReading(authentication, #queueView)")
    public Integer countItemsImportedBeforeByQueue(
            QueueView queueView,
            OffsetDateTime importedBefore) {
        return itemRepository.countItemsImportedBeforeByQueue(queueView.getQueueId(), importedBefore);
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForQueueViewReading(authentication, #queueView)")
    public Integer countItemsLockedBeforeByQueue(
            QueueView queueView,
            OffsetDateTime lockedBefore) {
        return itemRepository.countItemsLockedBeforeByQueue(queueView.getQueueId(), lockedBefore);
    }

    @PreFilter("@dataSecurityService.checkPermissionForQueueViewReading(authentication, filterObject)")
    public Map<String, Long> countLockedItemsPerQueues(Collection<QueueView> queueViews) {
        return itemRepository.countLockedItemsPerQueues(queueViews.stream().map(QueueView::getQueueId).collect(Collectors.toSet()));
    }
}
