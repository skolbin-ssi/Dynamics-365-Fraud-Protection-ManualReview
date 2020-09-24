// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { User } from '../../../models';
import { UserDTO } from '../../api-services/models/user-dto';
import { GetUsersResponse } from '../../api-services/user-api-service/api-models';
import { DataTransformer } from '../../data-transformer';

export class GetUsersTransformer implements DataTransformer {
    mapResponse(
        response: GetUsersResponse
    ): User[] {
        return response
            .map(this.mapUser.bind(this));
    }

    private mapUser(user: UserDTO): User {
        const {
            id,
            displayName,
            roles,
            mail,
            userPrincipalName
        } = user;

        return new User(id, displayName, roles, mail, userPrincipalName);
    }
}
