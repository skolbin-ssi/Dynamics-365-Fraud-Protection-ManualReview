// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { OVERTURN_CHART_KEYS, OVERTURNED_DECISIONS_CHART_KEYS } from './dashboard-anlytics';

/**
 * Represents dashboard reports names
 */
export const DASHBOARD_REPORTS_NAMES = {
    QUEUES: {
        QUEUES_TOTAL_REVIEWED_STATS: 'Total review stats by queues',
        QUEUES_TOTAL_DECISIONS: 'Total decisions by queues'
    },
    QUEUE: {
        QUEUE_TOTAL_REVIEWED_STATS: 'Queue review stats',
        QUEUE_ANALYSTS_PERFORMANCE: 'Queue performance of analysts',
        QUEUE_RISK_SCORE_DISTRIBUTION: 'Queue score distribution by decisions',
        QUEUE_OVERTURNED_DECISIONS_RATE: 'Queue overturned decision rates',
        QUEUE_ANALYSTS_ACCURACY: 'Queue overturned statistics by analyst'
    },
    ANALYSTS: {
        ANALYSTS_TOTAL_REVIEWED_STATS: 'Total review stats by analysts',
        ANALYSTS_TOTAL_DECISIONS: 'Total decisions by analysts',
    },
    ANALYST: {
        ANALYST_TOTAL_REVIEWED_STATS: 'Analyst review stats',
        ANALYST_DECISIONS_BY_QUEUE: 'Analyst decisions grouped by queue',
        ANALYST_PERFORMANCE_OVERVIEW: 'Analyst performance overview',
        ANALYST_DECISIONS: 'Analyst decisions',
        ANALYST_OVERTURNED_DECISIONS_RATE: 'Analyst overturned decision rates',
        ANALYST_OVERTURNED_QUEUE_RATE: 'Analyst overturned statistics by queue'
    },
    DEMAND: {
        DEMAND_TOTAL_NEW__RELEASED_ORDERS: 'Total new-released orders',
        DEMAND_TOTAL_REMAINING_ORDERS: 'Total remaining orders',
        DEMAND_SUPPLY_STATS: 'Demand-supply stats by queues'
    },
    DEMAND_BY_QUEUE: {
        DEMAND_QUEUE_REMAINING_ORDERS: 'Remaining orders in queue',
        DEMAND_QUEUE_NEW_RELEASED_ORDERS: 'New-released orders in queue',
        DEMAND_QUEUE_RISK_SCORE_DISTRIBUTION: 'Active score distribution in queue',
        DEMAND_QUEUE_REGULAR_ACTIVE: 'Regular active orders in queue',
        DEMAND_QUEUE_ESCALATED_ACTIVE: 'Escalated active orders in queue'
    },
    PERSONAL_PERFORMANCE: {
        PERSONAL_TOTAL_REVIEWED_STATS: 'Personal total reviewed orders',
        PERSONAL_PERFORMANCE_BY_QUEUE: 'Personal performance by queue',
        PERSONAL_PERFORMANCE_OVERVIEW: 'Personal performance overview',
        PERSONAL_DECISIONS: 'Personal decisions',
        PERSONAL_OVERTURNED_DECISIONS_RATE: 'Personal overturned decision rate',
        PERSONAL_OVERTURNED_QUEUE_RATE: 'Personal overturned rate by queue'
    }
};

/**
 * Overturned decisions chart keys for generating CSV reports file
 */
export const OVERTURNED_DECISIONS_REPORT_KEYS = {
    [OVERTURNED_DECISIONS_CHART_KEYS.GOOD_DECISIONS]: 'good decisions applied',
    [OVERTURNED_DECISIONS_CHART_KEYS.OVERTURNED_GOOD_DECISIONS]: 'overturned good decisions',
    [OVERTURNED_DECISIONS_CHART_KEYS.GOOD_DECISION_OVERTURN_RATE]: 'good decision overturn rate, %',
    [OVERTURNED_DECISIONS_CHART_KEYS.BAD_DECISIONS]: 'bad decisions applied',
    [OVERTURNED_DECISIONS_CHART_KEYS.OVERTURNED_BAD_DECISIONS]: 'overturned bad decisions',
    [OVERTURNED_DECISIONS_CHART_KEYS.BAD_DECISION_OVERTURN_RATE]: 'bad decision overturn rate, %',
    [OVERTURNED_DECISIONS_CHART_KEYS.AVERAGE_OVERTURN_RATE]: 'average overturn rate, %',
};

/**
 * Overturn chart keys for generating CSV file
 */
export const OVERTURN_CHART_REPORT_KEYS = {
    [OVERTURN_CHART_KEYS.GOOD]: 'good, %',
    [OVERTURN_CHART_KEYS.OVERTURNED_GOOD]: 'overturned good, %',
    [OVERTURN_CHART_KEYS.BAD]: 'bad, %',
    [OVERTURN_CHART_KEYS.OVERTURNED_BAD]: 'overturned bad, %'
};

export enum ANALYST_PERF_OVERVIEW_KEYS {
    NUMBER_OF_DECISIONS = 'NUMBER_OF_DECISIONS',
    ANNUAL_NUMBER_OF_DECISIONS = 'ANNUAL_NUMBER_OF_DECISIONS',
    GOOD_DECISIONS = 'GOOD_DECISIONS',
    ANNUAL_GOOD_DECISIONS = 'ANNUAL_GOOD_DECISIONS',
    WATCHED_DECISIONS = 'WATCHED_DECISIONS',
    ANNUAL_WATCHED_DECISIONS = 'ANNUAL_WATCHED_DECISIONS',
    BAD_DECISIONS = 'BAD_DECISIONS',
    ANNUAL_BAD_DECISIONS = 'ANNUAL_BAD_DECISIONS',
    ESCALATED_ITEMS = 'ESCALATED_ITEMS',
    ANNUAL_ESCALATED_ITEMS = 'ANNUAL_ESCALATED_ITEMS',
    WAISTED_TIME = 'WAISTED_TIME',
    TIME_TO_MAKE_DECISION = 'TIME_TO_MAKE_DECISION',
}
export const ANALYSTS_PERFORMANCE_OVERVIEW_REPORT_NAMES = {
    [ANALYST_PERF_OVERVIEW_KEYS.NUMBER_OF_DECISIONS]: 'number of decisions',
    [ANALYST_PERF_OVERVIEW_KEYS.ANNUAL_NUMBER_OF_DECISIONS]: 'annual number of decisions',
    [ANALYST_PERF_OVERVIEW_KEYS.GOOD_DECISIONS]: 'good decisions',
    [ANALYST_PERF_OVERVIEW_KEYS.ANNUAL_GOOD_DECISIONS]: 'annual good decisions',
    [ANALYST_PERF_OVERVIEW_KEYS.WATCHED_DECISIONS]: 'watch decisions',
    [ANALYST_PERF_OVERVIEW_KEYS.ANNUAL_WATCHED_DECISIONS]: 'annual watch decisions',
    [ANALYST_PERF_OVERVIEW_KEYS.BAD_DECISIONS]: 'bad decisions',
    [ANALYST_PERF_OVERVIEW_KEYS.ANNUAL_BAD_DECISIONS]: 'annual bad decisions',
    [ANALYST_PERF_OVERVIEW_KEYS.ESCALATED_ITEMS]: 'escalated items',
    [ANALYST_PERF_OVERVIEW_KEYS.ANNUAL_ESCALATED_ITEMS]: 'annual escalated items',
    [ANALYST_PERF_OVERVIEW_KEYS.WAISTED_TIME]: 'waisted time',
    [ANALYST_PERF_OVERVIEW_KEYS.TIME_TO_MAKE_DECISION]: 'time to make a decision',
};
