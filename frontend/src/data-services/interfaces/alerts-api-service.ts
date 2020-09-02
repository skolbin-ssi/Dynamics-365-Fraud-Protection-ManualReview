import { DeleteAlertResponse } from '../api-services/alerts-api-service/api-models/delete-alert-response';
import { GetAlertResponse } from '../api-services/alerts-api-service/api-models/get-alert-response';
import { GetAlertsResponse } from '../api-services/alerts-api-service/api-models/get-alerts-response';
import { PostAlertRequest } from '../api-services/alerts-api-service/api-models/post-alert-request';
import { PostAlertResponse } from '../api-services/alerts-api-service/api-models/post-alert-response';
import { PutAlertRequest } from '../api-services/alerts-api-service/api-models/put-alert-request';
import { PutAlertResponse } from '../api-services/alerts-api-service/api-models/put-alert-response';
import { ApiServiceResponse } from '../base-api-service';

export interface AlertsApiService {
    getAlert(alertId: string): Promise<ApiServiceResponse<GetAlertResponse>>;

    putAlert(alertId: string, alert: PutAlertRequest): Promise<ApiServiceResponse<PutAlertResponse>>;

    deleteAlert(alertId: string): Promise<ApiServiceResponse<DeleteAlertResponse>>;

    postAlert(alert: PostAlertRequest): Promise<ApiServiceResponse<PostAlertResponse>>;

    // getAlertMetrics(alertId: string): void;

    getAlerts(): Promise<ApiServiceResponse<GetAlertsResponse>>;
}
