// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class DeviceContext implements Serializable {
    private String deviceContextId;
    private String provider;
    private String deviceContextDC;
    private String merchantFuzzyDeviceId;
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
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime merchantLocalDate;

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
    public OffsetDateTime getMerchantLocalDateEpochSeconds() {
        return merchantLocalDate;
    }
}
