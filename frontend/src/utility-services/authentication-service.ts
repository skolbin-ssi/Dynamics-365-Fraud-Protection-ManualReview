// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { History, Location } from 'history';
import * as Msal from 'msal';
import { inject, injectable } from 'inversify';
import JWTDecode from 'jwt-decode';
import { MRUserAgentApplication } from './mr-msal-user-agent-application';
import { ERROR_SCREEN_STATES, ROUTES } from '../constants';
import { ApiServiceError, ApiServiceRequestConfig } from '../data-services/base-api-service';
import { JWTUserDTO } from '../models';
import { TYPES } from '../types';
import { Configuration } from './configuration';

export type AuthHandlerOptions = {
    isAuthentication: boolean,
    state: Location,
    idToken?: string,
    errorDescription?: string
};

export interface ActiveDirectoryResponseParams {
    access_token: string;
    token_type: string;
    expires_in: string;
    scope: string;
    id_token: string;
    state: string;
    error: string;
    error_description: string;
}

export interface AzureAuthResponseParsedParams {
    accessToken?: string;
    tokenType?: string;
    expiresIn?: string;
    scope?: unknown;
    idToken?: string;
    error?: string;
    errorDescription?: string;
    state: Location;
}

/**
 * Implementation of Microsoft identity platform Implicit grant flow
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-implicit-grant-flow
 */
@injectable()
export class AuthenticationService {
    private defaultRedirectLocation = { pathname: ROUTES.QUEUES } as Location;

    private msalConfig: Msal.Configuration;

    private msalAuthParams: Msal.AuthenticationParameters;

    private msal: MRUserAgentApplication;

    private scopes: string[];

    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.HISTORY) private readonly history: History
    ) {
        const { authentication } = this.config;
        const { clientId, tenant, baseAuthUrl } = authentication;

        this.scopes = [`api://${clientId}/user_impersonation`];

        // Config object to be passed to Msal on creation
        this.msalConfig = {
            auth: {
                clientId,
                redirectUri: this.redirectUrl,
                authority: `${baseAuthUrl}/${tenant}`,
                navigateToLoginRequestUrl: false
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: true
            },
            system:
            {
                loadFrameTimeout: 30000,
                navigateFrameWait: 0
            }
        };

        this.msalAuthParams = {
            scopes: this.scopes
        };

        this.msal = new MRUserAgentApplication(this.msalConfig);
    }

    /**
     * Redirect user to Azure AD Login Page
     */
    redirectToAzureLogin(returnLocation: Location = this.defaultRedirectLocation) {
        this.msal.loginRedirect({
            scopes: this.scopes,
            prompt: 'select_account',
            state: JSON.stringify(returnLocation),
            redirectUri: this.redirectUrl,
            redirectStartPage: this.redirectUrl
        });
    }

    /**
     * Checks if user is authenticated
     */
    isAuthenticated() {
        return !!this.msal.getAccount();
    }

    /**
     * Handles hash url as a result from Azure response
     * If hash contains AzureAD response this is redirect from Azure and login redirect is not needed
     * Otherwise redirect should be performed
     * @param hash
     */
    shouldPerformLogin(hash: string): boolean {
        return !this.msal.isCallback(hash);
    }

    clearTokenAndSignOut() {
        this.msal.logout();
    }

    async apiRequestInterceptor(config: ApiServiceRequestConfig) {
        const idToken = await this.getToken();

        if (!idToken) {
            this.navigateTo(ROUTES.LOGIN);
        }

        const headers = {
            ...config.headers,
            Authorization: `Bearer ${idToken}`
        };

        return {
            ...config,
            headers
        } as ApiServiceRequestConfig;
    }

    apiResponseInterceptor(error: ApiServiceError) {
        if (error.response) {
            const { status } = error.response;

            if (status === 401) {
                this.navigateTo(ROUTES.LOGIN);
            } else if (status === 403) {
                this.navigateTo(ROUTES.build.error(ERROR_SCREEN_STATES.FORBIDDEN));
            }
        }

        throw error;
    }

    setAuthHandler(
        handler: (options: AuthHandlerOptions) => void
    ) {
        this.msal.handleRedirectCallback(
            (error, response) => {
                let stateObj;

                try {
                    stateObj = JSON.parse(response?.accountState || '{}');

                    if (stateObj.pathname === ROUTES.LOGIN) {
                        stateObj = this.defaultRedirectLocation;
                    }
                } catch (e) {
                    stateObj = this.defaultRedirectLocation;
                }

                handler({
                    isAuthentication: !error,
                    state: stateObj as Location,
                    idToken: response?.idToken?.rawIdToken as string,
                    errorDescription: error?.errorMessage
                });
            }
        );
    }

    /**
     * Reads token and resunt User model based on token properties
     * If token passed as argument it will be parsed
     * Otherwise token will be read from session storage
     */
    getJWTUserFromToken(): JWTUserDTO {
        const tokenToParse = this.msal.getRawIdToken();

        if (!tokenToParse) {
            throw new Error('Token not found');
        }

        return JWTDecode<JWTUserDTO>(tokenToParse); // , tokenToParse
    }

    /**
     * Navigates user to another page
     * transition current location state to state.from property
     *
     * @param pathname
     */
    private navigateTo(pathname: string) {
        this.history.push({
            pathname,
            state: { from: this.history.location }
        });
    }

    /**
     * Acquire raw id token.
     */
    async getToken(): Promise<string> {
        let authResponse: Msal.AuthResponse;
        try {
            // Only pass the clientId to renew an idToken
            authResponse = await this.msal.acquireTokenSilent({ ...this.msalAuthParams, scopes: ['27193f56-cb90-4e67-8cf2-13eabbbabca5'] });

            return authResponse.idToken.rawIdToken;
        } catch (e) {
            // Acquire token silent failure, and send an interactive request
            if (this.requireInteraction(e.errorMessage) || e.name === 'InteractionRequiredAuthError') {
                this.msal.acquireTokenRedirect(this.msalAuthParams);
            }

            throw e;
        }
    }

    /**
     * Get current <domain>/login path
     */
    private get redirectUrl() {
        const { origin } = window.location;

        return `${origin}${ROUTES.LOGIN}`;
    }

    private requireInteraction = (errorMessage: Msal.AuthError['errorMessage']): boolean => {
        if (!errorMessage || !errorMessage.length) {
            return false;
        }

        return errorMessage.includes('consent_required') || errorMessage.includes('interaction_required') || errorMessage.includes('login_required');
    };
}
