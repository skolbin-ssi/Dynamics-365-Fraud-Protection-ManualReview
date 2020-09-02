package com.griddynamics.msd365fp.manualreview.queues.controller;

import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.SettingsConfigurationDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.SettingsDTO;
import com.griddynamics.msd365fp.manualreview.queues.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collection;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "settings", description = "The Settings API for configuration of usage experience")
@Slf4j
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Secured({ADMIN_MANAGER_ROLE})
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @Operation(summary = "Get all settings by specified type")
    @GetMapping(value = "/{type}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public Collection<SettingsDTO> getSettings(
            @Parameter(description = "Type of required settings")
            @PathVariable String type) {
        return settingsService.getSettings(type);
    }

    @Operation(summary = "Create new setting entry")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public void postSettings(
            @Valid @RequestBody final SettingsConfigurationDTO parameters) {
        settingsService.createSettings(parameters);
    }

    @Operation(summary = "Update settings by specified id")
    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public void updateSettings(
            @Parameter(description = "Id of setting entry")
            @PathVariable String id,
            @Valid @RequestBody final SettingsConfigurationDTO parameters) throws NotFoundException {
        settingsService.updateSettings(id, parameters);
    }

    @Operation(summary = "Delete settings by specified id")
    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public SettingsDTO deleteSettings(
            @Parameter(description = "Id of settings")
            @PathVariable String id) throws NotFoundException {
        return settingsService.deleteSettings(id);
    }
}
