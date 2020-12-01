// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Implementation of {@link NodeData}
 *
 * @see NodeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class ProductNodeData extends NodeData {
    public static final String NODE_NAME = "Product";

    private String productId;
    private String productName;
    private String type;
    private String sku;
    private String category;
    private String market;
    private Double salesPrice;
    private Double salesPriceInUSD;
    private String currency;
    private Double currencyConversionFactor;
    @JsonProperty("COGS")
    private Double cogs;
    @JsonProperty("COGSInUSD")
    private Double cogsInUSD;
    private Boolean isRecurring;
    private Boolean isFree;
    private String language;
}
