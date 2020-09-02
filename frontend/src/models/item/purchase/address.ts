import { AddressDTO } from '../../../data-services/api-services/models';

export enum ADDRESS_TYPE {
    SHIPPING = 'SHIPPING',
    BILLING = 'BILLING',
    GEO = 'GEO'
}

export class Address {
    firstName: string = '';

    lastName: string = '';

    phoneNumber: string = '';

    street1: string = '';

    street2: string = '';

    street3: string = '';

    city: string = '';

    state: string = '';

    countryRegion: string = '';

    district: string = '';

    zipCode: string = '';

    country: string = '';

    type: ADDRESS_TYPE | string = '';

    fromDTO(address: AddressDTO) {
        const {
            FirstName,
            LastName,
            PhoneNumber,
            Street1,
            Street2,
            Street3,
            City,
            State,
            District,
            ZipCode,
            Country,
            Type,
            CountryRegion
        } = address;

        this.firstName = FirstName;
        this.lastName = LastName;
        this.phoneNumber = PhoneNumber;
        this.street1 = Street1;
        this.street2 = Street2;
        this.street3 = Street3;
        this.city = City;
        this.state = State;
        this.countryRegion = CountryRegion;
        this.district = District;
        this.zipCode = ZipCode;
        this.country = Country;
        this.type = Type;

        return this;
    }

    get lineAddress() {
        return this.filterEmpty([
            this.street1,
            this.street2,
            this.street3,
            this.city,
            this.state,
            this.district,
            this.zipCode,
            this.country,
        ]).join(',');
    }

    get displayLineAddress() {
        const part1 = this.filterEmpty([this.street1, this.street2, this.street3]).join(' ');
        const part2 = this.filterEmpty([this.city, this.state]).join(' ');
        const part3 = this.filterEmpty([this.zipCode, this.country]).join(' ');

        return `${part1}\n${[part2, part3].join(', ')}`;
    }

    private filterEmpty(arr: string[]) {
        return arr.filter(a => !!a);
    }
}
