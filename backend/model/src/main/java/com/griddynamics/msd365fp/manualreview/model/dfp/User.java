// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.griddynamics.msd365fp.manualreview.model.jackson.EpochSecondsDateTimeSerializer;
import com.griddynamics.msd365fp.manualreview.model.jackson.FlexibleDateFormatDeserializer;
import com.griddynamics.msd365fp.manualreview.model.jackson.ISOStringDateTimeSerializer;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class User implements Serializable {
    private String userId;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime creationDate;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime updateDate;
    private String firstName;
    private String lastName;
    private String country;
    private String zipCode;
    private String timeZone;
    private String language;
    private String phoneNumber;
    private String email;
    private String membershipId;
    private String profileType;
    private String profileName;
    private String authenticationProvider;
    private String displayName;
    private Boolean isEmailValidated;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime emailValidatedDate;
    private Boolean isPhoneNumberValidated;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime phoneNumberValidatedDate;
    private BigDecimal totalSpend = BigDecimal.ZERO;
    private BigDecimal totalTransactions = BigDecimal.ZERO;
    private BigDecimal totalRefundAmount = BigDecimal.ZERO;
    private BigDecimal totalChargebackAmount = BigDecimal.ZERO;
    private BigDecimal totalDaysOfUse = BigDecimal.ZERO;
    private BigDecimal last30DaysSpend = BigDecimal.ZERO;
    private BigDecimal last30DaysTransactions = BigDecimal.ZERO;
    private BigDecimal last30DaysRefundAmount = BigDecimal.ZERO;
    private BigDecimal last30DaysChargebackAmount = BigDecimal.ZERO;
    private BigDecimal last30DaysOfUse = BigDecimal.ZERO;
    private BigDecimal monthlyAverageSpend = BigDecimal.ZERO;
    private BigDecimal monthlyAverageTransactions = BigDecimal.ZERO;
    private BigDecimal monthlyAverageRefundAmount = BigDecimal.ZERO;
    private BigDecimal monthlyAverageChargebackAmount = BigDecimal.ZERO;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime measuresIngestionDateTimeUTC;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime merchantLocalDate;

    private Boolean isFraud = false;

    private Map<String, String> additionalParams = new HashMap<>();

    @JsonAnySetter
    public void setAdditionalParam(String name, String value) {
        additionalParams.put(name, value);
    }
    public void setAdditionalParams(Map<String, String> map) {
        additionalParams.putAll(map);
    }

    /**
     * Getter for advanced serialization.
     * Json object will contain both representation of DateTime field -
     * timestamp (for SQL queries) and string representation.
     */
    @SuppressWarnings("unused")
    @JsonSerialize(using = EpochSecondsDateTimeSerializer.class)
    public OffsetDateTime getCreationDateEpochSeconds() {
        return creationDate;
    }

    /**
     * Getter for advanced serialization.
     * Json object will contain both representation of DateTime field -
     * timestamp (for SQL queries) and string representation.
     */
    @SuppressWarnings("unused")
    @JsonSerialize(using = EpochSecondsDateTimeSerializer.class)
    public OffsetDateTime getUpdateDateEpochSeconds() {
        return updateDate;
    }

    /**
     * Getter for advanced serialization.
     * Json object will contain both representation of DateTime field -
     * timestamp (for SQL queries) and string representation.
     */
    @SuppressWarnings("unused")
    @JsonSerialize(using = EpochSecondsDateTimeSerializer.class)
    public OffsetDateTime getMerchantLocalDateEpochSeconds() {
        return merchantLocalDate;
    }

    /**
     * Getter for advanced serialization.
     * Json object will contain both representation of DateTime field -
     * timestamp (for SQL queries) and string representation.
     */
    @SuppressWarnings("unused")
    @JsonSerialize(using = EpochSecondsDateTimeSerializer.class)
    public OffsetDateTime getEmailValidatedDateEpochSeconds() {
        return emailValidatedDate;
    }

    /**
     * Getter for advanced serialization.
     * Json object will contain both representation of DateTime field -
     * timestamp (for SQL queries) and string representation.
     */
    @SuppressWarnings("unused")
    @JsonSerialize(using = EpochSecondsDateTimeSerializer.class)
    public OffsetDateTime getPhoneNumberValidatedDateEpochSeconds() {
        return phoneNumberValidatedDate;
    }

    /**
     * Getter for advanced serialization.
     * Json object will contain both representation of DateTime field -
     * timestamp (for SQL queries) and string representation.
     */
    @SuppressWarnings("unused")
    @JsonSerialize(using = EpochSecondsDateTimeSerializer.class)
    public OffsetDateTime getMeasuresIngestionDateTimeUTCEpochSeconds() {
        return measuresIngestionDateTimeUTC;
    }

}
