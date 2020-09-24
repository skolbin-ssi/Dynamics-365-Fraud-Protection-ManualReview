// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.ItemLock;
import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.ExplorerEntity;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import com.griddynamics.msd365fp.manualreview.queues.config.DFPModelMapperConfig;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueSortSettings;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.griddynamics.msd365fp.manualreview.queues.repository.ItemRepository;
import com.griddynamics.msd365fp.manualreview.queues.repository.QueueRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DEFAULT_ITEM_PAGE_SIZE;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ItemServiceTest {

    private static final String UNLOCK_TIMEOUT = "PT5M";
    private static final OffsetDateTime ITEM_IMPORT_DATE_TIME = OffsetDateTime.parse("2007-12-03T10:15:30+01:00");
    private static final OffsetDateTime ITEM_ENRICH_DATE_TIME = ITEM_IMPORT_DATE_TIME.plusMinutes(5);
    private static final OffsetDateTime ITEM_LOCK_DATE_TIME = ITEM_ENRICH_DATE_TIME.plusMinutes(5);
    private static final OffsetDateTime QUEUE_CREATE_DATE_TIME = OffsetDateTime.parse("2007-12-03T10:15:30+01:00");
    private static final String TEST_ITEM_ID = "00000000-0000-0000-0000-000000000000";
    private static final String TEST_QUEUE_ID = "11111111-1111-1111-1111-111111111111";
    private static final String TEST_REVIEWER_ID = "22222222-2222-2222-2222-222222222222";

    private ItemService itemService;

    @Mock
    private StreamService streamService;
    @Mock
    private ItemRepository itemRepository;
    @Mock
    private QueueRepository queueRepository;
    @Mock
    private DFPExplorerService dfpExplorerService;

    @Captor
    private ArgumentCaptor<LockActionType> lockActionTypeCaptor;
    @Captor
    private ArgumentCaptor<Item> itemCaptor;
    @Captor
    private ArgumentCaptor<ItemLock> itemLockCaptor;
    @Captor
    private ArgumentCaptor<Queue> queueCaptor;
    @Captor
    private ArgumentCaptor<Set<String>> stringSetCaptor;

    @BeforeEach
    public void setUp() {
        ModelMapper dfpModelMapper = new DFPModelMapperConfig().dfpModelMapper();
        itemService = new ItemService(streamService, itemRepository, queueRepository, dfpExplorerService);
        itemService.setDfpModelMapper(dfpModelMapper);
        itemService.setThisService(itemService);
        itemService.setUnlockTimeout(Duration.parse(UNLOCK_TIMEOUT));
    }

    @Test
    @Disabled
    void enrichItemDoesNotSendEvent() {
        when(itemRepository.findById(anyString())).thenReturn(Optional.of(mock(Item.class)));

        itemService.enrichItem(TEST_ITEM_ID, mock(ExplorerEntity.class));

        verifyNoInteractions(streamService);
    }

    /**
     * {@link ItemService#unlockItemsByTimeout()} should create an event with
     * {@link LockActionType#TIMEOUT_RELEASE}.
     */
    @Test
    @Disabled
    void unlockItemByTimeoutSendsEvent() {
        Item item = Item.builder()
                .active(true)
                .id(TEST_ITEM_ID)
                .queueIds(Collections.singleton(TEST_QUEUE_ID))
                .reviewers(new HashSet<>(Collections.singleton(TEST_REVIEWER_ID)))
                .imported(ITEM_IMPORT_DATE_TIME)
                .enriched(ITEM_ENRICH_DATE_TIME)
                .updated(ITEM_ENRICH_DATE_TIME)
                .lock(ItemLock.builder()
                        .locked(ITEM_LOCK_DATE_TIME)
                        .ownerId(TEST_REVIEWER_ID)
                        .queueId(TEST_QUEUE_ID)
                        .build())
                .build();
        when(itemRepository.save(any(Item.class)))
                .thenReturn(item);
        when(itemRepository.findByActiveTrueAndLock_LockedBefore(anyLong()))
                .thenReturn(Collections.singletonList(item));
        when(itemRepository.findByIdAndActiveTrueAndLock_OwnerIdNotNull(eq(TEST_ITEM_ID)))
                .thenReturn(Collections.singleton(item));

        itemService.unlockItemsByTimeout();

        verify(streamService, times(1))
                .sendItemLockEvent(itemCaptor.capture(), itemLockCaptor.capture(), lockActionTypeCaptor.capture());

        assertEquals(new ItemLock(), itemCaptor.getValue().getLock(), "Lock should have all fields nullified.");
        assertEquals(item.getLock(), itemLockCaptor.getValue());
        assertEquals(LockActionType.TIMEOUT_RELEASE, lockActionTypeCaptor.getValue());
    }

    /**
     * {@link ItemService#reconcileAllItemAssignments} should create an event via
     * {@link StreamService#sendItemAssignmentEvent(Item, Set)} method.
     */
    @Test
    @Disabled
    void reconcileAllAssignmentsSendsEvent() {
        String firstItemId = TEST_ITEM_ID;
        String secondItemId = TEST_ITEM_ID.replaceFirst("0", "1");
        String firstQueueId = TEST_QUEUE_ID;
        String secondQueueId = TEST_QUEUE_ID.replaceFirst("1", "2");
        Item firstItem = Item.builder()
                .active(true)
                .id(firstItemId)
                .reviewers(new HashSet<>(Collections.singleton(TEST_REVIEWER_ID)))
                .imported(ITEM_IMPORT_DATE_TIME)
                .enriched(ITEM_ENRICH_DATE_TIME)
                .updated(ITEM_ENRICH_DATE_TIME)
                .lock(new ItemLock())
                .queueIds(new HashSet<>(Collections.singleton(secondQueueId)))
                .build();
        Item secondItem = Item.builder()
                .active(true)
                .id(secondItemId)
                .reviewers(new HashSet<>(Collections.singleton(TEST_REVIEWER_ID)))
                .imported(ITEM_IMPORT_DATE_TIME)
                .enriched(ITEM_ENRICH_DATE_TIME)
                .updated(ITEM_ENRICH_DATE_TIME)
                .lock(new ItemLock())
                .build();
        Queue queue = Queue.builder()
                .active(true)
                .id(firstQueueId)
                .created(QUEUE_CREATE_DATE_TIME)
                .allowedLabels(Collections.singleton(Label.ESCALATE))
                .name("Common Queue")
                .residual(false)
                .sorting(new QueueSortSettings())
                .reviewers(new HashSet<>(Collections.singleton(TEST_REVIEWER_ID)))
                .filters(Collections.singleton(mock(ItemFilter.class)))
                .build();
        Queue deletedQueue = Queue.builder()
                .active(false)
                .id(secondQueueId)
                .created(QUEUE_CREATE_DATE_TIME)
                .allowedLabels(Collections.singleton(Label.ESCALATE))
                .name("Common Queue 2")
                .residual(false)
                .sorting(new QueueSortSettings())
                .reviewers(new HashSet<>(Collections.singleton(TEST_REVIEWER_ID)))
                .build();

        when(queueRepository.findAll())
                .thenReturn(Arrays.asList(queue, deletedQueue));
        when(itemRepository.findUnassignedItemsByItemFilters(eq(firstQueueId), eq(queue.getFilters()), isNull(), eq(DEFAULT_ITEM_PAGE_SIZE), isNull(), any(), anyBoolean()))
                .thenReturn(new PageableCollection<>(Collections.singleton(firstItem), null));
        when(itemRepository.findActiveItemsRelatedToQueue(eq(secondQueueId), eq(DEFAULT_ITEM_PAGE_SIZE), isNull()))
                .thenReturn(new PageableCollection<>(Collections.singleton(secondItem), null));

        itemService.reconcileAllItemAssignments();

        verify(streamService, times(2))
                .sendItemAssignmentEvent(itemCaptor.capture(), stringSetCaptor.capture());

        // Verify items in both events
        assertTrue(itemCaptor.getAllValues().stream().allMatch(Objects::nonNull));
        Assertions.assertThat(itemCaptor.getAllValues()).containsExactly(firstItem, secondItem);

        assertEquals(2, queueCaptor.getAllValues().stream().filter(Objects::nonNull).count());
        Assertions.assertThat(queueCaptor.getAllValues()).containsExactly(null, queue, deletedQueue, null);
    }

}
