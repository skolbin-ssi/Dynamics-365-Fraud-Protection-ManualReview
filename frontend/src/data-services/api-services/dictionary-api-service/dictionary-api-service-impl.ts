import { inject } from 'inversify';
import axios, { CancelTokenSource } from 'axios';
import { DICTIONARY_TYPE } from '../../../constants';
import { TYPES } from '../../../types';
import { AuthenticationService } from '../../../utility-services';
import { Configuration } from '../../../utility-services/configuration';
import { BaseApiService } from '../../base-api-service';
import { DictionaryApiService } from '../../interfaces';

export class DictionaryApiServiceImpl extends BaseApiService implements DictionaryApiService {
    private dictionaryRequestsMap: Map<DICTIONARY_TYPE, CancelTokenSource> = new Map();

    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/dictionary`,
            {
                request: {
                    onFulfilled: authService.apiRequestInterceptor.bind(authService)
                },
                response: {
                    onRejection: authService.apiResponseInterceptor.bind(authService)
                }
            }
        );
    }

    getDictionaryValues(type: DICTIONARY_TYPE, query: string) {
        if (this.dictionaryRequestsMap.has(type)) {
            this.dictionaryRequestsMap.get(type)?.cancel();
        }

        const newCancellationToken = axios.CancelToken.source();
        this.dictionaryRequestsMap.set(type, newCancellationToken);

        return this.get<string[]>(`/${type}`, {
            params: { value: query },
            cancelToken: newCancellationToken.token
        });
    }

    postDictionaryValues(type: DICTIONARY_TYPE, value: string) {
        return this.post<void>(`/${type}`, { value });
    }
}
