package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.ItemLock;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueSortSettings;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.griddynamics.msd365fp.manualreview.queues.repository.ItemRepository;
import com.griddynamics.msd365fp.manualreview.queues.repository.QueueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.*;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DEFAULT_QUEUE_PAGE_SIZE;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QueueServiceTest {

    private static final OffsetDateTime QUEUE_CREATE_DATE_TIME = OffsetDateTime.parse("2007-12-03T10:15:30+01:00");
    private static final String TEST_QUEUE_ID = "11111111-1111-1111-1111-111111111111";
    private static final String TEST_REVIEWER_ID = "22222222-2222-2222-2222-222222222222";

    private QueueService queueService;

    @Mock
    private StreamService streamService;
    @Mock
    private ItemRepository itemRepository;
    @Mock
    private QueueRepository queueRepository;
    @Mock
    private UserService userService;

    @Captor
    private ArgumentCaptor<Queue> queueCaptor;

    @BeforeEach
    public void setUp() {
        queueService = new QueueService(queueRepository, itemRepository, userService, streamService);
    }

    /**
     * {@link QueueService#fetchSizesForQueues()} should create events via
     * {@link StreamService#sendQueueSizeEvent(Queue)} method.
     */
    //TODO: enable after escalation flow rework
    @Disabled("enable after escalation flow rework")
    @Test
    public void fetchSizesForQueuesSendsEvents() throws BusyException {
        String firstQueueId = TEST_QUEUE_ID;
        String secondQueueId = TEST_QUEUE_ID.replaceFirst("1", "2");
        Queue queue = Queue.builder()
                .active(true)
                .id(firstQueueId)
                .created(QUEUE_CREATE_DATE_TIME)
                .name("Common Queue")
                .residual(false)
                .sorting(new QueueSortSettings())
                .reviewers(new HashSet<>(Collections.singleton(TEST_REVIEWER_ID)))
                .filters(Collections.singleton(mock(ItemFilter.class)))
                .build();
        Queue residualQueue = Queue.builder()
                .active(true)
                .id(secondQueueId)
                .created(QUEUE_CREATE_DATE_TIME)
                .name("Residual Queue")
                .residual(true)
                .sorting(new QueueSortSettings())
                .reviewers(new HashSet<>(Collections.singleton(TEST_REVIEWER_ID)))
                .build();

        when(queueRepository.getQueueList(eq(true), isNull(), eq(DEFAULT_QUEUE_PAGE_SIZE), isNull()))
                .thenReturn(new PageableCollection<>(Arrays.asList(queue, residualQueue), null));
        when(itemRepository.countActiveItemsByQueueIdsEmpty())
                .thenReturn(0);
        when(itemRepository.countActiveItemsByItemFilters(any()))
                .thenReturn(2);

        queueService.fetchSizesForQueues();

        verify(streamService, times(2)).sendQueueSizeEvent(queueCaptor.capture());

        // Verify both queues send events
        assertEquals(0, queueCaptor.getAllValues().stream().filter(Queue::isResidual).findFirst().get().getSize());
        assertEquals(2, queueCaptor.getAllValues().stream().filter(q -> !q.isResidual()).findFirst().get().getSize());
    }

}
