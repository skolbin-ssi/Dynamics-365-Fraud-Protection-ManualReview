import { GetAlertsResponse } from '../../api-services/alerts-api-service/api-models/get-alerts-response';
import { DataTransformer } from '../../data-transformer';
import { BaseAlertTransformer } from './base-alert-transformer';

export class GetAlertsTransformer extends BaseAlertTransformer implements DataTransformer {
    mapResponse(
        response: GetAlertsResponse
    ) {
        return response.map(this.mapSingleAlert.bind(this));
    }
}
