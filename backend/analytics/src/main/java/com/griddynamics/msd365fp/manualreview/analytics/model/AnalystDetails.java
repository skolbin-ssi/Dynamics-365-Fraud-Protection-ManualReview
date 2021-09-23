// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.model.Label;
import lombok.Data;

@Data
public class AnalystDetails {
    private Label label;
    private String merchantRuleDecision;
    private String id;
    private String analystId;
}
