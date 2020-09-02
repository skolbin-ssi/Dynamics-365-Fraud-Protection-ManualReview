package com.griddynamics.msd365fp.manualreview.queues.repository;

import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Task;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

public interface TaskRepository extends CosmosRepository<Task, String> {
}
