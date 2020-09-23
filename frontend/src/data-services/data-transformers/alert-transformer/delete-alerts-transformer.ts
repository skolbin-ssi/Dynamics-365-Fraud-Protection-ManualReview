// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DeleteAlertResponse } from '../../api-services/alerts-api-service/api-models/delete-alert-response';
import { DataTransformer } from '../../data-transformer';
import { BaseAlertTransformer } from './base-alert-transformer';

export class DeleteAlertsTransformer extends BaseAlertTransformer implements DataTransformer {
    mapResponse(
        response: DeleteAlertResponse
    ) {
        return this.mapSingleAlert(response);
    }
}
