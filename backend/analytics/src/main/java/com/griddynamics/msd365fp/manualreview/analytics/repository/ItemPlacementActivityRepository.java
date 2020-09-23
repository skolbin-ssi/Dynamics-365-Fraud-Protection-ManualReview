// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.ItemPlacementActivityEntity;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface ItemPlacementActivityRepository extends CosmosRepository<ItemPlacementActivityEntity, String>, ItemPlacementActivityRepositoryCustomMethods {
}
