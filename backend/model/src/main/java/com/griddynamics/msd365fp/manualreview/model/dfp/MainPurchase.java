// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class MainPurchase extends Purchase {
    private User user;
    private DeviceContext deviceContext;
    private List<Address> addressList;
    private List<PaymentInstrument> paymentInstrumentList;
    private List<Product> productList;
    private List<BankEvent> bankEventsList;
    private Map<String, String> customData;
    private Map<String, Map<String, Object>> additionalInfo;
    private List<PreviousPurchase> previousPurchaseList;
    private CalculatedFields calculatedFields;
}
