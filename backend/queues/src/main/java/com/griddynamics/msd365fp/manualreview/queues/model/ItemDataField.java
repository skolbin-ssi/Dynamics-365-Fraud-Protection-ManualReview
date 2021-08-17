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
    ORIGINAL_ORDER_ID("purchase.OriginalOrderId"),
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
    EMAIL_DOMAIN_DISPOSABLE("purchase.CalculatedFields.disposableEmailDomain"),

    // payment
    MERCHANT_PAYMENT_INSTRUMENT_ID("purchase.PaymentInstrumentList[].PaymentInstrumentId"),
    CUSTOM_CC_HASH("purchase.CustomData.cc_hash"),
    PAYMENT_GATEWAY("purchase.BankEventsList[].PaymentProcessor"),
    BANK_EVENT_RESULT_CODE("purchase.BankEventsList[].BankResponseCode"),
    AUTH_BANK_EVENT_RESULT_CODE("purchase.CalculatedFields.authBankEventResultCodes[]"),
    APPROVE_BANK_EVENT_RESULT_CODE("purchase.CalculatedFields.approveBankEventResultCodes[]"),
    DECLINE_BANK_EVENT_RESULT_CODE("purchase.CalculatedFields.declineBankEventResultCodes[]"),
    PI_BIN("purchase.PaymentInstrumentList[].BIN"),
    PI_COUNTRY("purchase.CalculatedFields.billingCountries[]"),
    PI_ZIP("purchase.CalculatedFields.billingZipCodes[]"),
    PI_ADDRESS("purchase.CalculatedFields.billingAddresses[]"),
    BILLING_COUNTRY_MATCHES_SHIPPING_COUNTRY("purchase.CalculatedFields.matchingOfCountriesForBillingAndShipping"),
    BILLING_COUNTRY_MATCHES_IP_COUNTRY("purchase.CalculatedFields.matchingOfCountriesForBillingAndIP"),

    // device
    DEVICE_CONTEXT_ID("purchase.DeviceContext.DeviceContextId"),
    EXTERNAL_DEVICE_ID("purchase.DeviceContext.ExternalDeviceId"),
    DEVICE_CONTEXT_USER_AGENT("purchase.DeviceContext.UserAgent"),
    IP_COUNTRY("purchase.DeviceContext.IPCountry"),
    IP_COUNTRY_MATCHES_SHIPPING_COUNTRY("purchase.CalculatedFields.matchingOfCountriesForShippingAndIP"),
    DISTANCE_TO_PREVIOUS_TRANSACTION_IP("purchase.CalculatedFields.distanceToPreviousTransactionIP"),

    // velocity
    CUSTOM_CONNECTION_COUNT_BUCKET("purchase.CustomData.connection_count_bucket"),
    TOTAL_TRANSACTION_AMOUNT("purchase.User.TotalSpend"),
    TOTAL_TRANSACTION_COUNT("purchase.User.TotalTransactions"),
    LAST_30DAYS_TRANSACTION_AMOUNT("purchase.User.last30DaysSpend"),
    LAST_30DAYS_TRANSACTION_COUNT("purchase.User.last30DaysTransactions"),
    LAST_HOUR_TRANSACTION_COUNT("purchase.CalculatedFields.transactionCount.hour"),
    LAST_DAY_TRANSACTION_COUNT("purchase.CalculatedFields.transactionCount.day"),
    LAST_WEEK_TRANSACTION_COUNT("purchase.CalculatedFields.transactionCount.week"),
    LAST_HOUR_SUCCESSFUL_TRANSACTION_COUNT("purchase.CalculatedFields.successfulTransactionCount.hour"),
    LAST_DAY_SUCCESSFUL_TRANSACTION_COUNT("purchase.CalculatedFields.successfulTransactionCount.day"),
    LAST_WEEK_SUCCESSFUL_TRANSACTION_COUNT("purchase.CalculatedFields.successfulTransactionCount.week"),
    LAST_HOUR_REJECTED_TRANSACTION_COUNT("purchase.CalculatedFields.rejectedTransactionCount.hour"),
    LAST_DAY_REJECTED_TRANSACTION_COUNT("purchase.CalculatedFields.rejectedTransactionCount.day"),
    LAST_WEEK_REJECTED_TRANSACTION_COUNT("purchase.CalculatedFields.rejectedTransactionCount.week"),
    LAST_HOUR_FAILED_TRANSACTION_COUNT("purchase.CalculatedFields.failedTransactionCount.hour"),
    LAST_DAY_FAILED_TRANSACTION_COUNT("purchase.CalculatedFields.failedTransactionCount.day"),
    LAST_WEEK_FAILED_TRANSACTION_COUNT("purchase.CalculatedFields.failedTransactionCount.week"),
    LAST_HOUR_TRANSACTION_AMOUNT("purchase.CalculatedFields.transactionAmount.hour"),
    LAST_DAY_TRANSACTION_AMOUNT("purchase.CalculatedFields.transactionAmount.day"),
    LAST_WEEK_TRANSACTION_AMOUNT("purchase.CalculatedFields.transactionAmount.week"),
    LAST_HOUR_SUCCESSFUL_TRANSACTION_AMOUNT("purchase.CalculatedFields.successfulTransactionCount.hour"),
    LAST_DAY_SUCCESSFUL_TRANSACTION_AMOUNT("purchase.CalculatedFields.successfulTransactionCount.day"),
    LAST_WEEK_SUCCESSFUL_TRANSACTION_AMOUNT("purchase.CalculatedFields.successfulTransactionCount.week"),
    LAST_HOUR_REJECTED_TRANSACTION_AMOUNT("purchase.CalculatedFields.rejectedTransactionAmount.hour"),
    LAST_DAY_REJECTED_TRANSACTION_AMOUNT("purchase.CalculatedFields.rejectedTransactionAmount.day"),
    LAST_WEEK_REJECTED_TRANSACTION_AMOUNT("purchase.CalculatedFields.rejectedTransactionAmount.week"),
    LAST_HOUR_FAILED_TRANSACTION_AMOUNT("purchase.CalculatedFields.failedTransactionAmount.hour"),
    LAST_DAY_FAILED_TRANSACTION_AMOUNT("purchase.CalculatedFields.failedTransactionAmount.day"),
    LAST_WEEK_FAILED_TRANSACTION_AMOUNT("purchase.CalculatedFields.failedTransactionAmount.week"),

    LAST_HOUR_UNIQUE_PI("purchase.CalculatedFields.uniquePaymentInstrumentCount.hour"),
    LAST_DAY_UNIQUE_PI("purchase.CalculatedFields.uniquePaymentInstrumentCount.day"),
    LAST_WEEK_UNIQUE_PI("purchase.CalculatedFields.uniquePaymentInstrumentCount.week"),
    LAST_HOUR_TRANSACTION_COUNT_CURRENT_PI("purchase.CalculatedFields.currentPaymentInstrumentTransactionCount.hour"),
    LAST_DAY_TRANSACTION_COUNT_CURRENT_PI("purchase.CalculatedFields.currentPaymentInstrumentTransactionCount.day"),
    LAST_WEEK_TRANSACTION_COUNT_CURRENT_PI("purchase.CalculatedFields.currentPaymentInstrumentTransactionCount.week"),
    LAST_HOUR_TRANSACTION_AMOUNT_CURRENT_PI("purchase.CalculatedFields.currentPaymentInstrumentTransactionAmount.hour"),
    LAST_DAY_TRANSACTION_AMOUNT_CURRENT_PI("purchase.CalculatedFields.currentPaymentInstrumentTransactionAmount.day"),
    LAST_WEEK_TRANSACTION_AMOUNT_CURRENT_PI("purchase.CalculatedFields.currentPaymentInstrumentTransactionAmount.week"),

    CUSTOM_LAST6MONTHS_INVITATIONS_SENT("purchase.CustomData.num_invitations_sent_last_6_months"),
    CUSTOM_LAST_DAY_CARD_USAGE_COUNT("purchase.CustomData.purchases_per_card_24_hours"),

    LAST_HOUR_UNIQUE_IP_COUNTRIES("purchase.CalculatedFields.uniqueIPCountries.hour"),
    LAST_DAY_UNIQUE_IP_COUNTRIES("purchase.CalculatedFields.uniqueIPCountries.day"),
    LAST_WEEK_UNIQUE_IP_COUNTRIES("purchase.CalculatedFields.uniqueIPCountries.week");


    @Getter
    private final String path;

    public boolean isArrayField() {
        return path.contains("[]");
    }
}
