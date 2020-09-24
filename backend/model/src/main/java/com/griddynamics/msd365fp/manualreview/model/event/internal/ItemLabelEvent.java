// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.event.internal;

import com.griddynamics.msd365fp.manualreview.model.ItemLabel;
import com.griddynamics.msd365fp.manualreview.model.dfp.AssesmentResult;
import com.griddynamics.msd365fp.manualreview.model.event.Event;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemLabelEvent implements Event {
    private String id;
    private ItemLabel label;
    private AssesmentResult assesmentResult;
    private Duration decisionApplyingDuration;
}
