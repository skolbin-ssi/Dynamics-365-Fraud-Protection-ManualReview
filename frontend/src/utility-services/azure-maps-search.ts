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
import { AuthenticationService } from './authentication-service';
import { Configuration } from './configuration';

export type LocationAsArray = [number | undefined, number | undefined];

@injectable()
export class AzureMapsSearch {
    private searchURL?: SearchURL;

    private spatialURL?: SpatialURL;

    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {}

    async initApi() {
        const aadToken = await this.authService.getAtlasAccessToken();
        const tokenCredential = new TokenCredential(this.config.maps.clientId, aadToken);
        let tokenRenewalTimer: number;

        // Create a repeating time-out that will renew the Azure AD token.
        // This time-out must be cleared when the TokenCredential object is no longer needed.
        // If the time-out is not cleared, the memory used by the TokenCredential will never be reclaimed.
        const renewToken = async () => {
            try {
                const token = await this.authService.getAtlasAccessToken();
                tokenCredential.token = token;
                tokenRenewalTimer = window.setTimeout(renewToken, this.getExpiration(token));
            } catch (error) {
                if (tokenRenewalTimer) {
                    clearTimeout(tokenRenewalTimer);
                }
                throw error;
            }
        };
        tokenRenewalTimer = window.setTimeout(renewToken, this.getExpiration(aadToken));

        // Use tokenCredential to create a pipeline.
        const pipeline = MapsURL
            .newPipeline(tokenCredential, {
                retryOptions: { maxTries: 4 }
            });

        // Create an instance of the SearchURL and SpatialURL client.
        return {
            searchURL: new SearchURL(pipeline),
            spatialURL: new SpatialURL(pipeline)
        };
    }

    async getLocationByAddress(address: Address): Promise<LocationAsArray> {
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

    async getDistance(address1: GeoAddress, address2: GeoAddress) {
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

    private getExpiration(jwtToken: string) {
        // Decode the JSON Web Token (JWT) to get the expiration time stamp.
        const json = atob(jwtToken.split('.')[1]);
        const decode = JSON.parse(json);

        // Return the milliseconds remaining until the token must be renewed.
        // Reduce the time until renewal by 5 minutes to avoid using an expired token.
        // The exp property is the time stamp of the expiration, in seconds.
        const renewSkew = 300000;
        return (1000 * decode.exp) - Date.now() - renewSkew;
    }
}
