/*
 * Knowledge Gateway Service
 * This API allows merchants using Microsoft Dynamics 365 Fraud Protection to send events for risk evaluation. These events are used to build up information about the purchases the customers are making and provide merchants with a recommendation to approve or reject transactions due to Fraud. For integration and testing, please use the https://api.dfp.microsoft-int.com/ endpoint. For Production, please use https://api.dfp.microsoft.com/.
 *
 * OpenAPI spec version: v1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

package com.griddynamics.msd365fp.manualreview.queues.model.testing;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Objects;

/**
 * Metadata properties for the payload
 */
@Schema(description = "Metadata properties for the payload")
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2019-11-14T20:07:05.300728+04:00[Europe/Saratov]")
public class MicrosoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata {
  @JsonProperty("trackingId")
  private String trackingId;

  @JsonProperty("merchantTimeStamp")
  private String merchantTimeStamp;

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata trackingId(String trackingId) {
    this.trackingId = trackingId;
    return this;
  }

   /**
   * TrackingId for the event
   * @return trackingId
  **/
  @Schema(description = "TrackingId for the event")
  public String getTrackingId() {
    return trackingId;
  }

  public void setTrackingId(String trackingId) {
    this.trackingId = trackingId;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata merchantTimeStamp(String merchantTimeStamp) {
    this.merchantTimeStamp = merchantTimeStamp;
    return this;
  }

   /**
   * TimeStamp for the event
   * @return merchantTimeStamp
  **/
  @Schema(description = "TimeStamp for the event")
  public String getMerchantTimeStamp() {
    return merchantTimeStamp;
  }

  public void setMerchantTimeStamp(String merchantTimeStamp) {
    this.merchantTimeStamp = merchantTimeStamp;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MicrosoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata microsoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata = (MicrosoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata) o;
    return Objects.equals(this.trackingId, microsoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata.trackingId) &&
        Objects.equals(this.merchantTimeStamp, microsoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata.merchantTimeStamp);
  }

  @Override
  public int hashCode() {
    return Objects.hash(trackingId, merchantTimeStamp);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class MicrosoftDynamicsFraudProtectionV1ModelsPurchaseStatusActivityMetadata {\n");
    
    sb.append("    trackingId: ").append(toIndentedString(trackingId)).append("\n");
    sb.append("    merchantTimeStamp: ").append(toIndentedString(merchantTimeStamp)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }

}
