// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.griddynamics.msd365fp.manualreview.model.jackson.FlexibleDateFormatDeserializer;
import com.griddynamics.msd365fp.manualreview.model.jackson.ISOStringDateTimeSerializer;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.OffsetDateTime;

/**
 * Implementation of {@link NodeData}
 *
 * @see NodeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class UserNodeData extends NodeData {
    public static final String NODE_NAME = "User";

    private String userId;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime creationDate;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime updateDate;
    private String firstName;
    private String lastName;
    @JsonProperty("CountryRegion")
    private String country;
    private String zipCode;
    private String timeZone;
    private String language;
    private String phoneNumber;
    private String email;
    private String profileType;
    private String profileName;
    private String displayName;
    private String authenticationProvider;
    private Boolean isEmailValidated;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime emailValidatedDate;
    private Boolean isPhoneNumberValidated;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime phoneNumberValidatedDate;
    private Double totalSpend;
    private Double totalTransactions;
    private Double totalRefundAmount;
    private Double totalChargebackAmount;
    private Double totalDaysOfUse;
    private Double last30DaysSpend;
    private Double last30DaysTransactions;
    private Double last30DaysRefundAmount;
    private Double last30DaysChargebackAmount;
    private Double last30DaysOfUse;
    private Double monthlyAverageSpend;
    private Double monthlyAverageTransactions;
    private Double monthlyAverageRefundAmount;
    private Double monthlyAverageChargebackAmount;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime measuresIngestionDateTimeUTC;
    private String membershipId;

}
