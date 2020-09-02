package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.QueueSizeCalculationActivityEntity;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface QueueSizeCalculationActivityRepository extends CosmosRepository<QueueSizeCalculationActivityEntity, String>, QueueSizeCalculationActivityRepositoryCustomMethods {
}
