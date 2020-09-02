package com.griddynamics.msd365fp.manualreview.queues.repository;

import com.griddynamics.msd365fp.manualreview.queues.model.DictionaryType;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Settings;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

import java.util.List;

public interface SettingsRepository extends CosmosRepository<Settings, String> {

    List<Settings> findAllByTypeAndActiveTrue(String type);

}
