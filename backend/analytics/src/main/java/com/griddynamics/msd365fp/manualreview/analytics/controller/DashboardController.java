package com.griddynamics.msd365fp.manualreview.analytics.controller;

import com.griddynamics.msd365fp.manualreview.analytics.model.dto.*;
import com.griddynamics.msd365fp.manualreview.analytics.service.dashboard.ItemLabelingMetricService;
import com.griddynamics.msd365fp.manualreview.analytics.service.dashboard.ItemPlacementMetricService;
import com.griddynamics.msd365fp.manualreview.analytics.service.dashboard.QueueSizeHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.*;
import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_FORMAT;

@RestController
@RequestMapping("/api/dashboards")
@Tag(name = "dashboards", description = "The Dashboard API for analitycal overview.")
@Slf4j
@RequiredArgsConstructor
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Secured({ADMIN_MANAGER_ROLE})
public class DashboardController {

    private final ItemLabelingMetricService performanceService;
    private final ItemPlacementMetricService itemPlacementMetricService;
    private final QueueSizeHistoryService queueSizeHistoryService;

    @Operation(summary = "Get performance metrics for list of queues")
    @GetMapping(value = "/labeling/queues", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public Set<ItemLabelingMetricsByQueueDTO> getItemLabelingMetricsByQueue(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = AGGREGATION_PARAM_DESCRIPTION)
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @RequestParam
                    Duration aggregation,
            @Parameter(description = ANALYSTS_PARAM_DESCRIPTION)
            @RequestParam(value = "analyst", required = false)
                    Set<String> analystIds,
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds
    ) {
        return performanceService.getItemLabelingMetricsByQueue(from, to, aggregation, analystIds, queueIds);
    }

    @Operation(summary = "Get total performance metrics for the specified queue")
    @GetMapping(value = "/labeling/total", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public ItemLabelingMetricDTO getItemLabelingTotalMetrics(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = ANALYSTS_PARAM_DESCRIPTION)
            @RequestParam(value = "analyst", required = false)
                    Set<String> analystIds,
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds) {
        return performanceService.getItemLabelingTotalMetrics(from, to, analystIds, queueIds);
    }

    @Operation(summary = "Get performance metrics for list of analysts")
    @GetMapping(value = "/labeling/analysts", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public Set<ItemLabelingMetricsByAnalystDTO> getItemLabelingMetricsByAnalyst(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = AGGREGATION_PARAM_DESCRIPTION)
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @RequestParam
                    Duration aggregation,
            @Parameter(description = ANALYSTS_PARAM_DESCRIPTION)
            @RequestParam(value = "analyst", required = false)
                    Set<String> analystIds,
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds) {
        return performanceService.getItemLabelingMetricsByAnalyst(from, to, aggregation, analystIds, queueIds);
    }

    @Operation(summary = "Get progress of total performance metrics")
    @GetMapping(value = "/labeling/progress", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public ItemLabelingProgressMetricsDTO getItemLabelingProgressMetrics(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = ANALYSTS_PARAM_DESCRIPTION)
            @RequestParam(value = "analyst", required = false)
                    Set<String> analystIds,
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds) {
        return performanceService.getItemLabelingProgressMetrics(from, to, analystIds, queueIds);
    }

    @Operation(summary = "Get the processing time performance metrics")
    @GetMapping(value = "/labeling-time/total", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public ItemLabelingTimeMetricDTO getLabelingTimeTotalMetrics(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = ANALYSTS_PARAM_DESCRIPTION)
            @RequestParam(value = "analyst", required = false)
                    Set<String> analystIds,
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds) {
        return performanceService.getItemLabelingTimeTotalMetrics(from, to, analystIds, queueIds);
    }

    @Operation(summary = "Get the processing time performance metrics")
    @GetMapping(value = "/labeling-time/progress", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public ItemLabelingTimeProgressMetricsDTO getItemLabelingTimeProgressMetrics(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = ANALYSTS_PARAM_DESCRIPTION)
            @RequestParam(value = "analyst", required = false)
                    Set<String> analystIds,
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds) {
        return performanceService.getItemLabelingTimeProgressMetrics(from, to, analystIds, queueIds);
    }


    @Operation(summary = "Get demand/supply metrics for list of queues")
    @GetMapping(value = "/item-placement/queues", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public Collection<ItemPlacementMetricsByQueueDTO> getItemPlacementMetrics(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = AGGREGATION_PARAM_DESCRIPTION)
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @RequestParam
                    Duration aggregation,
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds) {
        return itemPlacementMetricService.getItemPlacementMetricsByQueues(from, to, aggregation, queueIds);
    }

    @Operation(summary = "Get demand/supply metrics for all queues")
    @GetMapping(value = "/item-placement/overall", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public ItemPlacementMetricsByQueueDTO getOverallItemPlacementMetrics(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = AGGREGATION_PARAM_DESCRIPTION)
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @RequestParam
                    Duration aggregation) {
        return itemPlacementMetricService.getOverallItemPlacementMetrics(from, to, aggregation);
    }

    @Operation(summary = "Get size history metrics for list of queues")
    @GetMapping(value = "/size-history/queues", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public Collection<SizeHistoryDTO> getQueueSizeHistory(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = AGGREGATION_PARAM_DESCRIPTION)
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @RequestParam
                    Duration aggregation,
            @Parameter(description = QUEUES_PARAM_DESCRIPTION)
            @RequestParam(value = "queue", required = false)
                    Set<String> queueIds) {
        return queueSizeHistoryService.getQueueSizeHistoryByQueues(from, to, aggregation, queueIds);
    }

    @Operation(summary = "Get size history metrics for all queues")
    @GetMapping(value = "/size-history/overall", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public SizeHistoryDTO getOverallSizeHistory(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime from,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime to,
            @Parameter(description = AGGREGATION_PARAM_DESCRIPTION)
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @RequestParam
                    Duration aggregation) {
        return queueSizeHistoryService.getOverallQueueSizeHistory(from, to, aggregation);
    }

}
