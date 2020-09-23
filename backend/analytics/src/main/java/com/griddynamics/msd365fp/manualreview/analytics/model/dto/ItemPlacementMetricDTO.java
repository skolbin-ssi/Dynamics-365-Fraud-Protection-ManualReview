// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPlacementMetricDTO {
    @Builder.Default
    private int received = 0;
    @Builder.Default
    private int reviewed = 0;
    @Builder.Default
    private int released = 0;
}
