// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DICTIONARY_TYPE } from '../../constants';
import { ApiServiceResponse } from '../base-api-service';

export interface DictionaryApiService {
    getDictionaryValues(type: DICTIONARY_TYPE, query: string): Promise<ApiServiceResponse<string[]>>;

    postDictionaryValues(type: DICTIONARY_TYPE, value: string): Promise<ApiServiceResponse<void>>;
}
