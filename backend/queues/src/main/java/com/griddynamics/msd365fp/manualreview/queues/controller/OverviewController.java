// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.controller;

import com.griddynamics.msd365fp.manualreview.queues.model.dto.RiskScoreOverviewDTO;
import com.griddynamics.msd365fp.manualreview.queues.service.QueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.ADMIN_MANAGER_ROLE;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.SECURITY_SCHEMA_IMPLICIT;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.SENIOR_ANALYST_ROLE;

@RestController
@RequestMapping("/api/overview")
@Tag(name = "overview", description = "API for retrieving overviews.")
@Slf4j
@RequiredArgsConstructor
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Secured({ADMIN_MANAGER_ROLE})
public class OverviewController {

    private final QueueService queueService;

    @Operation(summary = "Get items split by risk score")
    @GetMapping(value = "/risk-score", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public RiskScoreOverviewDTO getRiskScoreOverview(
            @Parameter(description = "size of the risk score buckets, e.g. ")
            @RequestParam int bucketSize,
            @Parameter(description = "id of the queue which is used for the item filtering")
            @RequestParam(required = false) String queueId
    ) {
        return queueService.getRiskScoreOverview(bucketSize, queueId);
    }
}
