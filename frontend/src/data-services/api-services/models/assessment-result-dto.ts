import { PurchaseStatusDTO } from './purchase-status-dto';

export interface AssessmentResultDTO {
    MerchantRuleDecision: string;
    MIDFlag: string;
    PolicyApplied: string;
    PurchaseStatusList: PurchaseStatusDTO[];
    ReasonCodes: string;
    RiskScore: number;
}
