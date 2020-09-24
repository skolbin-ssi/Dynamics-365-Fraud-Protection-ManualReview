// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Queues page details (pagination)
 */

/**
 * TODO: remove this value, not in use any more.
 * as a number of queues, available to senior analysts/admins might be huge
 */
export const DEFAULT_QUEUES_PER_PAGE = 100;

/**
 * Whether regular or escalated queues will be requested
 */
export const DEFAULT_QUEUES_ESCALATION = false;

/**
 * This is an experiment value that fits one screen
 * could be configurable by user in the future
 */
export const DEFAULT_QUEUE_ITEMS_PER_PAGE = 18;

/**
 * Maximum queue processing deadline days
 */
export const MAXIMUM_QUEUE_PROCESSING_DAYS = 30;

/**
 * 5 minutes confirmed with the customer
 */
export const DEFAULT_QUEUE_AUTO_REFRESH_INTERVAL_MILLISECONDS = 5 * 60 * 1000;

export const DEFAULT_QUEUE_AUTO_REFRESH_CHECK_MILLISECONDS = 5 * 1000;

/**
 * Shimmer lines (a.k.a placeholder) number of lines showing
 * in data list table component while data is loading
 */
export const DEFAULT_DATA_LIST_SHIMMER_LINES_NUMBER = 5;

/**
 * Number of minimal days that item would not count as overdue,
 * and need to be processed (Time left column)
 */
export const DEFAULT_HIGH_RISK_DAYS_COUNT = 2;

/**
 * In days using ISO 8601 duration format (PnDTnHnMn.nS)
 */
export const DEFAULT_TIME_TO_SLA_DURATION = `P${DEFAULT_HIGH_RISK_DAYS_COUNT}D`;

/**
 * Timeout that is nearer to duration, in minutes
 */
export const DEFAULT_TIME_TO_TIMEOUT_COUNT = 5;

/**
 * Timeout that is nearer to duration, in minutes using ISO 8601 duration format (PnDTnHnMn.nS)
 */
export const DEFAULT_TIME_TO_TIMEOUT_DURATION = `PT${DEFAULT_TIME_TO_TIMEOUT_COUNT}M`;

/**
 * Default to 1 minute
 *
 * Update timeout interval for the real-time data on demand/supply by queue dashboard
 */
export const DEFAULT_TIMEOUT_COUNTDOWN_INTERVAL_MILLISECONDS = 60 * 1000;
