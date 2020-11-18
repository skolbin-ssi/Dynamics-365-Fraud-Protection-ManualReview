// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.griddynamics.msd365fp.manualreview.model.jackson.FlexibleDateFormatDeserializer;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.OffsetDateTime;

/**
 * Implementation of {@link EdgeData}
 *
 * @see EdgeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class PurchasePaymentInstrumentEdgeData extends EdgeData {
    public static final String EDGE_DIRECT_NAME = "PurchasePaymentInstrument";
    public static final String EDGE_REVERSED_NAME = "PaymentInstrumentPurchase";

    private String purchaseId;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime merchantLocalDate;
    private String paymentInstrumentId;
    private Double purchaseAmount;
    private Double purchaseAmountInUSD;
}
