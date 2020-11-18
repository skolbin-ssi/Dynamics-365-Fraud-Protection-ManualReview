// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Implementation of {@link EdgeData}
 *
 * @see EdgeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class PurchaseProductEdgeData extends EdgeData {
    public static final String EDGE_DIRECT_NAME = "PurchaseProduct";
    public static final String EDGE_REVERSED_NAME = "ProductPurchase";

    private String purchaseId;
    private String productId;
    private Double purchasePrice;
    private Double purchasePriceInUSD;
    private Double margin;
    private Double marginInUSD;
    private Double quantity;
    private Boolean isPreorder;
    private String shippingMethod;
}
