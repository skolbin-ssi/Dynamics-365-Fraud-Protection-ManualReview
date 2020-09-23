// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class DeviceContext implements Serializable {
    private String deviceContextId;
    private String provider;
    private String deviceContextDC;
    private String externalDeviceId;
    private String externalDeviceType;
    private String userAgent;
    private String screenResolution;
    @JsonProperty("OS")
    private String os;
    private String deviceType;
    private String browserLanguage;
    private String discoveredIPAddress;
    private String routingType;
    private String connectionType;
    @JsonProperty("IPAddress")
    private String ipAddress;
    @JsonProperty("IPLatitude")
    private BigDecimal ipLatitude;
    @JsonProperty("IPLongitude")
    private BigDecimal ipLongitude;
    @JsonProperty("IPCity")
    private String ipCity;
    @JsonProperty("IPCountry")
    private String ipCountry;
    @JsonProperty("IPState")
    private String ipState;
    private String purchaseId;
    private OffsetDateTime merchantLocalDate;
}
