// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.controller;

import com.griddynamics.msd365fp.manualreview.analytics.model.dto.CollectedAnalystInfoDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.CollectedQueueInfoDTO;
import com.griddynamics.msd365fp.manualreview.analytics.service.dashboard.PublicCollectedInfoService;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.*;

@RestController
@RequestMapping("/api/collected-info")
@Tag(name = "collected-info", description = "The Task API")
@Slf4j
@RequiredArgsConstructor
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Secured({ADMIN_MANAGER_ROLE})
public class CollectedInfoController {
    private final PublicCollectedInfoService publicCollectedInfoService;

    @Operation(summary = "Get list of collected analysts")
    @GetMapping(value = "/analysts", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public List<CollectedAnalystInfoDTO> getAllCollectedAnalysts(
            @Parameter(description = ANALYSTS_PARAM_DESCRIPTION)
            @RequestParam(value = "analyst", required = false)
                    Set<String> analystIds) {
        return publicCollectedInfoService.getCollectedAnalystInfo(analystIds);
    }

    @Operation(summary = "Get collected analyst info by id")
    @GetMapping(value = "/analysts/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public CollectedAnalystInfoDTO getCollectedAnalystInfo(
            @PathVariable(value = "id") String analystId) throws NotFoundException {
        return publicCollectedInfoService.getCollectedAnalystInfo(analystId);
    }

    @Operation(summary = "Get list of collected queues")
    @GetMapping(value = "/queues", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public List<CollectedQueueInfoDTO> getAllCollectedQueues(
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds) {
        return publicCollectedInfoService.getCollectedQueueInfo(queueIds);
    }

    @Operation(summary = "Get collected queue info by id")
    @GetMapping(value = "/queues/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public CollectedQueueInfoDTO getCollectedQueueInfo(
            @PathVariable(value = "id") String queueId) throws NotFoundException {
        return publicCollectedInfoService.getCollectedQueueInfo(queueId);
    }

}
