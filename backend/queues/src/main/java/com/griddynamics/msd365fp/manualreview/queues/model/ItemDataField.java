// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter.FilterCondition.*;

@SuppressWarnings("unused")
@AllArgsConstructor
public enum ItemDataField implements Serializable {
    IMPORT_DATE("imported", Set.of(IN, BETWEEN_DATE, REGEXP)),
    TOTAL_AMOUNT("purchase.TotalAmountInUSD", Set.of(BETWEEN)),
    USER_COUNTRY("purchase.User.Country", Set.of(IN, REGEXP, BETWEEN_ALPH)),
    PRODUCT_SKU("purchase.ProductList[].Sku", Set.of(IN, BETWEEN_ALPH, REGEXP)),
    SCORE("decision.riskScore", Set.of(BETWEEN));

    @Getter
    private String path;
    @Getter
    private Set<ItemFilter.FilterCondition> acceptedConditions;
}
