// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.controller;

import com.griddynamics.msd365fp.manualreview.analytics.model.MetricType;
import com.griddynamics.msd365fp.manualreview.analytics.model.ThresholdOperator;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.AlertCreationDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.AlertDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.AlertMetricDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.AlertUpdateDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Alert;
import com.griddynamics.msd365fp.manualreview.analytics.service.AlertService;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.*;


/**
 * {@link Alert} CRUD. Alerts are bound to the current user.
 * There is no endpoint to browse through all alerts in the system.
 */
@Tag(name = "alerts", description = "The Alerts API")
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/alerts")
@Secured({ADMIN_MANAGER_ROLE})
public class AlertController {

    private final AlertService alertService;

    /**
     * Get all {@link Alert}s for the current user.
     * This endpoint is for Alerts Dashboard overview.
     *
     * @return list of {@link Alert}s
     */
    @Operation(summary = "Get all alerts for particular user")
    @GetMapping(path = "/my", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public List<AlertDTO> getAllByCurrentUser() {
        return alertService.getAllByCurrentUser();
    }

    /**
     * Get {@link Alert}.
     *
     * @param id of a selected {@link Alert}
     * @return a selected {@link Alert}
     * @throws NotFoundException if no {@link Alert} is present by this id
     */
    @Operation(summary = "Get alert for particular user")
    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public AlertDTO getById(@PathVariable String id) throws NotFoundException {
        return alertService.getById(id);
    }

    /**
     * Create an {@link Alert}.
     *
     * @param alertDTO create an {@link Alert} data
     * @return created {@link Alert}
     */
    @Operation(summary = "Create alert for particular user")
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public AlertDTO create(@Valid @RequestBody AlertCreationDTO alertDTO) throws NotFoundException {
        return alertService.create(alertDTO);
    }

    /**
     * Update selected {@link Alert}.
     *
     * @param id       of a selected {@link Alert}
     * @param alertDTO update an {@link Alert} data
     * @return updated {@link Alert}
     * @throws NotFoundException if no {@link Alert} is present by this id
     */
    @Operation(summary = "Update alert for particular user")
    @PutMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public AlertDTO update(@PathVariable String id,
                           @Valid @RequestBody AlertUpdateDTO alertDTO) throws NotFoundException {
        return alertService.update(id, alertDTO);
    }

    /**
     * Delete selected {@link Alert}.
     *
     * @param id of a selected {@link Alert}
     */
    @Operation(summary = "Delete alert for particular user")
    @DeleteMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public AlertDTO delete(@PathVariable String id) throws NotFoundException {
        return alertService.delete(id);
    }

    /**
     * Returns available metrics for current user.
     * Contains values of {@link MetricType}, {@link ThresholdOperator} and
     * their possible combinations.
     */
    @Operation(summary = "Get metrics available for current user")
    @GetMapping(path = "/metrics", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public Set<AlertMetricDTO> getMetrics() {
        return alertService.getMetricsForCurrentUser();
    }

}
