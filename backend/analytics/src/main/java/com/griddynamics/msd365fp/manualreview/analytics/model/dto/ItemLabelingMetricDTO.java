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
public class ItemLabelingMetricDTO {

    @Builder.Default
    private int reviewed = 0;
    @Builder.Default
    private int good = 0;
    @Builder.Default
    private int bad = 0;
    @Builder.Default
    private int watched = 0;
    @Builder.Default
    private int escalated = 0;
    @Builder.Default
    private int held = 0;
    @Builder.Default
    private int other = 0;
    @Builder.Default
    private int goodOverturned = 0;
    @Builder.Default
    private int badOverturned = 0;
    @Builder.Default
    private int goodInBatch = 0;
    @Builder.Default
    private int badInBatch = 0;
}
