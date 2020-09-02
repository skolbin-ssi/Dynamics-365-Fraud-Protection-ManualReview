import { Alert } from '../../../models';
import { PutAlertRequest } from '../../api-services/alerts-api-service/api-models/put-alert-request';
import { PutAlertResponse } from '../../api-services/alerts-api-service/api-models/put-alert-response';
import { DataTransformer } from '../../data-transformer';
import { BaseAlertTransformer } from './base-alert-transformer';

export class PutAlertsTransformer extends BaseAlertTransformer implements DataTransformer {
    mapResponse(
        response: PutAlertResponse
    ) {
        return this.mapSingleAlert(response);
    }

    mapRequest(
        request: Alert
    ): PutAlertRequest {
        return request.toNewAlertDTO();
    }
}
