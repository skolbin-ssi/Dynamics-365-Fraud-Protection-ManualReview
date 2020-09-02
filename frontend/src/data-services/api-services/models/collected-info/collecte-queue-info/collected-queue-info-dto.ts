export interface CollectedQueueInfoDto {
    id:string;
    name: string;
    active: boolean;
    updated: string;
    reviewers: string[];
    supervisors: string[];
    residual: boolean;
    /**
     * string($PnDTnHnMn.nS)
     * example: PT15M30S
     */
    processingDeadline: string;
}
