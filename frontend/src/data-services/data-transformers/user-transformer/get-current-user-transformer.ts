import { User } from '../../../models';
import { UserDTO } from '../../api-services/models/user-dto';
import { GetCurrentUserResponse } from '../../api-services/user-api-service/api-models';
import { DataTransformer } from '../../data-transformer';

export class GetCurrentUserTransformer implements DataTransformer {
    mapResponse(
        response: GetCurrentUserResponse
    ): User {
        return this.mapUser(response);
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
