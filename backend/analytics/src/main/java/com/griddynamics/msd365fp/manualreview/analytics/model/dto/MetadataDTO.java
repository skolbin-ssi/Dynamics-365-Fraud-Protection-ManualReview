// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import lombok.Data;

import java.time.OffsetDateTime;

/**
 * Metadata properties for the {@link PurchaseStatusDTO}.
 */
@Data
public class MetadataDTO {

    /**
     * TrackingId for the event.
     */
    private String trackingId;

    /**
     * TimeStamp for the event
     */
    private OffsetDateTime merchantTimeStamp;
}
