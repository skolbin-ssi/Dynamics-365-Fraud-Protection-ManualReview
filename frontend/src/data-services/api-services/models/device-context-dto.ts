export interface DeviceContextDTO {
    DeviceContextId: string;
    IPAddress: string;
    Provider: string;
    DeviceContextDC: string;
    ExternalDeviceId: string;
    ExternalDeviceType: string;
    BrowserLanguage: string;
    ConnectionType: string;
    DeviceType: string;
    DiscoveredIPAddress: string;
    IPCity: string;
    IPCountry: string;
    IPLatitude: number;
    IPLongitude: number;
    IPState: string;
    /* string($date-time) */
    MerchantLocalDate: string;
    OS: string;
    PurchaseId: string;
    RoutingType: string;
    ScreenResolution: string;
    UserAgent: string;
}
