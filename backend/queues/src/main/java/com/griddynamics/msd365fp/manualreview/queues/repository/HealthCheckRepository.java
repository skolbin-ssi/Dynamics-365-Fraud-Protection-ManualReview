// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.repository;

import com.griddynamics.msd365fp.manualreview.queues.model.persistence.HealthCheck;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

import java.util.List;

public interface HealthCheckRepository extends CosmosRepository<HealthCheck, String> {
    @SuppressWarnings("SpringDataRepositoryMethodParametersInspection")
    List<HealthCheck> findAllByTypeAndActiveIsTrueAndCreatedLessThan(String type, long created);
}
