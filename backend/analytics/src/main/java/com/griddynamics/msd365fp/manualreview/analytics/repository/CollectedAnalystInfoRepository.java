// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedAnalystInfoEntity;
import com.azure.spring.data.cosmos.repository.CosmosRepository;

public interface CollectedAnalystInfoRepository extends CosmosRepository<CollectedAnalystInfoEntity, String> {
}
