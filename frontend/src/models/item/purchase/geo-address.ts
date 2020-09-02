import { observable } from 'mobx';
import { getMiles } from '../../../utils/math';
import { Address } from './address';

export class GeoAddress {
    latitude?: number;

    longitude?: number;

    address: Address;

    @observable
    distances: Map<string, number | null> = new Map();

    constructor(address: Address, latitude?: number, longitude?: number) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
    }

    get isPointable() {
        return !!this.latitude && !!this.longitude;
    }

    get position() {
        return [this.longitude || 0, this.latitude || 0];
    }

    setDistanceToAddress(address: GeoAddress, distance: number | null) {
        this.distances.set(address?.address?.displayLineAddress, distance);
    }

    getDistanceToAddress(address: GeoAddress) {
        const distanceInMeters = this.distances.get(address.address.displayLineAddress);
        return {
            distanceInMeters,
            distanceInMiles: getMiles(distanceInMeters)
        };
    }
}
