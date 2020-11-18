// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.griddynamics.msd365fp.manualreview.model.jackson.FlexibleDateFormatDeserializer;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.OffsetDateTime;

/**
 * Implementation of {@link EdgeData}
 *
 * @see EdgeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class PurchaseDeviceContextEdgeData extends EdgeData {
    public static final String EDGE_DIRECT_NAME = "PurchaseDeviceContext";
    public static final String EDGE_REVERSED_NAME = "DeviceContextPurchase";

    private String purchaseId;
    private String deviceContextId;
    @JsonProperty("IPAddress")
    private String ipAddress;
    private String routingType;
    private String connectionType;
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
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime merchantLocalDate;
}
