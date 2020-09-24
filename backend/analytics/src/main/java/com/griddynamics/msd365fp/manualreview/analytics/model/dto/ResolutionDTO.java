// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import com.griddynamics.msd365fp.manualreview.model.ItemEscalation;
import com.griddynamics.msd365fp.manualreview.model.ItemHold;
import com.griddynamics.msd365fp.manualreview.model.ItemLabel;
import com.griddynamics.msd365fp.manualreview.model.ItemNote;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.OffsetDateTime;
import java.util.Set;

@Data
public class ResolutionDTO {
    private String id;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime imported;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime updated;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime sent;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime nextRetry;
    private int retryCount;
    private Boolean sentSuccessful;
    private long ttl;

    private ItemLabel label;
    private ItemEscalation escalation;
    private ItemHold hold;
    private Set<ItemNote> notes;
    private Set<String> tags;
}
