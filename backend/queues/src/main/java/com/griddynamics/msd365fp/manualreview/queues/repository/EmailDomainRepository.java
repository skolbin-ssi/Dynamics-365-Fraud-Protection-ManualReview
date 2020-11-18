// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.repository;

import com.griddynamics.msd365fp.manualreview.queues.model.persistence.EmailDomain;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface EmailDomainRepository extends CosmosRepository<EmailDomain, String> {

}
