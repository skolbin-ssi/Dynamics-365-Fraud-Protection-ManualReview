// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;


@Data
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalculatedFields implements Serializable {
    private Boolean matchingOfCountriesForShippingAndIP;
    private Boolean matchingOfCountriesForBillingAndShipping;
    private Boolean matchingOfCountriesForBillingAndIP;

    private List<String> billingCountries;
    private List<String> billingZipCodes;
    private List<String> billingAddresses;

    private Integer accountAgeInDays;
    private Integer activityAgeInDays;
    private OffsetDateTime firstTransactionDateTime;

    private Boolean aggregatedEmailConfirmed;
    private String aggregatedEmailDomain;

    private List<String> authResultCodes;
    private List<String> approveResultCodes;
    private List<String> declineResultCodes;

    private Integer lastHourTransactionCount;
    private Integer lastDayTransactionCount;
    private Integer lastWeekTransactionCount;

    private BigDecimal lastHourTransactionAmount;
    private BigDecimal lastDayTransactionAmount;
    private BigDecimal lastWeekTransactionAmount;

    private Integer lastHourRejectedTransactionCount;
    private Integer lastDayRejectedTransactionCount;
    private Integer lastWeekRejectedTransactionCount;

    private BigDecimal lastHourRejectedTransactionAmount;
    private BigDecimal lastDayRejectedTransactionAmount;
    private BigDecimal lastWeekRejectedTransactionAmount;

    private Integer lastHourFailedTransactionCount;
    private Integer lastDayFailedTransactionCount;
    private Integer lastWeekFailedTransactionCount;

    private BigDecimal lastHourFailedTransactionAmount;
    private BigDecimal lastDayFailedTransactionAmount;
    private BigDecimal lastWeekFailedTransactionAmount;

    private Integer lastHourSuccessfulTransactionCount;
    private Integer lastDaySuccessfulTransactionCount;
    private Integer lastWeekSuccessfulTransactionCount;

    private BigDecimal lastHourSuccessfulTransactionAmount;
    private BigDecimal lastDaySuccessfulTransactionAmount;
    private BigDecimal lastWeekSuccessfulTransactionAmount;

    private Integer lastHourUniquePaymentInstrumentCount;
    private Integer lastDayUniquePaymentInstrumentCount;
    private Integer lastWeekUniquePaymentInstrumentCount;

    private Integer lastHourTransactionCountWithCurrentPaymentInstrument;
    private Integer lastDayTransactionCountWithCurrentPaymentInstrument;
    private Integer lastWeekTransactionCountWithCurrentPaymentInstrument;

    private BigDecimal lastHourTransactionAmountWithCurrentPaymentInstrument;
    private BigDecimal lastDayTransactionAmountWithCurrentPaymentInstrument;
    private BigDecimal lastWeekTransactionAmountWithCurrentPaymentInstrument;

    private Integer lastHourUniqueIPCountries;
    private Integer lastDayUniqueIPCountries;
    private Integer lastWeekUniqueIPCountries;
}
