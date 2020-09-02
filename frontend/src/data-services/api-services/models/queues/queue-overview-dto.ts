export interface QueueOverviewDto {
    /**
     * Queue id
     */
    [key: string] : {
        lockedItemsCount: number,
        nearToSlaCount: number,
        nearToTimeoutCount: number
    }
}
