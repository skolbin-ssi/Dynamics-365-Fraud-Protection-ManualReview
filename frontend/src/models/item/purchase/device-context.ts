import { observable } from 'mobx';
import { DeviceContextDTO } from '../../../data-services/api-services/models/device-context-dto';
import { Address, ADDRESS_TYPE } from './address';
import { GeoAddress } from './geo-address';

export class DeviceContext {
    deviceContextId: string = '';

    provider: string = '';

    deviceContextDC: string = '';

    externalDeviceId: string = '';

    externalDeviceType: string = '';

    userAgent: string = '';

    screenResolution: string = '';

    deviceType: string = '';

    browserLanguage: string = '';

    discoveredIPAddress: string = '';

    routingType: string = '';

    connectionType: string = '';

    purchaseId: string = '';

    merchantLocalDate: string = '';

    os: string = '';

    ipAddress: string = '';

    ipLatitude?: number;

    ipLongitude?: number;

    ipCity: string = '';

    ipCountry: string = '';

    ipState: string = '';

    @observable
    address: GeoAddress = new GeoAddress(new Address());

    fromDTO(deviceContext: DeviceContextDTO) {
        const {
            DeviceContextId,
            Provider,
            DeviceContextDC,
            ExternalDeviceId,
            ExternalDeviceType,
            UserAgent,
            ScreenResolution,
            DeviceType,
            BrowserLanguage,
            DiscoveredIPAddress,
            RoutingType,
            ConnectionType,
            PurchaseId,
            MerchantLocalDate,
            OS,
            IPAddress,
            IPLatitude,
            IPLongitude,
            IPCity,
            IPCountry,
            IPState,
        } = deviceContext;

        this.deviceContextId = DeviceContextId;
        this.provider = Provider;
        this.deviceContextDC = DeviceContextDC;
        this.externalDeviceId = ExternalDeviceId;
        this.externalDeviceType = ExternalDeviceType;
        this.userAgent = UserAgent;
        this.screenResolution = ScreenResolution;
        this.deviceType = DeviceType;
        this.browserLanguage = BrowserLanguage;
        this.discoveredIPAddress = DiscoveredIPAddress;
        this.routingType = RoutingType;
        this.connectionType = ConnectionType;
        this.purchaseId = PurchaseId;
        this.merchantLocalDate = MerchantLocalDate;
        this.os = OS;
        this.ipAddress = IPAddress;
        this.ipLatitude = IPLatitude;
        this.ipLongitude = IPLongitude;
        this.ipCity = IPCity;
        this.ipCountry = IPCountry;
        this.ipState = IPState;
        this.address = this.populateGeoAddress();
    }

    populateGeoAddress(): GeoAddress {
        const address = new Address();

        address.street1 = this.ipAddress;
        address.city = this.ipCity;
        address.state = this.ipState;
        address.country = this.ipCountry;
        address.type = ADDRESS_TYPE.GEO;

        return new GeoAddress(
            address,
            this.ipLatitude,
            this.ipLongitude
        );
    }
}
