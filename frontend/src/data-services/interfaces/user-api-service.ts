// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ApiServiceResponse } from '../base-api-service';
import {
    GetUsersResponse,
    GetUserPhotoResponse,
    GetCurrentUserResponse
} from '../api-services/user-api-service/api-models';

export interface UserApiService {
    /**
     * Get list of users connected to the system
     */
    getUsers(): Promise<ApiServiceResponse<GetUsersResponse>>;

    /**
     * Get user's photo
     * @param userId
     */
    getUserPhoto(userId: string): Promise<ApiServiceResponse<GetUserPhotoResponse>>;

    /**
     * Get current user
     */
    loadCurrentUser(): Promise<ApiServiceResponse<GetCurrentUserResponse>>;
}
