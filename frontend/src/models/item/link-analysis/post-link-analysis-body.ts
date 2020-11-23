// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ANALYSIS_FIELDS } from '../../../constants/link-analysis';

export interface PostLinkAnalysisBody {
    itemId:string;
    queueId: string;

    /**
     * fields - selected fields for link analysis
     */
    fields: ANALYSIS_FIELDS[]
}
