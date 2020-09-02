package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedAnalystInfoEntity;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface CollectedAnalystInfoRepository extends CosmosRepository<CollectedAnalystInfoEntity, String> {
}
