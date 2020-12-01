// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// TODO: Add DIRECT type
export enum QUEUE_VIEW_TYPE {
    REGULAR = 'REGULAR',
    ESCALATION = 'ESCALATION',
    DIRECT = 'DIRECT'
}

export enum QUEUE_ITEMS_FIELD {
    IMPORT_DATE = 'IMPORT_DATE',
    TOTAL_AMOUNT = 'TOTAL_AMOUNT',
    CURRENCY = 'CURRENCY',
    USER_COUNTRY = 'USER_COUNTRY',
    USER_CREATION_DATE = 'USER_CREATION_DATE',
    DEVICE_CONTEXT_IP_ADDRESS = 'DEVICE_CONTEXT_IP_ADDRESS',
    PAYMENT_INSTRUMENT_TYPE = 'PAYMENT_INSTRUMENT_TYPE',
    PRODUCT_ID = 'PRODUCT_ID',
    PRODUCT_NAME = 'PRODUCT_NAME',
    SCORE = 'SCORE',
    PRODUCT_SKU = 'PRODUCT_SKU'
}

export enum FILTER_CONDITION {
    IN = 'IN',
    BETWEEN = 'BETWEEN',
    REGEXP = 'REGEXP'
}

export enum FILTER_VALIDATOR_TYPES {
    MIN_LESS_THAN_MAX,
    MIN_CONSTRAINT,
    MAX_CONSTRAINT,
    MIN_EXISTS,
    MAX_EXISTS,
    AT_LEAST_ONE_VALUE,
    LOWER_BOUND_CONSTRAINT,
    UPPER_BOUND_CONSTRAINT
}

export const FILTER_NAMES = new Map<QUEUE_ITEMS_FIELD, string>([
    [QUEUE_ITEMS_FIELD.SCORE, 'Fraud score'],
    [QUEUE_ITEMS_FIELD.TOTAL_AMOUNT, 'Order amount'],
    [QUEUE_ITEMS_FIELD.PRODUCT_SKU, 'Product SKUs'],
    [QUEUE_ITEMS_FIELD.USER_COUNTRY, 'Country']
]);

export const FILTER_DESCRIPTIONS = new Map<QUEUE_ITEMS_FIELD, string>([
    [QUEUE_ITEMS_FIELD.SCORE, 'Select a score between 0 and 999'],
    [QUEUE_ITEMS_FIELD.TOTAL_AMOUNT, 'Select a range'],
    [QUEUE_ITEMS_FIELD.PRODUCT_SKU, 'Enter a SKU in the field and select one from the dropdown or create a custom one. You can add as many SKUs as you need'],
    [QUEUE_ITEMS_FIELD.USER_COUNTRY, 'Enter a country in the field and select one from the list. You can add as many countries as you need']
]);

export const FILTER_CONDITIONS = new Map<QUEUE_ITEMS_FIELD, FILTER_CONDITION>([
    [QUEUE_ITEMS_FIELD.SCORE, FILTER_CONDITION.BETWEEN],
    [QUEUE_ITEMS_FIELD.TOTAL_AMOUNT, FILTER_CONDITION.BETWEEN],
    [QUEUE_ITEMS_FIELD.PRODUCT_SKU, FILTER_CONDITION.IN],
    [QUEUE_ITEMS_FIELD.USER_COUNTRY, FILTER_CONDITION.IN]
]);

export const FILTER_INITIAL_VALUES = new Map<QUEUE_ITEMS_FIELD, string[]>([
    [QUEUE_ITEMS_FIELD.SCORE, ['0', '999']],
    [QUEUE_ITEMS_FIELD.TOTAL_AMOUNT, ['0', '0']],
    [QUEUE_ITEMS_FIELD.PRODUCT_SKU, []],
    [QUEUE_ITEMS_FIELD.USER_COUNTRY, []]
]);

export const FILTER_VALIDATOR_ERRORS = new Map<FILTER_VALIDATOR_TYPES, string>([
    [FILTER_VALIDATOR_TYPES.MIN_LESS_THAN_MAX, 'Maximal value must be bigger than minimal'],
    [FILTER_VALIDATOR_TYPES.MIN_CONSTRAINT, 'Please keep the minimal value in allowed span'],
    [FILTER_VALIDATOR_TYPES.MAX_CONSTRAINT, 'Please keep the maximal value in allowed span'],
    [FILTER_VALIDATOR_TYPES.MIN_EXISTS, 'Please enter the minimal value'],
    [FILTER_VALIDATOR_TYPES.MAX_EXISTS, 'Please enter the maximal value'],
    [FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE, 'At least one value is required'],
    [FILTER_VALIDATOR_TYPES.LOWER_BOUND_CONSTRAINT, 'This value must be greater then or equal to'],
    [FILTER_VALIDATOR_TYPES.UPPER_BOUND_CONSTRAINT, 'This value must be less then or equal to'],
]);

export const FILTER_VALUE_CONSTRAINTS = new Map<QUEUE_ITEMS_FIELD, any[]>([
    [QUEUE_ITEMS_FIELD.SCORE, [0, 999]]
]);

export const FILTER_VALIDATORS = new Map<QUEUE_ITEMS_FIELD, FILTER_VALIDATOR_TYPES[]>([
    [QUEUE_ITEMS_FIELD.SCORE, [
        FILTER_VALIDATOR_TYPES.MIN_LESS_THAN_MAX,
        FILTER_VALIDATOR_TYPES.MIN_CONSTRAINT,
        FILTER_VALIDATOR_TYPES.MAX_CONSTRAINT,
        FILTER_VALIDATOR_TYPES.MIN_EXISTS,
        FILTER_VALIDATOR_TYPES.MAX_EXISTS
    ]],
    [QUEUE_ITEMS_FIELD.TOTAL_AMOUNT, [
        FILTER_VALIDATOR_TYPES.MIN_LESS_THAN_MAX,
        FILTER_VALIDATOR_TYPES.MIN_EXISTS,
        FILTER_VALIDATOR_TYPES.MAX_EXISTS
    ]],
    [QUEUE_ITEMS_FIELD.PRODUCT_SKU, [
        FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE
    ]],
    [QUEUE_ITEMS_FIELD.USER_COUNTRY, [
        FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE
    ]]
]);

export enum SORTING_ORDER {
    ASC = 'ASC',
    DESC = 'DESC'
}

export enum SORTING_FIELD {
    IMPORT_DATE = 'IMPORT_DATE',
    SCORE = 'SCORE',
}

export const SORTING_FIELD_DISPLAY = {
    [SORTING_FIELD.IMPORT_DATE]: 'Import date',
    [SORTING_FIELD.SCORE]: 'Fraud score'
};

export enum LABEL {
    GOOD = 'GOOD',
    BAD = 'BAD',
    HOLD = 'HOLD',
    ESCALATE = 'ESCALATE',
    WATCH_NA = 'WATCH_NA',
    WATCH_INCONCLUSIVE = 'WATCH_INCONCLUSIVE'
}

export const LABEL_NAMES = {
    [LABEL.GOOD]: 'Good',
    [LABEL.BAD]: 'Bad',
    [LABEL.HOLD]: 'Hold',
    [LABEL.ESCALATE]: 'Escalate',
    [LABEL.WATCH_NA]: 'Watch NA',
    [LABEL.WATCH_INCONCLUSIVE]: 'Watch inconclusive'
};

export const QUEUE_CONFIGURATION_LABEL = [
    {
        name: LABEL_NAMES[LABEL.GOOD],
        labels: [LABEL.GOOD]
    },
    {
        name: LABEL_NAMES[LABEL.BAD],
        labels: [LABEL.BAD]
    },
    {
        name: LABEL_NAMES[LABEL.HOLD],
        labels: [LABEL.HOLD]
    },
    {
        name: LABEL_NAMES[LABEL.ESCALATE],
        labels: [LABEL.ESCALATE]
    },
    {
        name: 'Watch',
        labels: [LABEL.WATCH_NA, LABEL.WATCH_INCONCLUSIVE]
    }
];

export enum QUEUE_MUTATION_TYPES {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete'
}

export enum QUEUE_LIST_TYPE {
    REGULAR = 'queues',
    ESCALATED = 'escalated',
    ALL = 'all',
    SUPERVISED = 'supervised',
    ASSIGNED = 'assigned'
}

export type CreateQueueModalTabs = 'general' | 'assign' | 'filter' | 'delete';
