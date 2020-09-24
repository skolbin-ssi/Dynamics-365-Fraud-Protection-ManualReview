// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Implementation of {@link NodeData}
 *
 * @see NodeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class DeviceContextNodeData extends NodeData {
    private String deviceContextId;
    private String provider;
    private String deviceContextDC;
    private String userAgent;
    private String screenResolution;
    @JsonProperty("OS")
    private String os;
    private String deviceType;
    private String browserLanguage;
    private String discoveredIPAddress;
    private String routingType;
    private String connectionType;
    private String externalDeviceId;
    private String externalDeviceType;
    @JsonProperty("IPLatitude")
    private Double ipLatitude;
    @JsonProperty("IPLongitude")
    private Double ipLongitude;
    @JsonProperty("IPCity")
    private String ipCity;
    @JsonProperty("IPCountry")
    private String ipCountry;
    @JsonProperty("IPState")
    private String ipState;
}
