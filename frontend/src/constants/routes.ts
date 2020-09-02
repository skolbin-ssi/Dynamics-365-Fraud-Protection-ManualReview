import { ERROR_SCREEN_STATES } from './error-screen-states';

export const ROUTES = {
    LOGIN: '/login',

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

    ERROR: '/error/:type',

    build: {
        error: (type: ERROR_SCREEN_STATES) => `/error/${type}`,
        itemDetails: (queueId: string, itemId: string) => `/queues/${queueId}/item/${itemId}`,
        reviewConsole: (queueId: string) => `/queues/${queueId}/console`,
        itemDetailsReviewConsole: (queueId: string, itemId: string) => `/queues/${queueId}/item/${itemId}/console`,
        queues: (queueId: string = '') => `/queues/${queueId}`,
        dashboard: {
            queues: (queueId: string) => `${ROUTES.DASHBOARD_QUEUES_PERFORMANCE}/${queueId}`,
            queue: (queueId: string) => `${ROUTES.DASHBOARD_QUEUES_PERFORMANCE}/${queueId}`,
            analyst: (analystId: string) => `${ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE}/${analystId}`,
            demandByQueue: (queueId: string) => `${ROUTES.DASHBOARD_DEMAND}/${queueId}`,
        },
        editAlert: (alertId: string) => `/alerts/edit/${alertId}`
    }
};
