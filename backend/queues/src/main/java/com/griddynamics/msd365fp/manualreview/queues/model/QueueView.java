// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * The {@link Queue} view.
 * The class reflects the queue settings filtered by view condition.
 * The class must be used in any item processing operations,
 * info retrieving operations and for security checks related
 * to mentioned operations.
 * All getters from this class are required for correct
 * mapping by {@link org.modelmapper.ModelMapper}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SuppressWarnings("unused")
public class QueueView {
    private String viewId;
    private QueueViewType viewType;
    private int size;

    private Queue queue;

    public String getQueueId() {
        return queue.getId();
    }

    public String getName() {
        return queue.getName();
    }

    public OffsetDateTime getCreated() {
        return queue.getCreated();
    }

    public OffsetDateTime getUpdated() {
        return queue.getUpdated();
    }

    public OffsetDateTime getDeleted() {
        return queue.getDeleted();
    }

    public Set<String> getReviewers() {
        return queue.getReviewers();
    }

    public Set<Label> getAllowedLabels() {
        Set<Label> allowedLabels = new HashSet<>(viewType.getAllowedLabels());
        allowedLabels.retainAll(queue.getAllowedLabels());
        return allowedLabels;
    }

    public Set<QueueViewSettings> getViews() {
        return queue.getViews();
    }

    public Set<String> getSupervisors() {
        return queue.getSupervisors();
    }

    public QueueSortSettings getSorting() {
        return queue.getSorting();
    }

    public Set<ItemFilter> getFilters() {
        return queue.getFilters();
    }

    public Duration getProcessingDeadline() {
        return queue.getProcessingDeadline();
    }

    public boolean isResidual() {
        return queue.isResidual();
    }


}
