package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class AssesmentResult implements Serializable {
    private Integer riskScore;
    private String merchantRuleDecision;
    @JsonProperty("MIDFlag")
    private String midFlag;
    private String reasonCodes;
    private String policyApplied;
    private List<PurchaseStatus> purchaseStatusList;

}
