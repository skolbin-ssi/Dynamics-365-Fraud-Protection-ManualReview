import { inject, injectable } from 'inversify';

import { DashboardApiService, DashboardRequestApiParams } from '../../interfaces/dashboard-api-service';
import { BaseApiService } from '../../base-api-service';
import { TYPES } from '../../../types';
import { Configuration } from '../../../utility-services/configuration';
import { AuthenticationService } from '../../../utility-services';
import { GetQueuesPerformanceResponse } from './queues/api-models';
import { GetItemPlacementMetricsResponse, GetItemPlacementMetricsResponseArray } from './item-placement/api-models';
import { GetQueueSizeHistoryArrayResponse, GetQueueSizeHistoryResponse } from './queue-size-history/api-models';
import { GetAnalystsPerformanceResponse } from './analyst/api-models';
import { GetTotalPerformanceMetricsResponse } from './performance-metrics/api-models';
import { GetProcessingTimeMetricResponse } from './processing-time-metric/api-models';
import { GetProgressPerformanceMetric } from './progress-performance-metric/api-models';

@injectable()
export class DashboardApiServiceImpl extends BaseApiService implements DashboardApiService {
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/dashboards`,
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

    getQueuesPerformance(params: DashboardRequestApiParams) {
        return this.get<GetQueuesPerformanceResponse>('labeling/queues', { params });
    }

    getItemPlacementMetrics(params: DashboardRequestApiParams) {
        return this.get<GetItemPlacementMetricsResponseArray>('item-placement/queues', { params });
    }

    getItemPlacementMetricsOverall(params: DashboardRequestApiParams) {
        return this.get<GetItemPlacementMetricsResponse>('item-placement/overall', { params });
    }

    getQueueSizeHistoryOverall(params: DashboardRequestApiParams) {
        return this.get<GetQueueSizeHistoryResponse>('size-history/overall', { params });
    }

    getQueueSizeHistory(params: DashboardRequestApiParams) {
        return this.get<GetQueueSizeHistoryArrayResponse>('size-history/queues', { params });
    }

    getAnalystsPerformanceMetrics(params: DashboardRequestApiParams) {
        return this.get<GetAnalystsPerformanceResponse>('labeling/analysts', { params });
    }

    getTotalPerformanceMetrics(params: DashboardRequestApiParams) {
        return this.get<GetTotalPerformanceMetricsResponse>('labeling/total', { params });
    }

    getProcessingTimePerformanceMetrics(params: DashboardRequestApiParams) {
        return this.get<GetProcessingTimeMetricResponse>('labeling-time/progress', { params });
    }

    getProgressPerformanceMetric(params: DashboardRequestApiParams) {
        return this.get<GetProgressPerformanceMetric>('labeling/progress', { params });
    }
}
