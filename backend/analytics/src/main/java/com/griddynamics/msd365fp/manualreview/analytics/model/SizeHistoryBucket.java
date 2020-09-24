// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model;

import lombok.Data;

@Data
public class SizeHistoryBucket {
    private int size;
    private String id;
    private int bucket;
}
