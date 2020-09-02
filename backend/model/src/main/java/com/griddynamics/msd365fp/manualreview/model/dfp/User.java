package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class User implements Serializable {
    private String userId;
    private OffsetDateTime creationDate;
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
    private OffsetDateTime emailValidatedDate;
    private Boolean isPhoneNumberValidated;
    private OffsetDateTime phoneNumberValidatedDate;
    private BigDecimal totalSpend;
    private BigDecimal totalTransactions;
    private BigDecimal totalRefundAmount;
    private BigDecimal totalChargebackAmount;
    private BigDecimal totalDaysOfUse;
    private BigDecimal last30DaysSpend;
    private BigDecimal last30DaysTransactions;
    private BigDecimal last30DaysRefundAmount;
    private BigDecimal last30DaysChargebackAmount;
    private BigDecimal last30DaysOfUse;
    private BigDecimal monthlyAverageSpend;
    private BigDecimal monthlyAverageTransactions;
    private BigDecimal monthlyAverageRefundAmount;
    private BigDecimal monthlyAverageChargebackAmount;
    private OffsetDateTime measuresIngestionDateTimeUTC;
    private OffsetDateTime merchantLocalDate;
}
