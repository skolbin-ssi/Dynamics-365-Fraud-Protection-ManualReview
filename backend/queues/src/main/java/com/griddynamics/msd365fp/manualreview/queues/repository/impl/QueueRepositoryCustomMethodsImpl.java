// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.repository.impl;

import com.griddynamics.msd365fp.manualreview.cosmos.utilities.ExtendedCosmosContainer;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.griddynamics.msd365fp.manualreview.queues.repository.QueueRepositoryCustomMethods;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.lang.NonNull;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Custom queries implementation.
 * In accordance with:
 * - https://stackoverflow.com/questions/22866473/how-to-implement-only-specific-method-of-crudrepository-in-spring
 * - https://docs.microsoft.com/en-us/azure/developer/java/spring-framework/how-to-guides-spring-data-cosmosdb
 */
@RequiredArgsConstructor
public class QueueRepositoryCustomMethodsImpl implements QueueRepositoryCustomMethods {


    @Qualifier("queuesContainer")
    private final ExtendedCosmosContainer queuesContainer;

    @Override
    public PageableCollection<Queue> getQueueList(
            final Boolean active,
            final Boolean residual,
            final int pageSize,
            final String continuationToken) {
        String query = String.format("SELECT q FROM q " +
                        "WHERE %1$s " +
                        "AND %2$s " +
                        "ORDER BY q.name",
                active == null ? "true" : String.format("q.active=%s", active),
                residual == null ? "true" : String.format("q.residual=%s", residual));
        ExtendedCosmosContainer.Page res =
                queuesContainer.runCrossPartitionPageableQuery(query, pageSize, continuationToken);
        List<Queue> queues = res.getContent()
                .map(cip -> queuesContainer.castCosmosObjectToClassInstance(cip.get("q"), Queue.class))
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
        return new PageableCollection<>(queues, res.getContinuationToken());
    }

    @Override
    public Optional<Queue> getActiveQueueByIdOrViewId(@NonNull final String id) {
        return queuesContainer.runCrossPartitionQuery(
                String.format("SELECT q FROM q " +
                        "JOIN view IN q.views " +
                        "WHERE q.active=true " +
                        "AND (view.viewId='%1$s' OR q.id='%1$s')", id))
                .map(cip -> queuesContainer.castCosmosObjectToClassInstance(cip.get("q"), Queue.class))
                .flatMap(Optional::stream)
                .findFirst();
    }

    @Override
    public PageableCollection<Queue> findQueuesCreatedOrDeletedAfter(
            final OffsetDateTime dateTime,
            final int pageSize,
            final String continuationToken) {
        ExtendedCosmosContainer.Page res = queuesContainer.runCrossPartitionPageableQuery(
                "SELECT q FROM q WHERE " +
                        " q.created >= " + dateTime.toEpochSecond() +
                        " OR q.deleted >= " + dateTime.toEpochSecond(),
                pageSize,
                continuationToken);
        List<Queue> queues = res.getContent()
                .map(cip -> queuesContainer.castCosmosObjectToClassInstance(cip.get("q"), Queue.class))
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
        return new PageableCollection<>(queues, res.getContinuationToken());
    }

}
