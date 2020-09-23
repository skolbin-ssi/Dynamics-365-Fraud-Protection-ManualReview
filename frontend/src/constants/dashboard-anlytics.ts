// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DEFAULT_QUEUES_PER_PAGE } from './default';
import { COLORS } from '../styles/variables';

/**
 * Represents how many sorted items to display on the dashboard pages
 */
export enum PERFORMANCE_RATING {
    ALL = 'ALL',
    TEN = 'TEN',
    FIVE = 'FIVE',
    THREE = 'THREE'
}

export const TOP_QUEUES_DISPLAY_VIEW = new Map<PERFORMANCE_RATING, string>([
    [PERFORMANCE_RATING.ALL, 'All queues'],
    [PERFORMANCE_RATING.TEN, 'Top 10'],
    [PERFORMANCE_RATING.FIVE, 'Top 5'],
    [PERFORMANCE_RATING.THREE, 'Top 3']
]);

export const TOP_ANALYST_DISPLAY_VIEW = new Map<PERFORMANCE_RATING, string>([
    [PERFORMANCE_RATING.ALL, 'All analysts'],
    [PERFORMANCE_RATING.TEN, 'Top 10'],
    [PERFORMANCE_RATING.FIVE, 'Top 5'],
    [PERFORMANCE_RATING.THREE, 'Top 3']
]);

export const PERFORMANCE_RATING_TO_NUMBER = new Map<PERFORMANCE_RATING, number>([
    [PERFORMANCE_RATING.THREE, 3],
    [PERFORMANCE_RATING.FIVE, 5],
    [PERFORMANCE_RATING.TEN, 10],
    [PERFORMANCE_RATING.ALL, DEFAULT_QUEUES_PER_PAGE]
]);

export enum CHART_AGGREGATION_PERIOD {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH'
}

/**
 * Represents dashboard statistic aggregation
 * in days, using ISO 8601 duration format (PnDTnHnMn.nS)
 */
export enum DURATION_PERIOD {
    DAY = 'P1D',
    WEEK = 'P7D',
    MONTH = 'P31D'
}

export const STATISTIC_AGGREGATION = new Map<CHART_AGGREGATION_PERIOD, DURATION_PERIOD>([
    [CHART_AGGREGATION_PERIOD.DAY, DURATION_PERIOD.DAY],
    [CHART_AGGREGATION_PERIOD.WEEK, DURATION_PERIOD.WEEK],
    [CHART_AGGREGATION_PERIOD.MONTH, DURATION_PERIOD.MONTH]
]);

export const LINE_CHART_X_SCALE_TICKS_VALUES = new Map<CHART_AGGREGATION_PERIOD, string>([
    [CHART_AGGREGATION_PERIOD.DAY, 'every day'],
    [CHART_AGGREGATION_PERIOD.WEEK, 'every week'],
    [CHART_AGGREGATION_PERIOD.MONTH, 'every month']
]);

export const CHART_AGGREGATION_PERIOD_DISPLAY = new Map<CHART_AGGREGATION_PERIOD, string>([
    [CHART_AGGREGATION_PERIOD.DAY, 'Day'],
    [CHART_AGGREGATION_PERIOD.WEEK, 'Week'],
    [CHART_AGGREGATION_PERIOD.MONTH, 'Month']
]);

export enum DASHBOARD_SEGMENTATION {
    QUEUES = 'QUEUES',
    ANALYSTS = 'ANALYSTS',
    DEMAND = 'DEMAND'
}

export const DASHBOARD_SEGMENTATION_DISPLAY_VIEW = new Map<DASHBOARD_SEGMENTATION, string>([
    [DASHBOARD_SEGMENTATION.QUEUES, 'Queues'],
    [DASHBOARD_SEGMENTATION.ANALYSTS, 'Analysts'],
    [DASHBOARD_SEGMENTATION.DEMAND, 'Demand/Supply']
]);

export enum DATE_RANGE {
    SIX_WEEKS = 'SIX_WEEKS',
    FOUR_WEEKS = 'FOUR_WEEKS',
    TWO_WEEKS = 'TWO_WEEKS',
    CUSTOM = 'CUSTOM'
}

export const DATE_RANGE_DISPLAY = {
    [DATE_RANGE.SIX_WEEKS]: '6 weeks',
    [DATE_RANGE.FOUR_WEEKS]: '4 weeks',
    [DATE_RANGE.TWO_WEEKS]: '2 weeks',
    [DATE_RANGE.CUSTOM]: 'Custom range'
};

export const DATE_RANGE_DAYS = {
    [DATE_RANGE.TWO_WEEKS]: 14,
    [DATE_RANGE.FOUR_WEEKS]: 28,
    [DATE_RANGE.SIX_WEEKS]: 42
};

export enum DASHBOARD_SEARCH_OPTIONS {
    ANALYSTS = 'ANALYSTS',
    QUEUES = 'QUEUES'
}

export const DASHBOARD_SEARCH_DISPLAY_OPTIONS = {
    [DASHBOARD_SEARCH_OPTIONS.ANALYSTS]: 'Analysts',
    [DASHBOARD_SEARCH_OPTIONS.QUEUES]: 'Queues'
};

export const WARNING_MESSAGES = {
    NO_DATA_FOR_SELECTED_PERIOD_MESSAGE: 'Sorry we don\'t have a data to visualize charts for this period',
    METRICS: {
        NO_METRICS_MESSAGE: 'Sorry we don\'t have a data to visualize metrics',
    },
    NO_SELECTED_QUEUE_ITEMS: 'Please select a queue to display data',
    NO_SELECTED_ANALYST_ITEMS: 'Please select an analyst to display data'
};

export enum DASHBOARD_REPORT_PAGE {
    QUEUE_PERFORMANCE_PAGE = 'QUEUE_PERFORMANCE_PAGE',
    QUEUES_PERFORMANCE_PAGE = 'QUEUES_PERFORMANCE_PAGE'
}

/**
 * Overturn chart keys for the UI
 */
export enum OVERTURN_CHART_KEYS {
    GOOD = 'GOOD',
    OVERTURNED_GOOD = 'OVERTURNED_GOOD',
    BAD = 'BAD',
    OVERTURNED_BAD = 'OVERTURNED_BAD'
}

/**
 * Overturn chart keys for generating CSV file
 */
export const OVERTURN_CHART_REPORT_KEYS = {
    [OVERTURN_CHART_KEYS.GOOD]: 'good',
    [OVERTURN_CHART_KEYS.OVERTURNED_GOOD]: 'overturned good ',
    [OVERTURN_CHART_KEYS.BAD]: 'bad',
    [OVERTURN_CHART_KEYS.OVERTURNED_BAD]: 'overturned bad'
};

/**
 * Overturned decisions chart keys for the UI
 */
export enum OVERTURNED_DECISIONS_CHART_KEYS {
    GOOD_DECISIONS = 'GOOD_DECISIONS',
    OVERTURNED_GOOD_DECISIONS = 'OVERTURNED_GOOD_DECISIONS',
    GOOD_DECISION_OVERTURN_RATE = 'GOOD_DECISION_OVERTURN_RATE',
    BAD_DECISIONS = 'BAD_DECISIONS',
    OVERTURNED_BAD_DECISIONS = 'OVERTURNED_BAD_DECISIONS',
    BAD_DECISION_OVERTURN_RATE = 'BAD_DECISION_OVERTURN_RATE',
    AVERAGE_OVERTURN_RATE = 'AVERAGE_OVERTURN_RATE'
}

/**
 * Overturned decisions chart keys for generating CSV file
 */
export const OVERTURNED_DECISIONS_REPORT_KEYS = {
    [OVERTURNED_DECISIONS_CHART_KEYS.GOOD_DECISIONS]: 'good decisions',
    [OVERTURNED_DECISIONS_CHART_KEYS.OVERTURNED_GOOD_DECISIONS]: 'overturned good decisions',
    [OVERTURNED_DECISIONS_CHART_KEYS.GOOD_DECISION_OVERTURN_RATE]: 'good decision overturn rate',
    [OVERTURNED_DECISIONS_CHART_KEYS.BAD_DECISIONS]: 'bad decisions',
    [OVERTURNED_DECISIONS_CHART_KEYS.OVERTURNED_BAD_DECISIONS]: 'overturned bad decisions',
    [OVERTURNED_DECISIONS_CHART_KEYS.BAD_DECISION_OVERTURN_RATE]: 'bad decision overturn rate',
    [OVERTURNED_DECISIONS_CHART_KEYS.AVERAGE_OVERTURN_RATE]: 'average overturn rate',
};

export const OVERTURN_CHART_DATUM_LABELS = {
    [OVERTURN_CHART_KEYS.GOOD]: 'good',
    [OVERTURN_CHART_KEYS.OVERTURNED_GOOD]: 'overturnedGood',
    [OVERTURN_CHART_KEYS.BAD]: 'bad',
    [OVERTURN_CHART_KEYS.OVERTURNED_BAD]: 'overturnedBad'
};

export enum OVERTURN_LABELS {
    GOOD = 'GOOD',
    BAD = 'BAD',
    OVERTURNED_GOOD = 'OVERTURNED_GOOD',
    OVERTURNED_BAD = 'OVERTURNED_BAD',
    GOOD_DECISION_OVERTURN_RATE = 'GOOD_DECISION_OVERTURN_RATE',
    BAD_DECISION_OVERTURN_RATE = 'BAD_DECISION_OVERTURN_RATE',
    AVERAGE_OVERTURN_RATE = 'AVERAGE_OVERTURN_RATE'
}
export const OVERTURN_DISPLAY_LABELS = {
    [OVERTURN_LABELS.GOOD]: 'Good decisions applied',
    [OVERTURN_LABELS.BAD]: 'Bad decisions applied',
    [OVERTURN_LABELS.OVERTURNED_GOOD]: 'Overturned good decisions',
    [OVERTURN_LABELS.OVERTURNED_BAD]: 'Overturned bad decisions',
    [OVERTURN_LABELS.GOOD_DECISION_OVERTURN_RATE]: 'Good decision overturn rate',
    [OVERTURN_LABELS.BAD_DECISION_OVERTURN_RATE]: 'Bad decision overturn rate',
    [OVERTURN_LABELS.AVERAGE_OVERTURN_RATE]: 'Average overturn rate'
};

export const OVERTURNED_DECISIONS_DISPLAY_NAMES = {
    [OVERTURN_CHART_KEYS.GOOD]: {
        label: [OVERTURN_DISPLAY_LABELS[OVERTURN_LABELS.GOOD]],
        color: COLORS.barChart.good
    },
    [OVERTURN_CHART_KEYS.OVERTURNED_GOOD]: {
        label: [OVERTURN_DISPLAY_LABELS[OVERTURN_LABELS.OVERTURNED_GOOD]],
        color: COLORS.barChart.overturnedGood
    },
    [OVERTURN_CHART_KEYS.BAD]: {
        label: [OVERTURN_DISPLAY_LABELS[OVERTURN_LABELS.BAD]],
        color: COLORS.barChart.bad
    },
    [OVERTURN_CHART_KEYS.OVERTURNED_BAD]: {
        label: [OVERTURN_DISPLAY_LABELS[OVERTURN_LABELS.OVERTURNED_BAD]],
        color: COLORS.barChart.overturnedBad
    }
};

export const OVERTURN_CHART_DATUM_KEYS = {
    good: OVERTURN_LABELS.GOOD,
    overturnedGood: OVERTURN_LABELS.OVERTURNED_GOOD,
    bad: OVERTURN_LABELS.BAD,
    overturnedBad: OVERTURN_LABELS.OVERTURNED_BAD
};

export const OVERTURN_LABELS_TO_OVERTURN_CHART_KEYS_COLORS = new Map<OVERTURN_LABELS, { color: string, label: string}>([
    [
        OVERTURN_LABELS.GOOD, {
            color: COLORS.barChart.good,
            label: 'good'
        }
    ], [
        OVERTURN_LABELS.OVERTURNED_GOOD, {
            color: COLORS.barChart.overturnedGood,
            label: 'overturnedGood'
        }
    ], [
        OVERTURN_LABELS.BAD, {
            color: COLORS.barChart.bad,
            label: 'bad'
        }
    ], [
        OVERTURN_LABELS.OVERTURNED_BAD, {
            color: COLORS.barChart.overturnedBad,
            label: 'overturnedBad'
        }
    ]
]);
