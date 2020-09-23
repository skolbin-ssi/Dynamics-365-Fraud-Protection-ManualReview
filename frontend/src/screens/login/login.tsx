// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Spinner } from '@fluentui/react/lib/Spinner';
import autobind from 'autobind-decorator';
import { resolve } from 'inversify-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Location } from 'history';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { TYPES } from '../../types';
import { AuthenticationService, AuthHandlerOptions } from '../../utility-services';
import { CurrentUserStore } from '../../view-services';

export class Login extends Component<RouteComponentProps, { error?: string }> {
    @resolve(TYPES.AUTHENTICATION)
    private authenticationService!: AuthenticationService;

    @resolve(TYPES.CURRENT_USER_STORE)
    private userStore!: CurrentUserStore;

    constructor(props: RouteComponentProps) {
        super(props);
        this.state = { error: '' };
    }

    /**
     * 1. check if success
     * 2. if success
     *    store token
     *    redirect to state
     * 3. if error
     *    show error message on the UI
     *    offer retry
     */
    componentDidMount() {
        const { location } = this.props;
        const { hash, state } = location;

        this.authenticationService.setAuthHandler(this.authResponseHandler);

        /**
         * Redirect user to Azure AD in all cases except if hash params contains response from Azure
         * Meaning this is redirect back from Azure into Application
         */
        if (this.authenticationService.shouldPerformLogin(hash)) {
            const { from } = (state || {}) as { from: Location };
            this.authenticationService.redirectToAzureLogin(from);
        }
    }

    @autobind
    async authResponseHandler(options: AuthHandlerOptions) {
        const {
            isAuthentication,
            state: redirectToState,
            idToken,
            errorDescription
        } = options;

        if (isAuthentication && idToken) {
            try {
                // this.userStore.setUserFromJWT(this.authenticationService.getJWTUserFromToken());
                await this.userStore.loadCurrentUserInfo();
            } catch (e) {
                this.setState({ error: e.message });
            }

            this.emitAuthorizedLoadAndRedirect(redirectToState);
        } else {
            this.setState({
                error: errorDescription
            });
        }
    }

    /**
     * After handling auth response we have to emit page load activities with authorized user
     * e.g. load users that required authentication and was not called on initial page load
     * @param redirectToState
     */
    @autobind
    async emitAuthorizedLoadAndRedirect(redirectToState: Location) {
        const { history } = this.props;
        try {
            /**
             * Load users since they were not loaded on page load
             * Authentication was not there in session storage when page was loading
             */
            await this.userStore.loadUsersAndCache();
        } finally {
            history.replace(redirectToState);
        }
    }

    render() {
        const { error } = this.state;

        return (
            <Stack
                grow
                verticalFill
                horizontalAlign="center"
                verticalAlign="center"
            >
                {!error && <Spinner label="Signing you in." /> }
                {error && <Text>{error}</Text>}
            </Stack>
        );
    }
}
