// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Alert } from '../../../models';
import { PostAlertRequest } from '../../api-services/alerts-api-service/api-models/post-alert-request';
import { PostAlertResponse } from '../../api-services/alerts-api-service/api-models/post-alert-response';
import { DataTransformer } from '../../data-transformer';
import { BaseAlertTransformer } from './base-alert-transformer';

export class PostAlertsTransformer extends BaseAlertTransformer implements DataTransformer {
    mapResponse(
        response: PostAlertResponse
    ) {
        return this.mapSingleAlert(response);
    }

    mapRequest(
        request: Alert
    ): PostAlertRequest {
        return request.toNewAlertDTO();
    }
}
