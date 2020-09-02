import { PreviousPurchaseDTO } from '../../../data-services/api-services/models/previous-purchase-dto';

export class PreviousPurchase {
    purchaseId: string = '';

    assessmentType: string = '';

    originalOrderId: string = '';

    customerLocalDate: string = '';

    // transaction date
    merchantLocalDate: string = '';

    totalAmount: number = 0;

    totalAmountInUSD: number = 0;

    salesTax: number = 0;

    salesTaxInUSD: number = 0;

    currency: string = '';

    currencyConversionFactor: number = 0;

    shippingMethod: string = '';

    bankName: string = '';

    hashedEvaluationId: string = '';

    riskScore: number = 0;

    reasonCodes: string = '';

    policyApplied: string = '';

    type: string = 'Purchase';

    fromDTO(pp: PreviousPurchaseDTO) {
        const {
            PurchaseId,
            AssessmentType,
            OriginalOrderId,
            CustomerLocalDate,
            MerchantLocalDate,
            TotalAmount,
            TotalAmountInUSD,
            SalesTax,
            SalesTaxInUSD,
            Currency,
            CurrencyConversionFactor,
            ShippingMethod,
            BankName,
            HashedEvaluationId,
            RiskScore,
            ReasonCodes,
            PolicyApplied
        } = pp;

        this.purchaseId = PurchaseId;
        this.assessmentType = AssessmentType;
        this.originalOrderId = OriginalOrderId;
        this.customerLocalDate = CustomerLocalDate;
        this.merchantLocalDate = MerchantLocalDate;
        this.totalAmount = TotalAmount;
        this.totalAmountInUSD = TotalAmountInUSD;
        this.salesTax = SalesTax;
        this.salesTaxInUSD = SalesTaxInUSD;
        this.currency = Currency;
        this.currencyConversionFactor = CurrencyConversionFactor;
        this.shippingMethod = ShippingMethod;
        this.bankName = BankName;
        this.hashedEvaluationId = HashedEvaluationId;
        this.riskScore = RiskScore;
        this.reasonCodes = ReasonCodes;
        this.policyApplied = PolicyApplied;

        return this;
    }
}
