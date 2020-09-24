// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;

import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.analytics.model.Constants.SWAGGER_DURATION_FORMAT;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemLabelingTimeMetricDTO {

    @Builder.Default
    private int notWastedAmount = 0;
    @Builder.Default
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    private Duration notWastedDuration = Duration.ZERO;
    @Builder.Default
    private int wastedAmount  = 0;
    @Builder.Default
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    private Duration wastedDuration = Duration.ZERO;
    @Builder.Default
    private int resolutionAmount = 0;
    @Builder.Default
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    private Duration resolutionApplyingDuration = Duration.ZERO;
    @Builder.Default
    private int internalDecisionsAmount  = 0;
    @Builder.Default
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    private Duration internalDecisionsApplyingDuration = Duration.ZERO;
}
