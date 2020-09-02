package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedQueueInfoEntity;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface CollectedQueueInfoRepository extends CosmosRepository<CollectedQueueInfoEntity, String> {
}
