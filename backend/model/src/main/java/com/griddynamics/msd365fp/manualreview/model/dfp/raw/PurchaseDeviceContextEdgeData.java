package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

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
    private String merchantLocalDate;
}
