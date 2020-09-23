// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskScoreOverviewDTO {
    @NotNull
    private Map<String, RiskScoreBucketDTO> riskScoreOverview;

    @NoArgsConstructor
    @Data
    public static class RiskScoreBucketDTO {
        @NotNull
        private int count;
    }
}
