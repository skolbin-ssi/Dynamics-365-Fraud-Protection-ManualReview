import { inject } from 'inversify';
import { TYPES } from '../../../types';
import { AuthenticationService } from '../../../utility-services';
import { Configuration } from '../../../utility-services/configuration';
import { BaseApiService } from '../../base-api-service';
import { AlertsApiService } from '../../interfaces';
import { DeleteAlertResponse } from './api-models/delete-alert-response';
import { GetAlertResponse } from './api-models/get-alert-response';
import { GetAlertsResponse } from './api-models/get-alerts-response';
import { PostAlertRequest } from './api-models/post-alert-request';
import { PutAlertRequest } from './api-models/put-alert-request';
import { PutAlertResponse } from './api-models/put-alert-response';

export class AlertsApiServiceImpl extends BaseApiService implements AlertsApiService {
    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/alerts`,
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

    getAlert(alertId: string) {
        return this.get<GetAlertResponse>(`/${alertId}`);
    }

    putAlert(alertId: string, alert: PutAlertRequest) {
        return this.put<PutAlertResponse>(`/${alertId}`, alert);
    }

    deleteAlert(alertId: string) {
        return this.delete<DeleteAlertResponse>(`/${alertId}`);
    }

    postAlert(alert: PostAlertRequest) {
        return this.post<DeleteAlertResponse>('/', alert);
    }

    // getAlertMetrics(alertId: string): void;

    getAlerts() {
        return this.get<GetAlertsResponse>('/my');
    }
}
