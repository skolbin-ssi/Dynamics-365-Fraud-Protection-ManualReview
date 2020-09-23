// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { computed, observable } from 'mobx';
import { PurchaseUserDTO } from '../../../data-services/api-services/models/user-dto';
import { BaseModel } from '../../misc';

export class PurchaseUser extends BaseModel {
    userId: string = '';

    creationDate: string = '';

    updateDate: string = '';

    @observable
    firstName: string = '';

    @observable
    lastName: string = '';

    country: string = '';

    zipCode: string = '';

    timeZone: string = '';

    language: string = '';

    phoneNumber: string = '';

    email: string = '';

    membershipId: string = '';

    profileType: string = '';

    profileName: string = '';

    authenticationProvider: string = '';

    displayName: string = '';

    isEmailValidated: boolean = false;

    isPhoneNumberValidated: boolean = false;

    emailValidationDate: string = '';

    phoneNumberValidatedDate: string = '';

    last30DaysChargebackAmount?: number;

    last30DaysOfUse?: number;

    last30DaysRefundAmount?: number;

    last30DaysSpend?: number;

    last30DaysTransactions?: number;

    measuresIngestionDateTimeUTC: string = '';

    merchantLocalDate: string = '';

    monthlyAverageChargebackAmount?: number;

    monthlyAverageRefundAmount?: number;

    monthlyAverageSpend?: number;

    monthlyAverageTransactions?: number;

    totalChargebackAmount?: number;

    totalDaysOfUse?: number;

    totalRefundAmount?: number;

    totalSpend?: number;

    totalTransactions?: number;

    fromDTO(purchaseUser: PurchaseUserDTO) {
        const {
            UserId,
            CreationDate,
            UpdateDate,
            FirstName,
            LastName,
            Country,
            ZipCode,
            TimeZone,
            Language,
            PhoneNumber,
            Email,
            MembershipId,
            ProfileType,
            ProfileName,
            AuthenticationProvider,
            DisplayName,
            IsEmailValidated,
            /* string($date-time)  */
            EmailValidatedDate,
            IsPhoneNumberValidated,
            /* string($date-time)  */
            PhoneNumberValidatedDate,
            Last30DaysChargebackAmount,
            Last30DaysOfUse,
            Last30DaysRefundAmount,
            Last30DaysSpend,
            Last30DaysTransactions,
            /* string($date-time)  */
            MeasuresIngestionDateTimeUTC,
            /* string($date-time)  */
            MerchantLocalDate,
            MonthlyAverageChargebackAmount,
            MonthlyAverageRefundAmount,
            MonthlyAverageSpend,
            MonthlyAverageTransactions,
            TotalChargebackAmount,
            TotalDaysOfUse,
            TotalRefundAmount,
            TotalSpend,
            TotalTransactions,
        } = purchaseUser;

        this.userId = UserId;
        this.creationDate = CreationDate;
        this.updateDate = UpdateDate;
        this.firstName = FirstName;
        this.lastName = LastName;
        this.country = Country;
        this.zipCode = ZipCode;
        this.timeZone = TimeZone;
        this.language = Language;
        this.phoneNumber = PhoneNumber;
        this.email = Email;
        this.membershipId = MembershipId;
        this.profileType = ProfileType;
        this.profileName = ProfileName;
        this.authenticationProvider = AuthenticationProvider;
        this.displayName = DisplayName;
        this.isEmailValidated = IsEmailValidated;
        this.emailValidationDate = EmailValidatedDate;
        this.isPhoneNumberValidated = IsPhoneNumberValidated;
        this.phoneNumberValidatedDate = PhoneNumberValidatedDate;
        this.last30DaysChargebackAmount = Last30DaysChargebackAmount;
        this.last30DaysOfUse = Last30DaysOfUse;
        this.last30DaysRefundAmount = Last30DaysRefundAmount;
        this.last30DaysSpend = Last30DaysSpend;
        this.last30DaysTransactions = Last30DaysTransactions;
        this.measuresIngestionDateTimeUTC = MeasuresIngestionDateTimeUTC;
        this.merchantLocalDate = MerchantLocalDate;
        this.monthlyAverageChargebackAmount = MonthlyAverageChargebackAmount;
        this.monthlyAverageRefundAmount = MonthlyAverageRefundAmount;
        this.monthlyAverageSpend = MonthlyAverageSpend;
        this.monthlyAverageTransactions = MonthlyAverageTransactions;
        this.totalChargebackAmount = TotalChargebackAmount;
        this.totalDaysOfUse = TotalDaysOfUse;
        this.totalRefundAmount = TotalRefundAmount;
        this.totalSpend = TotalSpend;
        this.totalTransactions = TotalTransactions;

        return this;
    }

    @computed
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
