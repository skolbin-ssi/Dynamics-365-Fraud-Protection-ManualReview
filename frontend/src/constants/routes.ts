// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ERROR_SCREEN_STATES } from './error-screen-states';

export const ROUTES = {
    LOGIN: '/login',

    PERSONAL_PERFORMANCE: '/my/performance',

    DASHBOARD: '/dashboard',
    DASHBOARD_QUEUES_PERFORMANCE: '/dashboard/queues',
    DASHBOARD_QUEUE_PERFORMANCE: '/dashboard/queues/:queueId',
    DASHBOARD_ANALYSTS_PERFORMANCE: '/dashboard/analysts',
    DASHBOARD_ANALYST_PERFORMANCE: '/dashboard/analysts/:analystId',
    DASHBOARD_DEMAND: '/dashboard/demand',
    DASHBOARD_DEMAND_BY_QUEUE: '/dashboard/demand/:queueId',

    ALERT_SETTINGS: '/alerts',
    ALERT_CREATE: '/alerts/new',
    ALERT_EDIT: '/alerts/edit/:itemId',

    QUEUES: '/queues',
    QUEUES_BY_ID: '/queues/:queueId',

    REVIEW_CONSOLE: '/queues/:queueId/console',
    ITEM_DETAILS: '/queues/:queueId/item/:itemId',
    ITEM_DETAILS_REVIEW_CONSOLE: '/queues/:queueId/item/:itemId/console',

    SEARCH_NEW: '/search/new',
    SEARCH_BY_ID: '/search/:searchId',
    SEARCH_INACTIVE_ITEM_DETAILS: '/search/:searchId/item/:itemId',
    SEARCH_ITEM_DETAILS: '/search/:searchId/queues/:queueId/item/:itemId',
    SEARCH_ITEM_DETAILS_REVIEW_CONSOLE: '/search/:searchId/queues/:queueId/item/:itemId/console',

    ERROR: '/error/:type',

    build: {
        error: (type: ERROR_SCREEN_STATES) => `/error/${type}`,
        itemDetails: (queueId: string, itemId: string) => `/queues/${queueId}/item/${itemId}`,
        reviewConsole: (queueId: string) => `/queues/${queueId}/console`,
        itemDetailsReviewConsole: (queueId: string, itemId: string) => `/queues/${queueId}/item/${itemId}/console`,
        queues: (queueId: string = '') => `/queues/${queueId}`,
        search: (searchId: string) => `/search/${searchId}`,
        searchInactiveItemDetails: (searchId: string, itemId: string) => `/search/${searchId}/item/${itemId}`,
        searchItemDetails:
            (searchId: string, queueId: string, itemId: string) => `/search/${searchId}/queues/${queueId}/item/${itemId}`,
        searchItemDetailsReviewConsole:
            (searchId: string, queueId: string, itemId: string) => `/search/${searchId}/queues/${queueId}/item/${itemId}/console`,
        dashboard: {
            queues: (queueId: string) => `${ROUTES.DASHBOARD_QUEUES_PERFORMANCE}/${queueId}`,
            queue: (queueId: string) => `${ROUTES.DASHBOARD_QUEUES_PERFORMANCE}/${queueId}`,
            analyst: (analystId: string) => `${ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE}/${analystId}`,
            demandByQueue: (queueId: string) => `${ROUTES.DASHBOARD_DEMAND}/${queueId}`,
        },
        editAlert: (alertId: string) => `/alerts/edit/${alertId}`,
        // linkAnalysis: (queueId: string, itemId:string, linkSearchId: string) => `${ROUTES.build.itemDetails(queueId, itemId)}/linkId${linkSearchId}`
    }
};
