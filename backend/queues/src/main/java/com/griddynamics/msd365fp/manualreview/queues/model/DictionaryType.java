// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public enum DictionaryType {
    TAG(null),
    PRODUCT_SKU(ItemDataField.PRODUCT_SKU),
    USER_COUNTRY(ItemDataField.USER_COUNTRY);

    @Getter
    private final ItemDataField field;

}
