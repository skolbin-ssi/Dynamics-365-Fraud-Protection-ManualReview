export interface ItemLockDTO {
    /* string($date-time) */
    locked: string;
    ownerId: string;
    queueId: string;
    queueViewId: string;
}
