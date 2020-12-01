// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LinkAnalysisDetailsResponse {
    Set<PurchaseDetails> purchaseDetails;

    @Data
    @JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
    public static class PurchaseDetails {
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
        private User user;
        private DeviceContext deviceContext;
        private boolean userRestricted;

        @NoArgsConstructor
        @AllArgsConstructor
        @Data
        @JsonInclude(JsonInclude.Include.NON_NULL)
        @JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
        public static class User {
            private String email;
            private String userId;
        }

        @NoArgsConstructor
        @AllArgsConstructor
        @Data
        @JsonInclude(JsonInclude.Include.NON_NULL)
        @JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
        public static class DeviceContext {
            private String ipAdress;
        }
    }
}
