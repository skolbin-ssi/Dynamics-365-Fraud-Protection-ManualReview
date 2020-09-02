import { inject, injectable } from 'inversify';
import { action, observable } from 'mobx';
import { PERMISSION, ROLE, ROLES_ACCESS_MAPPING } from '../constants';
import { UserService } from '../data-services';
import { JWTUserDTO, User } from '../models';
import { TYPES } from '../types';
import { AuthenticationService, UserBuilder } from '../utility-services';

@injectable()
export class CurrentUserStore {
    @observable
    user: User | null = null;

    @observable
    permissions: PERMISSION[] = [];

    @observable
    isAuthenticated: boolean = false;

    @observable
    showUserPanel: boolean = false;

    constructor(
        @inject(TYPES.AUTHENTICATION) public readonly authService: AuthenticationService,
        @inject(TYPES.USER_SERVICE) public readonly userService: UserService,
        @inject(TYPES.USER_BUILDER) public readonly userBuilder: UserBuilder,
    ) {
        if (authService.isAuthenticated()) {
            // this.setUserFromJWT(this.authService.getJWTUserFromToken());
            // this.loadCurrentUserInfo();
        }
    }

    @action
    setUserFromJWT(jwtUserDTO: JWTUserDTO) {
        this.user = this.userBuilder.buildFromJWT(jwtUserDTO);
        this.permissions = this.getUserPermission(this.user);
        this.isAuthenticated = true;
    }

    @action
    async loadCurrentUserInfo() {
        this.user = await this.userService.loadCurrentUser();
        this.permissions = this.getUserPermission(this.user);
        this.isAuthenticated = true;
    }

    @action
    signOut() {
        this.authService.clearTokenAndSignOut();
    }

    @action
    toggleUserPanel(show?: boolean) {
        this.showUserPanel = show || !this.showUserPanel;
    }

    @action
    loadUsersAndCache() {
        return this.userService.loadUsersAndCache();
    }

    /**
     * Check if user has access to passed operation
     * If multiple operations passed, check if user can do all of them
     * @param operation
     */
    checkUserCan(operation: PERMISSION | PERMISSION[]) {
        const operationArray = Array.isArray(operation) ? operation : [operation];
        return !operationArray.some((p => !this.permissions.includes(p)));
    }

    /**
     * Check if user has access to passed operation
     * If multiple operations passed, check if user can do at least one of them
     * @param operation
     */
    checkUserCanOneOf(operation: PERMISSION | PERMISSION[]) {
        const operationArray = Array.isArray(operation) ? operation : [operation];
        return operationArray.some((p => this.permissions.includes(p)));
    }

    private getUserPermission(user: User) {
        if (!user || !user.roles) return [];
        const { roles } = user;

        // Recursive permissions lookup in ROLES_ACCESS_MAPPING based on user roles
        const getPermissions = (inheritedRoles: ROLE[], permissions: PERMISSION[] = [], checkedRoles: ROLE[] = []): PERMISSION[] => inheritedRoles
            .reduce<PERMISSION[]>((rolePermissions, role) => {
            const newPermissions = [...permissions, ...ROLES_ACCESS_MAPPING[role].permissions];

            if (
                ROLES_ACCESS_MAPPING[role].inherits
                && ROLES_ACCESS_MAPPING[role].inherits.length !== 0
                && !checkedRoles.includes(role)
            ) {
                const newCheckedRoles = checkedRoles.concat([role]);
                return rolePermissions.concat(
                    getPermissions(ROLES_ACCESS_MAPPING[role].inherits, newPermissions, newCheckedRoles)
                );
            }

            return rolePermissions.concat(newPermissions);
        }, []);

        const nonUniqUserPermissions = getPermissions(roles);

        // Filter unique permissions
        return nonUniqUserPermissions.filter((permission, i, arr) => arr
            .findIndex(t => t === permission) === i);
    }
}
