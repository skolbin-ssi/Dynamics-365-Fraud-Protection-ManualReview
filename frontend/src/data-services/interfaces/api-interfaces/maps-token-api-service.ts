// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ApiServiceResponse } from '../../base-api-service';
import {
    GetMapsTokenResponse,
} from '../../api-services/maps-token-api-service/api-models';

export interface MapsTokenApiService {
    /**
     * Get token for Azure maps
     */
    getMapsToken(): Promise<ApiServiceResponse<GetMapsTokenResponse>>;
}
