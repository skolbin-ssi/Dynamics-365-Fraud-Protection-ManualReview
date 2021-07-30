// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { ROLE } from '../constants';
import { UserService } from '../data-services';
import { JWTUserDTO, User } from '../models/user';
import { TYPES } from '../types';
import { Logger } from './logger/logger';

@injectable()
export class UserBuilder {
    constructor(
        @inject(TYPES.USER_SERVICE) private readonly userService: UserService,
        @inject(TYPES.LOGGER) private readonly logger: Logger
    ) {}

    buildFromJWT(jwtUserDTO: JWTUserDTO): User {
        const {
            name,
            email,
            roles,
            oid
        } = jwtUserDTO;

        const userModel = new User(oid, name, this.getMRUserRoles(roles), email);

        this.userService
            .getUserPhoto(oid)
            .then(imageUrl => userModel.setImageUrl(imageUrl))
            .catch(e => this.logger.debug(e));

        return userModel;
    }

    buildById(userId: string): User | null {
        return this.userService.getUser(userId);
    }

    /**
     * parse list of string roles from JWT and return MR roles
     * @param roles
     */
    private getMRUserRoles(roles: string[] = []): ROLE[] {
        const manualReviewRoles = roles.reduce<ROLE[]>((mrRoles, role) => {
            if (Object.values(ROLE).includes(role as ROLE)) {
                return mrRoles.concat([ROLE[role as ROLE]]);
            }

            return mrRoles;
        }, []);

        if (manualReviewRoles.length) {
            return manualReviewRoles;
        }

        return [ROLE.GUEST];
    }
}
