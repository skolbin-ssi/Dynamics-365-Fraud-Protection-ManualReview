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

import java.time.Duration;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_FORMAT;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertUpdateDTO {

    private String name;
    private MetricType metricType;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    private Duration period;
    private ThresholdOperator thresholdOperator;
    private Double thresholdValue;
    private Set<String> queues;
    private Set<String> analysts;
    private Boolean active;

}
