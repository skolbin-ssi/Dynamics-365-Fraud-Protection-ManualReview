import { DEFAULT_QUEUES_PER_PAGE } from './default';
import { COLORS } from '../styles/variables';

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
 * Overturned chart keys for the UI
 */
export enum OVERTURNED_CHART_KEYS {
    APPROVED_MATCHED = 'APPROVED_MATCHED',
    APPROVED_UNMATCHED = 'APPROVED_UNMATCHED',
    REJECTED_UNMATCHED = 'REJECTED_UNMATCHED',
    REJECTED_MATCHED = 'REJECTED_MATCHED'
}

/**
 * Overturned keys for generating CSV file
 */
export const OVERTURNED_CHART_REPORT_KEYS = {
    [OVERTURNED_CHART_KEYS.APPROVED_MATCHED]: 'approved',
    [OVERTURNED_CHART_KEYS.APPROVED_UNMATCHED]: 'approved overturned',
    [OVERTURNED_CHART_KEYS.REJECTED_MATCHED]: 'rejected',
    [OVERTURNED_CHART_KEYS.REJECTED_UNMATCHED]: 'rejected overturned'
};

/**
 * Overturned actions chart keys for the UI
 */
export enum OVERTURNED_ACTIONS_CHART_KEYS {
    APPROVED_APPLIED = 'APPROVED_APPLIED',
    APPROVED_OVERTURNED = 'APPROVED_OVERTURNED',
    APPROVED_ACCURACY = 'APPROVED_ACCURACY',
    REJECTED_APPLIED = 'REJECTED_APPLIED',
    REJECTED_OVERTURNED = 'REJECTED_OVERTURNED',
    REJECTED_ACCURACY = 'REJECTED_ACCURACY',
    ACCURACY_AVERAGE = 'ACCURACY_AVERAGE'
}

/**
 * Overturned actions keys for generating CSV file
 */
export const OVERTURNED_ACTIONS_REPORT_KEYS = {
    [OVERTURNED_ACTIONS_CHART_KEYS.APPROVED_APPLIED]: 'approved applied',
    [OVERTURNED_ACTIONS_CHART_KEYS.APPROVED_OVERTURNED]: 'approved overturned',
    [OVERTURNED_ACTIONS_CHART_KEYS.APPROVED_ACCURACY]: 'approved accuracy',
    [OVERTURNED_ACTIONS_CHART_KEYS.REJECTED_APPLIED]: 'rejected applied',
    [OVERTURNED_ACTIONS_CHART_KEYS.REJECTED_OVERTURNED]: 'rejected overturned',
    [OVERTURNED_ACTIONS_CHART_KEYS.REJECTED_ACCURACY]: 'rejected accuracy',
    [OVERTURNED_ACTIONS_CHART_KEYS.ACCURACY_AVERAGE]: 'accuracy average rate',
};

export const OVERTURNED_CHART_DATUM_LABELS = {
    [OVERTURNED_CHART_KEYS.APPROVED_MATCHED]: 'approveMatched',
    [OVERTURNED_CHART_KEYS.APPROVED_UNMATCHED]: 'approveUnmatched',
    [OVERTURNED_CHART_KEYS.REJECTED_MATCHED]: 'rejectMatched',
    [OVERTURNED_CHART_KEYS.REJECTED_UNMATCHED]: 'rejectUnmatched'
};

export enum OVERTURNED_LABELS {
    GOOD = 'GOOD',
    BAD = 'BAD',
    OVERTURNED_GOOD = 'OVERTURNED_GOOD',
    OVERTURNED_BAD = 'OVERTURNED_BAD',
    RATE_OVERTURNED_GOOD = 'RATE_OVERTURNED_GOOD',
    RATE_OVERTURNED_BAD = 'RATE_OVERTURNED_BAD',
    RATE_AVERAGE_OVERTURNED = 'RATE_AVERAGE_OVERTURNED'
}
export const OVERTURNED_DISPLAY_LABELS = {
    [OVERTURNED_LABELS.GOOD]: 'Good actions applied',
    [OVERTURNED_LABELS.BAD]: 'Bad actions applied',
    [OVERTURNED_LABELS.OVERTURNED_GOOD]: 'Overturned good actions',
    [OVERTURNED_LABELS.OVERTURNED_BAD]: 'Overturned bad actions',
    [OVERTURNED_LABELS.RATE_OVERTURNED_GOOD]: 'Good actions overturned rate',
    [OVERTURNED_LABELS.RATE_OVERTURNED_BAD]: 'Bad actions overturned rate',
    [OVERTURNED_LABELS.RATE_AVERAGE_OVERTURNED]: 'Average overturned rate'
};

export const OVERTURNED_ACTIONS_DISPLAY_NAMES = {
    [OVERTURNED_CHART_KEYS.APPROVED_MATCHED]: {
        label: [OVERTURNED_DISPLAY_LABELS[OVERTURNED_LABELS.GOOD]],
        color: COLORS.barChart.approveMatched
    },
    [OVERTURNED_CHART_KEYS.APPROVED_UNMATCHED]: {
        label: [OVERTURNED_DISPLAY_LABELS[OVERTURNED_LABELS.OVERTURNED_GOOD]],
        color: COLORS.barChart.approvedUnmatched
    },
    [OVERTURNED_CHART_KEYS.REJECTED_MATCHED]: {
        label: [OVERTURNED_DISPLAY_LABELS[OVERTURNED_LABELS.BAD]],
        color: COLORS.barChart.rejectMatched
    },
    [OVERTURNED_CHART_KEYS.REJECTED_UNMATCHED]: {
        label: [OVERTURNED_DISPLAY_LABELS[OVERTURNED_LABELS.OVERTURNED_BAD]],
        color: COLORS.barChart.rejectUnmatched
    }
};

export const OVERTURNED_CHART_DATUM_KEYS = {
    approveUnmatched: OVERTURNED_LABELS.OVERTURNED_GOOD,
    approveMatched: OVERTURNED_LABELS.GOOD,
    rejectMatched: OVERTURNED_LABELS.BAD,
    rejectUnmatched: OVERTURNED_LABELS.OVERTURNED_BAD
};

export const OVERTURNED_LABELS_TO_OVERTURNED_CHART_KEYS_COLORS = new Map<OVERTURNED_LABELS, { color: string, label: string}>([
    [
        OVERTURNED_LABELS.GOOD, {
            color: COLORS.barChart.approveMatched,
            label: 'approveMatched'
        }
    ], [
        OVERTURNED_LABELS.OVERTURNED_GOOD, {
            color: COLORS.barChart.approvedUnmatched,
            label: 'approveUnmatched'
        }
    ], [
        OVERTURNED_LABELS.BAD, {
            color: COLORS.barChart.rejectMatched,
            label: 'rejectMatched'
        }
    ], [
        OVERTURNED_LABELS.OVERTURNED_BAD, {
            color: COLORS.barChart.rejectUnmatched,
            label: 'rejectUnmatched'
        }
    ]
]);
