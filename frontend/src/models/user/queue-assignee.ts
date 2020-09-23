// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { User } from './user';

export class QueueAssignee extends User {
    isSupervisor: boolean;

    constructor(
        isSupervisor: boolean,
        user: User
    ) {
        const {
            id,
            name,
            roles,
            email,
            upn,
            imageUrl
        } = user;

        super(id, name, roles, email, upn, imageUrl);

        this.isSupervisor = isSupervisor;
    }
}
