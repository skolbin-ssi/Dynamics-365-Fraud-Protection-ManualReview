// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_FORMAT;

@Data
public class CollectedQueueInfoDTO {
    private String id;
    private String name;
    private boolean active;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime updated;
    private Set<String> reviewers;
    private Set<String> supervisors;
    private boolean residual;
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    private Duration processingDeadline;
}
