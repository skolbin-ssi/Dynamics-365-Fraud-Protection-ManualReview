package com.griddynamics.msd365fp.manualreview.queues.repository;

import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public interface ItemRepositoryCustomMethods {


    Map<String, Integer> countQueueViewSizes(
            @NonNull final Set<String> queueIds,
            @NonNull final QueueViewType viewType);

    int countResidualQueueViewSize(@NonNull final QueueViewType viewType);

    PageableCollection<Item> findActiveItemsByQueueIdsEmpty(
            @NonNull final QueueViewType viewType,
            final int size,
            @Nullable final String continuationToken,
            @NonNull final Sort.Order order,
            @Nullable final Boolean locked,
            @Nullable final Boolean held);

    PageableCollection<Item> findActiveItemsRelatedToQueue(
            final String queueId,
            final Integer size,
            final String continuationToken);

    PageableCollection<Item> findActiveItemsByQueueView(
            @NonNull final QueueViewType viewType,
            @NonNull final String queueId,
            final int size,
            @Nullable final String continuationToken,
            @NonNull final Sort.Order order,
            @Nullable final Boolean locked,
            @Nullable final Boolean held);

    PageableCollection<String> findUnenrichedItemIds(
            final int size,
            final String continuationToken);

    PageableCollection<String> findUnenrichedItemIds(
            final OffsetDateTime updatedUpperBoundary,
            final int size,
            final String continuationToken);

    Optional<Item> findItemById(
            @NonNull String id,
            @Nullable Boolean active,
            @Nullable final QueueViewType viewType,
            @Nullable final String queueId,
            @Nullable final Boolean queueIsResidual);

    PageableCollection<Item> findLockedItems(
            @Nullable final String ownerId,
            @Nullable final String queueViewId,
            @NonNull final Integer size,
            @Nullable final String continuationToken);

    PageableCollection<Item> findUnassignedItemsByItemFilters(
            final String id,
            final Set<ItemFilter> itemFilters,
            final OffsetDateTime enrichedSince,
            final int size,
            final String continuationToken,
            final Sort.Order order,
            final boolean includeLocked);

    Integer countActiveItemsUpdatedAfter(final OffsetDateTime time);

    Integer countActiveItemsByItemFilters(final Set<ItemFilter> itemFilters);

    int countActiveItems();

    int countActiveItemsByQueueIdsEmpty();

    Map<String, Long> countLockedItemsPerQueues(Collection<String> queueIds);

    Integer countItemsImportedBeforeByQueue(
            String queueId,
            OffsetDateTime importedBefore);

    Integer countItemsLockedBeforeByQueue(
            String queueId,
            OffsetDateTime lockedBefore);

    PageableCollection<Item> findUrgentItems(
            @NonNull final QueueViewType viewType,
            @NonNull final String queueId,
            @Nullable OffsetDateTime importedBefore,
            @Nullable OffsetDateTime lockedBefore,
            int size,
            String continuationToken);

    Set<String> findAllByFilterField(ItemFilter.FilterField field);
}
