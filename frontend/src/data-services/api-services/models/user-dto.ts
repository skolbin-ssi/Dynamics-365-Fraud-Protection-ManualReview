// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ROLE } from '../../../constants';

export interface UserDTO {
    id: string;
    displayName: string;
    roles: ROLE[];
    mail: string;
    userPrincipalName: string;
}

export interface PurchaseUserDTO {
    UserId: string;
    CreationDate: string;
    UpdateDate: string;
    FirstName: string;
    LastName: string;
    Country: string;
    ZipCode: string;
    TimeZone: string;
    Language: string;
    PhoneNumber: string;
    Email: string;
    MembershipId: string;
    ProfileType: string;
    ProfileName: string;
    AuthenticationProvider: string;
    DisplayName: string;
    IsEmailValidated: boolean;
    /* string($date-time)  */
    EmailValidatedDate: string;
    IsPhoneNumberValidated: boolean;
    /* string($date-time)  */
    PhoneNumberValidatedDate: string;
    Last30DaysChargebackAmount: number;
    Last30DaysOfUse: number;
    Last30DaysRefundAmount: number;
    Last30DaysSpend: number;
    Last30DaysTransactions: number;
    /* string($date-time)  */
    MeasuresIngestionDateTimeUTC: string;
    /* string($date-time)  */
    MerchantLocalDate: string;
    MonthlyAverageChargebackAmount: number;
    MonthlyAverageRefundAmount: number;
    MonthlyAverageSpend: number;
    MonthlyAverageTransactions: number;
    TotalChargebackAmount: number;
    TotalDaysOfUse: number;
    TotalRefundAmount: number;
    TotalSpend: number;
    TotalTransactions: number;
}
