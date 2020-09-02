import { PaymentInstrumentDTO } from '../../../data-services/api-services/models';
import { Address } from './address';

export class PaymentInstrument {
    type: string = '';

    email: string = '';

    purchaseAmount: number = 0;

    billingAddress: Address;

    merchantPaymentInstrumentId: string = '';

    creationDate: string = '';

    updateDate: string = '';

    state: string = '';

    cardType: string = '';

    holderName: string = '';

    BIN: string = '';

    expirationDate: string = '';

    lastFourDigits: string = '';

    billingAgreementId: string = '';

    payerId: string = '';

    payerStatus: string = '';

    addressStatus: string = '';

    IMEI: string = '';

    merchantLocalDate: string = '';

    paymentInstrumentId: string = '';

    purchaseAmountInUSD: number = 0;

    constructor() {
        this.billingAddress = new Address();
    }

    fromDTO(paymentInstrument: PaymentInstrumentDTO) {
        const {
            Type,
            Email,
            PurchaseAmount,
            BillingAddress: billingAddress,
            MerchantPaymentInstrumentId,
            CreationDate,
            UpdateDate,
            State,
            CardType,
            HolderName,
            BIN,
            ExpirationDate,
            LastFourDigits,
            BillingAgreementId,
            PayerId,
            PayerStatus,
            AddressStatus,
            IMEI,
            MerchantLocalDate,
            PaymentInstrumentId,
            PurchaseAmountInUSD,
        } = paymentInstrument;

        this.type = Type;
        this.email = Email;
        this.purchaseAmount = PurchaseAmount;
        if (billingAddress) {
            this.billingAddress.fromDTO(billingAddress);
        }
        this.merchantPaymentInstrumentId = MerchantPaymentInstrumentId;
        this.creationDate = CreationDate;
        this.updateDate = UpdateDate;
        this.state = State;
        this.cardType = CardType;
        this.holderName = HolderName;
        this.BIN = BIN;
        this.expirationDate = ExpirationDate;
        this.lastFourDigits = LastFourDigits;
        this.billingAgreementId = BillingAgreementId;
        this.payerId = PayerId;
        this.payerStatus = PayerStatus;
        this.addressStatus = AddressStatus;
        this.IMEI = IMEI;
        this.merchantLocalDate = MerchantLocalDate;
        this.paymentInstrumentId = PaymentInstrumentId;
        this.purchaseAmountInUSD = PurchaseAmountInUSD;

        return this;
    }
}
