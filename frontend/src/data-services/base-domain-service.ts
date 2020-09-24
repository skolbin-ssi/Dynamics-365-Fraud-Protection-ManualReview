// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { injectable } from 'inversify';
import { MrUserError } from '../models/exceptions';
import { Logger } from '../utility-services';
import { PageableListDTO } from './api-services/models';
import { ApiServiceError, isApiServiceError } from './base-api-service';

@injectable()
export class BaseDomainService {
    private continuationTokensMap = new Map<string, string>();

    constructor(
        protected readonly logger: Logger,
        protected readonly serviceName: string
    ) {}

    protected handleException(methodName: string, message: string, e: any) {
        this.logger.warn(`${this.serviceName}.${methodName} ${message}`, e);
        return new MrUserError(message, e);
    }

    protected handleApiException(methodName: string, e: ApiServiceError | any, messageMapping: { [key: number]: string }, disableLogs: boolean = false) {
        let error = e;

        if (isApiServiceError(e) && e.code) {
            const codeNumber = parseInt(e.code, 10);
            const message = messageMapping[codeNumber];

            if (message) {
                error = new MrUserError(message, e);
            }
        }

        if (!disableLogs) {
            this.logger.warn(`${this.serviceName}.${methodName}`, error);
        }
        return error;
    }

    /**
     * Stores continuation token to the map and return if can load more
     * @param requestIdentifier
     * @param pageableListResponse
     */
    protected storeContinuationToken(requestIdentifier: string, pageableListResponse: PageableListDTO<unknown>): boolean {
        this.continuationTokensMap.set(requestIdentifier, pageableListResponse.continuationToken);

        return !!pageableListResponse.continuationToken;
    }

    protected getContinuationToken(requestIdentifies: string) {
        return this.continuationTokensMap.get(requestIdentifies);
    }
}
