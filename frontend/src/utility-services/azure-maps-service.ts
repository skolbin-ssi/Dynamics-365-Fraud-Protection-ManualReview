// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import {
    Aborter,
    MapsURL,
    TokenCredential,
    SearchURL,
    SpatialURL
} from 'azure-maps-rest';
import { Address, GeoAddress } from '../models/item/purchase';
import { TYPES } from '../types';
import { Configuration } from './configuration';
import { MapsTokenApiService } from '../data-services/interfaces';

export type LocationAsArray = [number | undefined, number | undefined];

@injectable()
export class AzureMapsService {
    private searchURL?: SearchURL;

    private spatialURL?: SpatialURL;

    private token?: string;

    private tokenCredential?: TokenCredential;

    private tokenRenewingPromise: Promise<void> | null = null;

    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.MAPS_TOKEN_API_SERVICE) private readonly mapsTokenAPIService: MapsTokenApiService
    ) {}

    public async getMapsToken(): Promise<string> {
        if (this.token) return this.token;

        if (!this.tokenRenewingPromise) {
            this.tokenRenewingPromise = this.renewToken();
        }
        await this.tokenRenewingPromise;
        this.tokenRenewingPromise = null;

        return this.token!;
    }

    public async getLocationByAddress(address: Address): Promise<LocationAsArray> {
        if (!this.searchURL || !this.spatialURL) {
            const { searchURL, spatialURL } = await this.initApi();

            this.searchURL = searchURL;
            this.spatialURL = spatialURL;
        }

        const response = await this.searchURL
            .searchAddress(
                Aborter.timeout(10000),
                address.lineAddress
            );

        try {
            const { results } = response;

            if (Array.isArray(results)) {
                const p = results[0].position;
                return [p?.lat, p?.lon];
            }

            return [undefined, undefined];
        } catch (e) {
            return [undefined, undefined];
        }
    }

    public async getDistance(address1: GeoAddress, address2: GeoAddress) {
        if (!this.searchURL || !this.spatialURL) {
            const { searchURL, spatialURL } = await this.initApi();

            this.searchURL = searchURL;
            this.spatialURL = spatialURL;
        }

        let distance = null;

        try {
            const response = await this.spatialURL
                .getGreatCircleDistance(
                    Aborter.timeout(10000),
                    [
                        address1.position,
                        address2.position
                    ]
                );
            if (response.result) {
                distance = response.result.distanceInMeters || null;
            }
        } catch (e) {
            distance = null;
        }

        return {
            address1,
            address2,
            distance
        };
    }

    private async initApi() {
        const aadToken = await this.getMapsToken();
        this.tokenCredential = new TokenCredential(this.config.maps.clientId, aadToken);

        // Use tokenCredential to create a pipeline.
        const pipeline = MapsURL
            .newPipeline(this.tokenCredential, {
                retryOptions: { maxTries: 4 }
            });

        // Create an instance of the SearchURL and SpatialURL client.
        return {
            searchURL: new SearchURL(pipeline),
            spatialURL: new SpatialURL(pipeline)
        };
    }

    private async renewToken() {
        let tokenRenewalTimer: number;
        try {
            const response = await this.mapsTokenAPIService.getMapsToken();

            const token = response?.data?.token;
            const expiresAt = new Date(response?.data?.expiresAt);

            if (!token || !expiresAt || !expiresAt.valueOf()) {
                throw new Error('Failed to parse response from API while retrieving the token for Azure Maps');
            }

            this.token = token;
            if (this.tokenCredential) {
                this.tokenCredential!.token = token;
            }

            tokenRenewalTimer = window.setTimeout(() => this.renewToken(), this.getExpiration(expiresAt));
        } catch (error) {
            if (tokenRenewalTimer!) {
                clearTimeout(tokenRenewalTimer!);
            }
            throw error;
        }
    }

    private getExpiration(expiresAt: Date) {
        // Return the milliseconds remaining until the token must be renewed.
        // Reduce the time until renewal by 5 minutes to avoid using an expired token.
        // The exp property is the time stamp of the expiration, in seconds.
        const renewSkew = 300000;

        return expiresAt.valueOf() - Date.now() - renewSkew;
    }
}
