// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@SuppressWarnings("unused")
@AllArgsConstructor
public enum ItemDataField implements Serializable {
    // item attributes
    ID("id"),
    IMPORT_DATE("imported"),
    ACTIVE("active"),
    QUEUE_IDS("queueIds[]"),
    LABEL_VALUE("label[\"value\"]"),// "value" - is a special word in Cosmos Db, so we have to escape it
    TAGS("tags[]"),
    LOCK_OWNER_ID("lock.ownerId"),
    HOLD_OWNER_ID("hold.ownerId"),
    LABEL_AUTHOR_ID("label.authorId"),
    LABEL_QUEUE_ID("label.queueId"),

    // DFP-generated data
    SCORE("decision.riskScore"),

    // purchase
    TOTAL_AMOUNT("purchase.TotalAmountInUSD"),
    PRODUCT_SKU("purchase.ProductList[].Sku"),
    PRODUCT_CATEGORY("purchase.ProductList[].Category"),
    PRODUCT_TYPE("purchase.ProductList[].Type"),
    CUSTOM_PRODUCT_FAMILIES("purchase.CustomData.product_families"),

    // user
    USER_COUNTRY("purchase.User.Country"),
    ACCOUNT_AGE("purchase.CalculatedFields.accountAgeInDays"),
    CUSTOM_ACCOUNT_AGE_BUCKET("purchase.CustomData.account_age_in_days_bucket"),
    AGE_OF_FIRST_KNOWN_TRANSACTION("purchase.CalculatedFields.activityAgeInDays"),
    AUTHENTICATION_PROVIDER("purchase.User.AuthenticationProvider"),
    AGGREGATED_EMAIL_DOMAIN("purchase.CalculatedFields.aggregatedEmailDomain"),
    AGGREGATED_EMAIL_CONFIRMED("purchase.CalculatedFields.aggregatedEmailConfirmed"),

    // payment
    MERCHANT_PAYMENT_INSTRUMENT_ID("purchase.PaymentInstrumentList[].PaymentInstrumentId"),
    CUSTOM_CC_HASH("purchase.CustomData.cc_hash"),
    PAYMENT_GATEWAY("purchase.BankEventsList[].PaymentProcessor"),
    BANK_RESPONSE_CODE("purchase.BankEventsList[].BankResponseCode"),
    AUTH_RESULT_CODE("purchase.CalculatedFields.authResultCodes[]"),
    APPROVE_RESULT_CODE("purchase.CalculatedFields.approveResultCodes[]"),
    DECLINE_RESULT_CODE("purchase.CalculatedFields.declineResultCodes[]"),
    PI_BIN("purchase.PaymentInstrumentList[].BIN"),
    PI_COUNTRY("purchase.CalculatedField.billingCountries[]"),
    PI_ZIP("purchase.CalculatedField.billingZipCodes[]"),
    PI_ADDRESS("purchase.CalculatedField.billingAddresses[]"),
    BILLING_COUNTRY_MATCHES_SHIPPING_COUNTRY("purchase.CalculatedFields.matchingOfCountriesForBillingAndShipping"),
    BILLING_COUNTRY_MATCHES_IP_COUNTRY("purchase.CalculatedFields.matchingOfCountriesForBillingAndIP"),

    // device
    EXTERNAL_DEVICE_ID("purchase.DeviceContext.ExternalDeviceId"),
    DEVICE_CONTEXT_USER_AGENT("purchase.DeviceContext.UserAgent"),
    IP_COUNTRY("purchase.DeviceContext.IPCountry"),
    IP_COUNTRY_MATCHES_SHIPPING_COUNTRY("purchase.CalculatedFields.matchingOfCountriesForShippingAndIP"),

    // velocity
    CUSTOM_CONNECTION_COUNT_BUCKET("purchase.CustomData.connection_count_bucket"),
    TOTAL_TRANSACTION_AMOUNT("purchase.User.TotalSpend"),
    TOTAL_TRANSACTION_COUNT("purchase.User.TotalTransactions"),
    LAST_30DAYS_TRANSACTION_AMOUNT("purchase.User.last30DaysSpend"),
    LAST_30DAYS_TRANSACTION_COUNT("purchase.User.last30DaysTransactions"),
    LAST_HOUR_TRANSACTION_COUNT("purchase.CalculatedFields.lastHourTransactionCount"),
    LAST_DAY_TRANSACTION_COUNT("purchase.CalculatedFields.lastDayTransactionCount"),
    LAST_WEEK_TRANSACTION_COUNT("purchase.CalculatedFields.lastWeekTransactionCount"),
    LAST_HOUR_SUCCESSFUL_TRANSACTION_COUNT("purchase.CalculatedFields.lastHourSuccessfulTransactionCount"),
    LAST_DAY_SUCCESSFUL_TRANSACTION_COUNT("purchase.CalculatedFields.lastDaySuccessfulTransactionCount"),
    LAST_WEEK_SUCCESSFUL_TRANSACTION_COUNT("purchase.CalculatedFields.lastWeekSuccessfulTransactionCount"),
    LAST_HOUR_REJECTED_TRANSACTION_COUNT("purchase.CalculatedFields.lastHourRejectedTransactionCount"),
    LAST_DAY_REJECTED_TRANSACTION_COUNT("purchase.CalculatedFields.lastDayRejectedTransactionCount"),
    LAST_WEEK_REJECTED_TRANSACTION_COUNT("purchase.CalculatedFields.lastWeekRejectedTransactionCount"),
    LAST_HOUR_FAILED_TRANSACTION_COUNT("purchase.CalculatedFields.lastHourFailedTransactionCount"),
    LAST_DAY_FAILED_TRANSACTION_COUNT("purchase.CalculatedFields.lastDayFailedTransactionCount"),
    LAST_WEEK_FAILED_TRANSACTION_COUNT("purchase.CalculatedFields.lastWeekFailedTransactionCount"),
    LAST_HOUR_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastHourTransactionAmount"),
    LAST_DAY_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastDayTransactionAmount"),
    LAST_WEEK_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastWeekTransactionAmount"),
    LAST_HOUR_SUCCESSFUL_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastHourSuccessfulTransactionAmount"),
    LAST_DAY_SUCCESSFUL_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastDaySuccessfulTransactionAmount"),
    LAST_WEEK_SUCCESSFUL_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastWeekSuccessfulTransactionAmount"),
    LAST_HOUR_REJECTED_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastHourRejectedTransactionAmount"),
    LAST_DAY_REJECTED_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastDayRejectedTransactionAmount"),
    LAST_WEEK_REJECTED_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastWeekRejectedTransactionAmount"),
    LAST_HOUR_FAILED_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastHourFailedTransactionAmount"),
    LAST_DAY_FAILED_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastDayFailedTransactionAmount"),
    LAST_WEEK_FAILED_TRANSACTION_AMOUNT("purchase.CalculatedFields.lastWeekFailedTransactionAmount"),

    LAST_HOUR_UNIQUE_PI("purchase.CalculatedFields.lastHourUniquePaymentInstrumentCount"),
    LAST_DAY_UNIQUE_PI("purchase.CalculatedFields.lastDayUniquePaymentInstrumentCount"),
    LAST_WEEK_UNIQUE_PI("purchase.CalculatedFields.lastWeekUniquePaymentInstrumentCount"),
    LAST_HOUR_TRANSACTION_COUNT_CURRENT_PI("purchase.CalculatedFields.lastHourTransactionCountWithCurrentPaymentInstrument"),
    LAST_DAY_TRANSACTION_COUNT_CURRENT_PI("purchase.CalculatedFields.lastDayTransactionCountWithCurrentPaymentInstrument"),
    LAST_WEEK_TRANSACTION_COUNT_CURRENT_PI("purchase.CalculatedFields.lastWeekTransactionCountWithCurrentPaymentInstrument"),
    LAST_HOUR_TRANSACTION_AMOUNT_CURRENT_PI("purchase.CalculatedFields.lastHourTransactionAmountWithCurrentPaymentInstrument"),
    LAST_DAY_TRANSACTION_AMOUNT_CURRENT_PI("purchase.CalculatedFields.lastDayTransactionAmountWithCurrentPaymentInstrument"),
    LAST_WEEK_TRANSACTION_AMOUNT_CURRENT_PI("purchase.CalculatedFields.lastWeekTransactionAmountWithCurrentPaymentInstrument"),

    CUSTOM_LAST6MONTHS_INVITATIONS_SENT("purchase.CustomData.num_invitations_sent_last_6_months"),
    CUSTOM_LAST_DAY_CARD_USAGE_COUNT("purchase.CustomData.purchases_per_card_24_hours");


    @Getter
    private final String path;

    public boolean isArrayField() {
        return path.contains("[]");
    }
}
