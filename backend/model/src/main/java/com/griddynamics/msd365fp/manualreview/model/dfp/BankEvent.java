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
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class BankEvent implements Serializable {
    private String bankEventId;
    private String type;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime bankEventTimestamp;
    private String status;
    private String bankResponseCode;
    private String paymentProcessor;
    @JsonProperty("MRN")
    private String mrn;
    @JsonProperty("MID")
    private String mid;

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
    public OffsetDateTime getBankEventTimestampEpochSeconds() {
        return bankEventTimestamp;
    }
}
