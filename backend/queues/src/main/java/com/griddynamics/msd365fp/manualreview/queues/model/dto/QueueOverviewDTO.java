// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QueueOverviewDTO {

    private long lockedItemsCount;
    private long nearToSlaCount;
    private long nearToTimeoutCount;

}
