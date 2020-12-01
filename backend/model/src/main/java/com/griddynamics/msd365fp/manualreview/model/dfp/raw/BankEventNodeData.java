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
 * Implementation of {@link NodeData}
 *
 * @see NodeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class BankEventNodeData extends NodeData {
    public static final String NODE_NAME = "BankEvent";

    private String bankEventId;
    private String type;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    private OffsetDateTime bankEventTimestamp;
    private String status;
    private String bankResponseCode;
    private String paymentProcessor;
    @JsonProperty("MRN")
    private String mrn;
    @JsonProperty("MID")
    private String mid;
}
