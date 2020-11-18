// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.griddynamics.msd365fp.manualreview.model.DisposabilityCheckServiceResponse;
import com.griddynamics.msd365fp.manualreview.model.jackson.EpochSecondsDateTimeSerializer;
import com.griddynamics.msd365fp.manualreview.model.jackson.FlexibleDateFormatDeserializer;
import com.griddynamics.msd365fp.manualreview.model.jackson.ISOStringDateTimeSerializer;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;


@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalculatedFields implements Serializable {

    // Geo data
    private Boolean matchingOfCountriesForShippingAndIP;
    private Boolean matchingOfCountriesForBillingAndShipping;
    private Boolean matchingOfCountriesForBillingAndIP;
    private List<String> billingCountries;
    private List<String> billingZipCodes;
    private List<String> billingAddresses;
    private BigDecimal distanceToPreviousTransactionIP;

    // Account statistic
    private Long accountAgeInDays;
    private Long activityAgeInDays;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime firstTransactionDateTime;
    private Boolean aggregatedEmailConfirmed;
    private String aggregatedEmailDomain;
    private Boolean disposableEmailDomain;
    private List<DisposabilityCheckServiceResponse> disposabilityChecks;

    // Bank data
    private List<String> authBankEventResultCodes;
    private List<String> approveBankEventResultCodes;
    private List<String> declineBankEventResultCodes;

    // Previous transactions statistic
    private Velocity<Long> transactionCount;
    private Velocity<BigDecimal> transactionAmount;
    private Velocity<Long> rejectedTransactionCount;
    private Velocity<BigDecimal> rejectedTransactionAmount;
    private Velocity<Long> failedTransactionCount;
    private Velocity<BigDecimal> failedTransactionAmount;
    private Velocity<Long> successfulTransactionCount;
    private Velocity<BigDecimal> successfulTransactionAmount;
    private Velocity<Long> currentPaymentInstrumentTransactionCount;
    private Velocity<BigDecimal> currentPaymentInstrumentTransactionAmount;
    private Velocity<Long> uniquePaymentInstrumentCount;
    private Velocity<Long> uniqueIPCountries;

    /**
     * Getter for advanced serialization.
     * Json object will contain both representation of DateTime field -
     * timestamp (for SQL queries) and string representation.
     */
    @SuppressWarnings("unused")
    @JsonSerialize(using = EpochSecondsDateTimeSerializer.class)
    public OffsetDateTime getFirstTransactionDateTimeEpochSeconds() {
        return firstTransactionDateTime;
    }
}
