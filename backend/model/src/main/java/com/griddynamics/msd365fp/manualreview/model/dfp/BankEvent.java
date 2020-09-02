package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.io.Serializable;
import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class BankEvent implements Serializable {
    private String bankEventId;
    private String type;
    private OffsetDateTime bankEventTimestamp;
    private String status;
    private String bankResponseCode;
    private String paymentProcessor;
    @JsonProperty("MRN")
    private String mrn;
    @JsonProperty("MID")
    private String mid;
}
