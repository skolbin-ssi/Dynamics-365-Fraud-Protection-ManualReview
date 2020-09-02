package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.ItemLabelActivityEntity;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface ItemLabelActivityRepository extends CosmosRepository<ItemLabelActivityEntity, String>, ItemLabelActivityRepositoryCustomMethods {
}
