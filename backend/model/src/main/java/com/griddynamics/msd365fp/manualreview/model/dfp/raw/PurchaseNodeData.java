package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * Implementation of {@link NodeData}
 *
 * @see NodeData
 */
@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class PurchaseNodeData extends NodeData {
    private String purchaseId;
    private String assessmentType;
    private String originalOrderId;
    private String merchantLocalDate;
    private String customerLocalDate;
    private Double totalAmount;
    private Double totalAmountInUSD;
    private Double salesTax;
    private Double salesTaxInUSD;
    private String currency;
    private String shippingMethod;
    private Double currencyConversionFactor;
    private Integer riskScore;
    private String merchantRuleDecision;
    @JsonProperty("MIDFlag")
    private String midFlag;
    private String reasonCodes;
    private String policyApplied;
    private String bankName;
    private String hashedEvaluationId;

    private Map<String, String> customData = new HashMap<>();
    private Map<String, String> additionalParams = new HashMap<>();

    @Override
    public void setAdditionalParam(String name, String value) {
        if (StringUtils.startsWith(name, "CustomData.")) {
            customData.put(StringUtils.substringAfter(name, "CustomData."), value);
        } else {
            additionalParams.put(name, value);
        }
    }
}
