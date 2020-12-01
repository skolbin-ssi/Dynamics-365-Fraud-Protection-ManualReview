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
public class PaymentInstrumentAddressEdgeData extends EdgeData {
    public static final String EDGE_DIRECT_NAME = "PaymentInstrumentAddress";
    public static final String EDGE_REVERSED_NAME = "AddressPaymentInstrument";

    private String paymentInstrumentId;
    private String addressId;
    private String type;
    private String firstName;
    private String lastName;
    private String phoneNumber;
}
