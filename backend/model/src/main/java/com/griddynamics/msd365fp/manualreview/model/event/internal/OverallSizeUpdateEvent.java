// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.event.internal;

import com.griddynamics.msd365fp.manualreview.model.event.Event;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverallSizeUpdateEvent implements Event {
    private int size;
    private OffsetDateTime updated;


    @Override
    public String getId() {
        return "overall";
    }
}
