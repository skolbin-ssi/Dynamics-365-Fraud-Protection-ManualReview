// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.SettingsConfigurationDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.SettingsDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.ConfigurableAppSettings;
import com.griddynamics.msd365fp.manualreview.queues.repository.ConfigurableAppSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsService {

    private final ConfigurableAppSettingsRepository settingsRepository;
    private final ModelMapper modelMapper;

    public Collection<SettingsDTO> getSettings(final String type) {
        return settingsRepository.findAllByTypeAndActiveTrue(type).stream()
                .map(s -> modelMapper.map(s, SettingsDTO.class))
                .collect(Collectors.toList());
    }

    public void createSettings(final SettingsConfigurationDTO settings) {
        log.info("Trying to create new settings: [{}]", settings);
        ConfigurableAppSettings entity = modelMapper.map(settings, ConfigurableAppSettings.class);
        entity.setId(UUID.randomUUID().toString());
        entity.setActive(true);
        settingsRepository.save(entity);
        log.info("New settings were created: [{}]", entity);
    }

    public void updateSettings(final String id, final SettingsConfigurationDTO settings) throws NotFoundException {
        log.info("Trying to update settings by ID [{}]: [{}]", id, settings);
        ConfigurableAppSettings entity = settingsRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        modelMapper.map(settings, entity);
        settingsRepository.save(entity);
        log.info("Settings were updated: [{}]", entity);
    }

    public SettingsDTO deleteSettings(final String id) throws NotFoundException {
        log.info("Trying to delete settings by ID [{}].", id);
        ConfigurableAppSettings entity = settingsRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        entity.setActive(false);
        settingsRepository.save(entity);
        log.info("Settings were deleted by ID [{}].", id);
        return modelMapper.map(entity, SettingsDTO.class);
    }
}
