// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './error.scss';

import autoBind from 'autobind-decorator';
import { Location } from 'history';
import { resolve } from 'inversify-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';

import ForbiddenIllustrationSvg from '../../assets/403Illustration.svg';
import NotFoundIllustrationSvg from '../../assets/404Illustration.svg';
import { ErrorContent } from '../../components/error-content';
import { headerStackStyles } from '../../components/page-layout/header/header.styles';
import { ERROR_SCREEN_STATES, ROUTES } from '../../constants';
import { TYPES } from '../../types';
import { AuthenticationService } from '../../utility-services';

const CN = 'error';

const FORBIDDEN_MSG = 'The access is forbidden. Please sign in';
const NOT_FOUND_MSG = 'The page you are looking for does\'t exist';

export interface ErrorScreenStateParams {
    type?: ERROR_SCREEN_STATES
}

export type ErrorComponentProps = RouteComponentProps<ErrorScreenStateParams>;

@autoBind
export class Error extends Component<ErrorComponentProps, never> {
    @resolve(TYPES.AUTHENTICATION)
    private authenticationService!: AuthenticationService;

    getErrorType(): ERROR_SCREEN_STATES {
        const { match } = this.props;
        const { params } = match;

        return params.type as ERROR_SCREEN_STATES;
    }

    goHome() {
        const { history } = this.props;
        history.push(ROUTES.QUEUES);
    }

    // TODO: duplication on Login impl, come up with consistent approach
    handleLogin() {
        const { location } = this.props;
        const { state } = location;
        let { from } = (state || { from: { pathname: ROUTES.QUEUES } }) as { from: Location };

        const isRedundantState = [
            ROUTES.build.error(ERROR_SCREEN_STATES.FORBIDDEN),
            ROUTES.build.error(ERROR_SCREEN_STATES.NOT_FOUND),
            ROUTES.LOGIN
        ].includes(from.pathname);

        if (isRedundantState) {
            from = { pathname: ROUTES.QUEUES } as Location;
        }
        this.authenticationService.redirectToAzureLogin(from);
    }

    renderMessage() {
        switch (this.getErrorType()) {
            case ERROR_SCREEN_STATES.FORBIDDEN:
                return (
                    <ErrorContent
                        illustrationSvg={ForbiddenIllustrationSvg}
                        message={FORBIDDEN_MSG}
                        buttonText="Sign in"
                        onClick={this.handleLogin}
                    />
                );
            case ERROR_SCREEN_STATES.NOT_FOUND:
                return (
                    <ErrorContent
                        illustrationSvg={NotFoundIllustrationSvg}
                        message={NOT_FOUND_MSG}
                        buttonText="Back Home"
                        onClick={this.goHome}
                    />
                );
            default:
                return null;
        }
    }

    render() {
        return (
            <div className={CN}>
                <Stack
                    className={`${CN}__header`}
                    styles={headerStackStyles}
                    as="header"
                    verticalAlign="center"
                >
                    <Stack.Item align="center">
                        <Text
                            className={`${CN}__header`}
                            as="h1"
                            variant="mediumPlus"
                        >
                            Dynamics 365 Fraud Protection Manual Review
                        </Text>
                    </Stack.Item>
                </Stack>
                <Stack
                    className={`${CN}__content`}
                    grow
                    verticalFill
                    horizontalAlign="center"
                    verticalAlign="center"
                >
                    {this.renderMessage()}
                </Stack>
            </div>
        );
    }
}
