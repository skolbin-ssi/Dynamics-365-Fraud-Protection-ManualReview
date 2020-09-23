// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.model.Label;
import lombok.Data;

@Data
public class ItemLabelingBucket {
    private Label label;
    private String merchantRuleDecision;
    private int cnt;
    private String id;
    private int bucket;

}
