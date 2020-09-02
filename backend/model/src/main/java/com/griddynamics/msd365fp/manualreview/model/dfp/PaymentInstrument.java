package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class PaymentInstrument implements Serializable {
    private String paymentInstrumentId;
    private BigDecimal purchaseAmount;
    private BigDecimal purchaseAmountInUSD;
    private String merchantPaymentInstrumentId;
    private String type;
    private OffsetDateTime creationDate;
    private OffsetDateTime updateDate;
    private String state;
    private String cardType;
    private String holderName;
    @JsonProperty("BIN")
    private String bin;
    private String expirationDate;
    private String lastFourDigits;
    private String email;
    private String billingAgreementId;
    private String payerId;
    private String payerStatus;
    private String addressStatus;
    @JsonProperty("IMEI")
    private String imei;
    private String addressId;
    private OffsetDateTime merchantLocalDate;
}
