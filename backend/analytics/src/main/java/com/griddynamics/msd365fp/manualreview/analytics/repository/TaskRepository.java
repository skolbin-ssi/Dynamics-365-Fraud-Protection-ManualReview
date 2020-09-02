package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Task;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface TaskRepository extends CosmosRepository<Task, String> {
}
