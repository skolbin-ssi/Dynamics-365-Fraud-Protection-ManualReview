// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export enum ROLE {
    ANALYST = 'ANALYST',
    SENIOR_ANALYST = 'SENIOR_ANALYST',
    ADMIN_MANAGER = 'ADMIN_MANAGER',
    GUEST = 'GUEST'
}

export enum MANUAL_REVIEW {
    ACCESS = 'mr:access'
}

export enum USER_INFO_MANAGEMENT {
    ACCESS = 'personal:access',

    VIEW_PERSONAL_PERFORMANCE = 'personal:view:personal-report'
}

export enum QUEUE_MANAGEMENT {
    /* Access to queue page */
    ACCESS = 'queue:access',

    /* Create a queue */
    CREATE = 'queue:create',

    /* Change QueueSettings.Sorting */
    UPDATE_SORTING = 'queue:update:sorting',

    /* Change QueueSettings.Assignees */
    UPDATE_ASSIGNEES = 'queue:update:assignees',

    /* Change QueueSettings.Timeout */
    UPDATE_TIMEOUT = 'queue:update:timeout',

    /* Change QueueSettings.ProcessingDeadline */
    UPDATE_PROCESSING_DEADLINE = 'queue:update:processing-deadline',

    /* Change QueueSettings.Name */
    UPDATE_NAME = 'queue:update:name',

    /* Change QueueSettings.ProcessingDeadline */
    UPDATE_DEADLINE = 'queue:update:deadline',

    /* Change QueueSettings.AllowedLabels */
    UPDATE_ALLOWED_LABELS = 'queue:update:allowed-labels',

    /* Change QueueSettings.AllowedLabels */
    UPDATE_FILTERS = 'queue:update:filters',

    /* Fill a queue */
    UPDATE_FILL_QUEUE = 'queue:update:fill-queue',

    /* Delete queue */
    DELETE_QUEUE = 'queue:delete',

    /* User can view escalation queues */
    VIEW_ESCALATION_QUEUE = 'queue:view:escalation_queue'
}

export enum ORDER_MANAGEMENT {
    /* Add Item Manual Review Decision (Label) */
    ADD_LABEL = 'order:add:label',

    /* Add Item Note */
    ADD_NOTE = 'order:add:note',

    /* Add Item Tags */
    ADD_TAG = 'order:add:tag',

    /* Order.Purchase.User form DFP */
    VIEW_PURCHASE_USER = 'order:view:purchase:user',

    /* Order.Purchase.Summary form DFP */
    VIEW_PURCHASE_SUMMARY = 'order:view:purchase:summary',

    /* Order.Purchase.PaymentInstrument form DFP */
    VIEW_PURCHASE_PAYMENT_INSTRUMENT = 'order:view:purchase:payment-summary',

    /* Order.Purchase.Products form DFP */
    VIEW_PURCHASE_PRODUCTS = 'order:view:purchase:products',

    /* Order.Purchase.DeviceContext form DFP */
    VIEW_PURCHASE_DEVICE_CONTEXT = 'order:view:purchase:device-context',

    /* Order.ManualReviewDecision (Label) */
    VIEW_MANUAL_REVIEW_DECISION = 'order:view:manual-review.decision',
}

export enum DASHBOARD_MANAGEMENT {
    /* Access to dashboard page */
    ACCESS = 'dashboard:access',

    /* Share dashboard */
    SHARE_DASHBOARD = 'dashboard:share',

    /* Generate report */
    GENERATE_REPORT = 'dashboard:generate-report',

    /* Order.DFPDecision */
    VIEW_ORDER_DFP_DECISION = 'dashboard:view:order:dfp-decision',

    /* Demand/supply report */
    VIEW_DEMAND_SUPPLY_REPORT = 'dashboard:view:demand-supply-report',

    /* Performance dashboard by all analysts and a specific analyst */
    VIEW_ANALYSTS_REPORT = 'dashboard:view:analyst-report',

    /* Performance dashboard by all queues and a specific queue */
    VIEW_QUEUES_REPORT = 'dashboard:view:queues-report',

    /* Approval rate report */
    VIEW_APPROVAL_RATE_REPORT = 'dashboard:view:approval-rate-report'
}

export enum ALERTS_MANAGEMENT {
    /* Access to alerts page */
    ACCESS = 'alerts:access'
}

export enum SEARCH_MANAGEMENT {
    /* Access to the search page */
    ACCESS = 'search:access'
}

export type PERMISSION = MANUAL_REVIEW | QUEUE_MANAGEMENT | ORDER_MANAGEMENT | DASHBOARD_MANAGEMENT | ALERTS_MANAGEMENT | USER_INFO_MANAGEMENT | SEARCH_MANAGEMENT;

export const ROLES_ACCESS_MAPPING = {
    [ROLE.GUEST]: {
        permissions: [],
        inherits: []
    },
    [ROLE.ANALYST]: {
        permissions: [
            MANUAL_REVIEW.ACCESS,
            QUEUE_MANAGEMENT.ACCESS,
            ORDER_MANAGEMENT.ADD_LABEL,
            ORDER_MANAGEMENT.ADD_NOTE,
            ORDER_MANAGEMENT.ADD_TAG,
            ORDER_MANAGEMENT.VIEW_PURCHASE_USER,
            ORDER_MANAGEMENT.VIEW_PURCHASE_SUMMARY,
            ORDER_MANAGEMENT.VIEW_PURCHASE_PAYMENT_INSTRUMENT,
            ORDER_MANAGEMENT.VIEW_PURCHASE_PRODUCTS,
            ORDER_MANAGEMENT.VIEW_PURCHASE_DEVICE_CONTEXT,
            ALERTS_MANAGEMENT.ACCESS,
            USER_INFO_MANAGEMENT.ACCESS,
            USER_INFO_MANAGEMENT.VIEW_PERSONAL_PERFORMANCE
        ],
        inherits: [ROLE.GUEST]
    },
    [ROLE.SENIOR_ANALYST]: {
        permissions: [
            QUEUE_MANAGEMENT.CREATE,
            QUEUE_MANAGEMENT.UPDATE_SORTING,
            QUEUE_MANAGEMENT.UPDATE_ASSIGNEES,
            QUEUE_MANAGEMENT.UPDATE_TIMEOUT,
            QUEUE_MANAGEMENT.UPDATE_PROCESSING_DEADLINE,
            QUEUE_MANAGEMENT.UPDATE_FILL_QUEUE,
            QUEUE_MANAGEMENT.VIEW_ESCALATION_QUEUE,
            DASHBOARD_MANAGEMENT.ACCESS,
            DASHBOARD_MANAGEMENT.SHARE_DASHBOARD,
            DASHBOARD_MANAGEMENT.VIEW_DEMAND_SUPPLY_REPORT
        ],
        inherits: [ROLE.ANALYST]
    },
    [ROLE.ADMIN_MANAGER]: {
        permissions: [
            QUEUE_MANAGEMENT.DELETE_QUEUE,
            ORDER_MANAGEMENT.VIEW_MANUAL_REVIEW_DECISION,
            QUEUE_MANAGEMENT.UPDATE_NAME,
            QUEUE_MANAGEMENT.UPDATE_DEADLINE,
            DASHBOARD_MANAGEMENT.GENERATE_REPORT,
            DASHBOARD_MANAGEMENT.VIEW_ORDER_DFP_DECISION,
            DASHBOARD_MANAGEMENT.VIEW_APPROVAL_RATE_REPORT,
            DASHBOARD_MANAGEMENT.VIEW_ANALYSTS_REPORT,
            DASHBOARD_MANAGEMENT.VIEW_QUEUES_REPORT,
            SEARCH_MANAGEMENT.ACCESS,
        ],
        inherits: [ROLE.SENIOR_ANALYST]
    }
};
