// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public abstract class Purchase implements Serializable {
    private String purchaseId;
    private String assessmentType;
    private String originalOrderId;
    private OffsetDateTime customerLocalDate;
    private OffsetDateTime merchantLocalDate;
    private BigDecimal totalAmount;
    private BigDecimal totalAmountInUSD;
    private BigDecimal salesTax;
    private BigDecimal salesTaxInUSD;
    private String currency;
    private BigDecimal currencyConversionFactor;
    private String shippingMethod;
    private String bankName;
    private String hashedEvaluationId;
}
