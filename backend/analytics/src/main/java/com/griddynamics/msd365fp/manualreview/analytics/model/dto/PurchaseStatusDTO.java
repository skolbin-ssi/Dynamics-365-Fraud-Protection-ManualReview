// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * Purchase Status payload.
 */
@Data
public class PurchaseStatusDTO {

    /**
     * Transaction (or purchase/order) identifier in merchant system.
     */
    private String purchaseId;

    /**
     * The type of the status. Possible values 'Approved' | 'Rejected'
     */
    private String statusType;

    /**
     * The DateTime when this status was applied
     */
    private String statusDate;

    /**
     * Reason of the status transition. Possible values 'OfflineManualReview_General' |
     * 'OfflineManualReview_Fraud' | 'OfflineManualReview_Watchlist'
     */
    private String reason;

    @NotNull
    @JsonProperty(value = "_metadata")
    private MetadataDTO metadata;
}
