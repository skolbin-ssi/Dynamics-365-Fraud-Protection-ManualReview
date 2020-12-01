// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DICTIONARY_TYPE } from '../../constants';
import { ApiServiceResponse } from '../base-api-service';

export interface DictionaryApiService {
    getDictionaryValues(type: DICTIONARY_TYPE | string, query: string): Promise<ApiServiceResponse<string[]>>;

    postDictionaryValues(type: DICTIONARY_TYPE | string, value: string): Promise<ApiServiceResponse<void>>;
}
