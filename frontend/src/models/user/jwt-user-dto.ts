import * as Msal from 'msal';

export type JWTUserDTO = Msal.Account & {
    email: string,
    roles: string[],
    oid: string
};
