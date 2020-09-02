package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Resolution;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface ResolutionRepository extends CosmosRepository<Resolution, String>, ResolutionRepositoryCustomMethods {
}
