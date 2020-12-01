// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.griddynamics.msd365fp.manualreview.model.jackson.FlexibleDateFormatDeserializer;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.OffsetDateTime;

/**
 * Implementation of {@link NodeData}
 *
 * @see NodeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class PaymentInstrumentNodeData extends NodeData {
    public static final String NODE_NAME = "PaymentInstrument";

    private String paymentInstrumentId;
    private String merchantPaymentInstrumentId;
    private String type;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime creationDate;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime updateDate;
    private String state;
    private String cardType;
    private String holderName;
    @JsonProperty("BIN")
    private String bin;
    private String expirationDate;
    private String lastFourDigits;
    private String email;
    private String billingAgreementId;
    private String payerId;
    private String payerStatus;
    private String addressStatus;
    @JsonProperty("IMEI")
    private String imei;
}
