package com.griddynamics.msd365fp.manualreview.analytics.service;

import com.griddynamics.msd365fp.manualreview.analytics.config.ModelMapperConfig;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.*;
import com.griddynamics.msd365fp.manualreview.analytics.repository.*;
import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemAssignmentEvent;
import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemLockEvent;
import com.griddynamics.msd365fp.manualreview.model.event.internal.QueueSizeUpdateEvent;
import com.griddynamics.msd365fp.manualreview.model.event.type.ItemPlacementType;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StreamServiceTest {

    private static final OffsetDateTime ITEM_IMPORT_DATE_TIME = OffsetDateTime.parse("2007-12-03T10:15:30+01:00");
    private static final OffsetDateTime ITEM_ENRICH_DATE_TIME = OffsetDateTime.parse("2007-12-03T10:20:30+01:00");
    private static final OffsetDateTime QUEUE_UPDATE_DATE_TIME = OffsetDateTime.parse("2007-12-03T10:25:30+01:00");
    private static final String TEST_ITEM_ID = "00000000-0000-0000-0000-000000000000";
    private static final String TEST_QUEUE_ID = "11111111-1111-1111-1111-111111111111";
    private static final String TEST_REVIEWER_ID = "22222222-2222-2222-2222-222222222222";

    @Mock
    ResolutionRepository resolutionRepository;
    @Mock
    ItemLockActivityRepository itemLockActivityRepository;
    @Mock
    CollectedQueueInfoRepository collectedQueueInfoRepository;
    @Mock
    ItemLabelActivityRepository performanceRepository;
    @Mock
    ItemPlacementActivityRepository itemPlacementActivityRepository;
    @Mock
    QueueSizeCalculationActivityRepository queueSizeCalculationActivityRepository;

    @Captor
    private ArgumentCaptor<Iterable<ItemPlacementActivityEntity>> placementCaptor;
    @Captor
    private ArgumentCaptor<ItemLockActivityEntity> lockCaptor;
    @Captor
    private ArgumentCaptor<ItemLabelActivityEntity> performanceCaptor;
    @Captor
    private ArgumentCaptor<CollectedQueueInfoEntity> queueInfoCaptor;
    @Captor
    private ArgumentCaptor<Resolution> resolutionCaptor;
    @Captor
    private ArgumentCaptor<QueueSizeCalculationActivityEntity> queueSizeCalculationCaptor;

    private StreamService streamService;

    @BeforeEach
    public void setUp() {
        ModelMapper modelMapper = new ModelMapperConfig().modelMapper();
        this.streamService = new StreamService(resolutionRepository, itemLockActivityRepository,
                collectedQueueInfoRepository, queueSizeCalculationActivityRepository, performanceRepository,
                itemPlacementActivityRepository, modelMapper);
    }

    /**
     * Item which apply the queue filter is assigned with new queueId.
     * Item was enriched and goes to the queue.
     */
    @Test
    @Disabled
    void createQueueTest() {
        // Create event
        OffsetDateTime actioned = ITEM_IMPORT_DATE_TIME.plusDays(1);
        ItemAssignmentEvent event = ItemAssignmentEvent.builder()
                .id(TEST_ITEM_ID)
                .newQueueIds(Collections.singleton(TEST_QUEUE_ID))
                .oldQueueIds(Collections.emptySet())
                .actioned(ITEM_ENRICH_DATE_TIME)
                .build();

        // Separate event into actions
        streamService.getItemAssignmentEvent(event);

        // Check how much times each repository has been called and capture saved result
        verify(itemPlacementActivityRepository, times(2)).saveAll(placementCaptor.capture());

        // Verify there was two items saved
        Set<String> results = StreamSupport.stream(placementCaptor.getValue().spliterator(), false)
                .map(ItemPlacementActivityEntity::getId)
                .collect(Collectors.toSet());

        // Verify the contents of the saved result and their amount
        assertTrue(results.contains(TEST_ITEM_ID + "-ADDED-" + actioned.toString()));
        assertTrue(results.contains(TEST_ITEM_ID + "-" + TEST_QUEUE_ID + "-" + actioned.toString()));
        assertEquals(2, results.size());
    }

    /**
     * User clicks start review
     */
    @Test
    @Disabled
    void startReviewTest() {
        // Create event
        OffsetDateTime actioned = ITEM_IMPORT_DATE_TIME.plusDays(1);
        ItemLockEvent event = ItemLockEvent.builder()
                .locked(actioned)
                .id(TEST_ITEM_ID)
                .queueId(TEST_QUEUE_ID)
                .ownerId(TEST_REVIEWER_ID)
                .actionType(LockActionType.SETUP)
                .build();

        // Separate event into actions
        streamService.getItemLockEvent(event);

        // Check how much times each repository has been called and capture saved result
        verify(itemLockActivityRepository, times(1)).save(lockCaptor.capture());

        // Check no more repositories actions were made
        verifyNoInteractions(resolutionRepository);
        verifyNoInteractions(itemPlacementActivityRepository);
        verifyNoInteractions(performanceRepository);
        verifyNoInteractions(collectedQueueInfoRepository);

        // Verify the contents of the saved result
        ItemLockActivityEntity actualResult = lockCaptor.getValue();
        assertEquals(TEST_ITEM_ID + ":" + actioned.toString(), actualResult.getId());
    }

    /**
     * User labels an item with resolution label
     */
    @Test
    @Disabled
    void resolutionLabelingTest() {
        // Create event
        String firstQueueId = TEST_QUEUE_ID;
        String secondQueueId = TEST_QUEUE_ID.replaceFirst("1", "2");
        String thirdQueueId = TEST_QUEUE_ID.replaceFirst("1", "3");
        OffsetDateTime actioned = ITEM_IMPORT_DATE_TIME.plusDays(1);
        ItemAssignmentEvent event = ItemAssignmentEvent.builder()
                .id(TEST_ITEM_ID)
                .newQueueIds(Collections.singleton(TEST_QUEUE_ID))
                .oldQueueIds(Collections.emptySet())
                .actioned(ITEM_ENRICH_DATE_TIME)
                .build();

        // Separate event into actions
        streamService.getItemAssignmentEvent(event);

        // Check how much times each repository has been called and capture saved result
        verify(performanceRepository, times(1)).save(performanceCaptor.capture());
        verify(resolutionRepository, times(1)).save(resolutionCaptor.capture());
        verify(itemPlacementActivityRepository, times(1)).saveAll(placementCaptor.capture());
        verify(collectedQueueInfoRepository, times(1)).save(queueInfoCaptor.capture());

        // Check no more repositories actions were made
        verifyNoInteractions(itemLockActivityRepository);

        // Verify the contents of the saved result
        ItemLabelActivityEntity actualResult1 = performanceCaptor.getValue();
        assertEquals(TEST_ITEM_ID, actualResult1.getId());
        assertEquals(Label.ACCEPT, actualResult1.getLabel());

        Resolution actualResult2 = resolutionCaptor.getValue();
        assertEquals(TEST_ITEM_ID, actualResult2.getId());
        assertEquals(Label.ACCEPT, actualResult2.getLabel().getValue());

//        List<ItemPlacementActivityEntity> actualResult3 = new ArrayList<>();
//        placementCaptor.getValue().forEach(actualResult3::add);
//        assertEquals(event.getItem().getQueueIds().size(), actualResult3.size());
//        assertTrue(actualResult3.stream().anyMatch(a -> a.getActionType() == ItemPlacementType.REVIEWED));
//        assertEquals(2L, actualResult3.stream().filter(a -> a.getActionType() == ItemPlacementType.STOLEN).count());
//        assertTrue(actualResult3.stream().allMatch(a -> a.getId().equals(TEST_ITEM_ID + ":" + actioned)));

        CollectedQueueInfoEntity actualResult4 = queueInfoCaptor.getValue();
        assertEquals(firstQueueId, actualResult4.getId());
    }

    /**
     * User labels an item with escalation label
     */
    @Test
    @Disabled
    void escalationLabelingTest() {
        // Create event
        String firstQueueId = TEST_QUEUE_ID;
        String secondQueueId = TEST_QUEUE_ID.replaceFirst("1", "2");
        String thirdQueueId = TEST_QUEUE_ID.replaceFirst("1", "3");
        OffsetDateTime actioned = ITEM_IMPORT_DATE_TIME.plusDays(1);
        ItemAssignmentEvent event = ItemAssignmentEvent.builder()
                .id(TEST_ITEM_ID)
                .newQueueIds(Collections.singleton(TEST_QUEUE_ID))
                .oldQueueIds(Collections.emptySet())
                .actioned(ITEM_ENRICH_DATE_TIME)
                .build();

        // Separate event into actions
        streamService.getItemAssignmentEvent(event);

        // Check how much times each repository has been called and capture saved result
        verify(performanceRepository, times(1)).save(performanceCaptor.capture());
        verify(itemPlacementActivityRepository, times(1)).saveAll(placementCaptor.capture());
        verify(collectedQueueInfoRepository, times(2)).save(queueInfoCaptor.capture());

        // Check no more repositories actions were made
        verifyNoInteractions(itemLockActivityRepository);
        verifyNoInteractions(resolutionRepository);

        // Verify the contents of the saved result
        ItemLabelActivityEntity actualResult1 = performanceCaptor.getValue();
        assertEquals(TEST_ITEM_ID, actualResult1.getId());
        assertEquals(Label.ESCALATE, actualResult1.getLabel());

//        List<ItemPlacementActivityEntity> actualResult3 = new ArrayList<>();
//        placementCaptor.getValue().forEach(actualResult3::add);
//        assertEquals(event.getItem().getQueueIds().size(), actualResult3.size());
//        assertTrue(actualResult3.stream()
//                .anyMatch(a -> a.getActionType() == ItemPlacementType.RELEASED && a.getQueueId().equals(firstQueueId)));
//        assertTrue(actualResult3.stream()
//                .anyMatch(a -> a.getActionType() == ItemPlacementType.STOLEN && a.getQueueId().equals(secondQueueId)));
//        assertTrue(actualResult3.stream()
//                .anyMatch(a -> a.getActionType() == ItemPlacementType.ADDED && a.getQueueId().equals(thirdQueueId)));
//        assertTrue(actualResult3.stream().allMatch(a ->
//                a.getId().equals(TEST_ITEM_ID + ":" + actioned)));

        List<CollectedQueueInfoEntity> actualResult4 = queueInfoCaptor.getAllValues();
        assertEquals(2, actualResult4.size());
        assertFalse(actualResult4.stream().anyMatch(e -> e.getId().equals(secondQueueId)));
    }

    /**
     * User ends reviewing the queue
     */
    @Test
    @Disabled
    void endReviewTest() {
        // Create event
        OffsetDateTime locked = ITEM_IMPORT_DATE_TIME.plusDays(1);
        OffsetDateTime released = locked.plusMinutes(1);
        ItemLockEvent event = ItemLockEvent.builder()
                .released(released)
                .locked(locked)
                .id(TEST_ITEM_ID)
                .queueId(TEST_QUEUE_ID)
                .ownerId(TEST_REVIEWER_ID)
                .actionType(LockActionType.MANUAL_RELEASE)
                .build();

        // Separate event into actions
        streamService.getItemLockEvent(event);

        // Check how much times each repository has been called and capture saved result
        verify(itemLockActivityRepository, times(1)).save(lockCaptor.capture());

        // Check no more repositories actions were made
        verifyNoInteractions(resolutionRepository);
        verifyNoInteractions(itemPlacementActivityRepository);
        verifyNoInteractions(performanceRepository);
        verifyNoInteractions(collectedQueueInfoRepository);

        // Verify the contents of the saved result
        ItemLockActivityEntity actualResult = lockCaptor.getValue();
        assertEquals(TEST_ITEM_ID + ":" + released.toString(), actualResult.getId());
    }

    /**
     * User deletes the queue
     */
    @Test
    @Disabled
    void deleteQueueTest() {
        // Create event
        OffsetDateTime actioned = ITEM_IMPORT_DATE_TIME.plusDays(1);
        ItemAssignmentEvent event = ItemAssignmentEvent.builder()
                .id(TEST_ITEM_ID)
                .newQueueIds(Collections.singleton(TEST_QUEUE_ID))
                .oldQueueIds(Collections.emptySet())
                .actioned(ITEM_ENRICH_DATE_TIME)
                .build();

        // Separate event into actions
        streamService.getItemAssignmentEvent(event);

        // Check how much times each repository has been called and capture saved result
        verify(itemPlacementActivityRepository, times(1)).saveAll(placementCaptor.capture());
        verify(collectedQueueInfoRepository, times(1)).save(queueInfoCaptor.capture());

        // Check no more repositories actions were made
        verifyNoInteractions(itemLockActivityRepository);
        verifyNoInteractions(resolutionRepository);
        verifyNoInteractions(performanceRepository);

        // Verify the contents of the saved result
        Iterator<ItemPlacementActivityEntity> iterator = placementCaptor.getValue().iterator();
        assertTrue(iterator.hasNext());
        ItemPlacementActivityEntity actualResult1 = iterator.next();
        assertFalse(iterator.hasNext());

        assertEquals(TEST_ITEM_ID + ":" + actioned.toString(), actualResult1.getId());
        assertEquals(ItemPlacementType.RELEASED, actualResult1.getType());

        CollectedQueueInfoEntity actualResult2 = queueInfoCaptor.getValue();
        assertEquals(TEST_QUEUE_ID, actualResult2.getId());
    }

    @Test
    @Disabled
    void queueSizeChange() {
        QueueSizeUpdateEvent event = QueueSizeUpdateEvent.builder()
                .id(TEST_QUEUE_ID)
                .size(2)
                .updated(QUEUE_UPDATE_DATE_TIME)
                .build();

        streamService.getQueueSizeUpdateEvent(event);

        verify(queueSizeCalculationActivityRepository).save(queueSizeCalculationCaptor.capture());

        assertEquals(TEST_QUEUE_ID + ":" + QUEUE_UPDATE_DATE_TIME,
                queueSizeCalculationCaptor.getValue().getId());
    }
}
