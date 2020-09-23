// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.repository;

import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface QueueRepository extends CosmosRepository<Queue, String>, QueueRepositoryCustomMethods {

    Iterable<Queue> findByIdAndActiveTrue(String s);

}
