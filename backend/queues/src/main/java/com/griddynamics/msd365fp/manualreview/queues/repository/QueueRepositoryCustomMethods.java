package com.griddynamics.msd365fp.manualreview.queues.repository;

import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import org.springframework.lang.NonNull;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface QueueRepositoryCustomMethods {

    PageableCollection<Queue> getQueueList(
            Boolean active,
            Boolean residual,
            int pageSize,
            String continuationToken);

    Optional<Queue> getActiveQueueByIdOrViewId(@NonNull final String id);

    PageableCollection<Queue> findQueuesCreatedOrDeletedAfter(
            final OffsetDateTime dateTime,
            final int pageSize,
            final String continuationToken);
}
