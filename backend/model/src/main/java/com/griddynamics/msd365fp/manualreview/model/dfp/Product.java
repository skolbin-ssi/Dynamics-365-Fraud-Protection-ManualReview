// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class Product implements Serializable {
    private String productId;
    private String productName;
    private String type;
    private String sku;
    private String category;
    private String market;
    private BigDecimal salesPrice;
    private BigDecimal salesPriceInUSD;
    private String currency;
    private BigDecimal currencyConversionFactor;
    @JsonProperty("COGS")
    private BigDecimal cogs;
    @JsonProperty("COGSInUSD")
    private BigDecimal cogsInUSD;
    private Boolean isRecurring;
    private Boolean isFree;
    private String language;
    private BigDecimal purchasePrice;
    private BigDecimal purchasePriceInUSD;
    private BigDecimal margin;
    private BigDecimal marginInUSD;
    private BigDecimal quantity;
    private Boolean isPreorder;
    private String shippingMethod;

    private Map<String, String> additionalParams = new HashMap<>();

    @JsonAnySetter
    public void setAdditionalParam(String name, String value) {
        additionalParams.put(name, value);
    }
    public void setAdditionalParams(Map<String, String> map) {
        additionalParams.putAll(map);
    }
}
