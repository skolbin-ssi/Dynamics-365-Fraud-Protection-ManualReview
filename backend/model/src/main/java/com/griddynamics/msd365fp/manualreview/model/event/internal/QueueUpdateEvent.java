// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.event.internal;

import com.griddynamics.msd365fp.manualreview.model.event.Event;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueueUpdateEvent implements Event {
    private String id;
    private String name;
    private boolean active;
    private OffsetDateTime updated;
    @Builder.Default
    private Set<String> reviewers = Collections.emptySet();
    @Builder.Default
    private Set<String> supervisors = Collections.emptySet();
    private boolean residual;
    private Duration processingDeadline;
}
