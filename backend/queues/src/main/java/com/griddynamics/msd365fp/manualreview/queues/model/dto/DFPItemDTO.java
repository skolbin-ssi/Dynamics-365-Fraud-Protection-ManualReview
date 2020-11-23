// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DFPItemDTO {
    private String purchaseId;
    private OffsetDateTime merchantLocalDate;
    private BigDecimal totalAmount;
    private BigDecimal totalAmountInUSD;
    private BigDecimal salesTax;
    private BigDecimal salesTaxInUSD;
    private String currency;
    private Integer riskScore;
    private String merchantRuleDecision;
    private String reasonCodes;
    private LAUser user;
    private LADeviceContext deviceContext;
    private Boolean userRestricted;

    @NoArgsConstructor
    @AllArgsConstructor
    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LAUser {
        private String email;
        private String userId;
    }

    @NoArgsConstructor
    @AllArgsConstructor
    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LADeviceContext {
        private String ipAdress;
    }
}
