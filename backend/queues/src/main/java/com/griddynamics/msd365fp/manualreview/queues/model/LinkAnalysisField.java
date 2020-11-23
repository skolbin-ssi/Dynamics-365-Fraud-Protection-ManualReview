// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@SuppressWarnings("unused")
@AllArgsConstructor
public enum LinkAnalysisField implements Serializable {
    CREATION_DATE("creationDate"),
    DISCOVERED_IP_ADDRESS("discoveredIPAddress"),
    MERCHANT_FUZZY_DEVICE_ID("merchantFuzzyDeviceId"),
    MERCHANT_PAYMENT_INSTRUMENT_ID("merchantPaymentInstrumentId"),
    EMAIL("email"),
    BIN("bin"),
    HOLDER_NAME("holderName"),
    ZIPCODE("zipcode");

    @Getter
    private String relatedLAName;
}
