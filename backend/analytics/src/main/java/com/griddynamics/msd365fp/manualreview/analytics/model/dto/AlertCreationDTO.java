// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.griddynamics.msd365fp.manualreview.analytics.model.MetricType;
import com.griddynamics.msd365fp.manualreview.analytics.model.ThresholdOperator;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.Duration;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_FORMAT;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertCreationDTO {

    @NotBlank(message = "Alert name should be defined")
    private String name;
    @NotNull(message = "Metric should be defined")
    private MetricType metricType;
    @NotNull(message = "Period should be defined")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    private Duration period;
    @NotNull(message = "ThresholdOperator should be defined")
    private  ThresholdOperator thresholdOperator;
    @NotNull(message = "ThresholdValue should be defined")
    private Double thresholdValue;
    private Set<String> queues;
    private Set<String> analysts;

}
