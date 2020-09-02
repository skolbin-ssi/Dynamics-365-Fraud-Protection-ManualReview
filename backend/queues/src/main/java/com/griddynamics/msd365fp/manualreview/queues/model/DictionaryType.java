package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public enum DictionaryType {
    TAG(null),
    PRODUCT_SKU(ItemFilter.FilterField.PRODUCT_SKU),
    USER_COUNTRY(ItemFilter.FilterField.USER_COUNTRY);

    @Getter
    private final ItemFilter.FilterField field;

}
