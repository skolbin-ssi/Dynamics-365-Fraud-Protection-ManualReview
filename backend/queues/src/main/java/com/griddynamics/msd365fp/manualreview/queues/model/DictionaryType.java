// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public enum DictionaryType {
    TAG(null),
    PRODUCT_SKU(ItemFilterField.PRODUCT_SKU),
    USER_COUNTRY(ItemFilterField.USER_COUNTRY),
    AUTHENTICATION_PROVIDER(ItemFilterField.AUTHENTICATION_PROVIDER),
    AGGREGATED_EMAIL_DOMAIN(ItemFilterField.AGGREGATED_EMAIL_DOMAIN),
    PRODUCT_CATEGORY(ItemFilterField.PRODUCT_CATEGORY),
    PRODUCT_TYPE(ItemFilterField.PRODUCT_TYPE),
    PI_BIN(ItemFilterField.PI_BIN),
    PI_COUNTRY(ItemFilterField.PI_COUNTRY),
    PI_ZIP(ItemFilterField.PI_ZIP),
    PAYMENT_GATEWAY(ItemFilterField.PAYMENT_GATEWAY),
    DEVICE_CONTEXT_USER_AGENT(ItemFilterField.DEVICE_CONTEXT_USER_AGENT),
    IP_COUNTRY(ItemFilterField.IP_COUNTRY);

    @Getter
    private final ItemFilterField field;

}
