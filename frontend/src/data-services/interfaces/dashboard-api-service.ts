// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ApiServiceResponse } from '../base-api-service';
import { GetQueuesPerformanceResponse } from '../api-services/dashboard-api-service/queues/api-models';
import {
    GetItemPlacementMetricsResponse,
    GetItemPlacementMetricsResponseArray
} from '../api-services/dashboard-api-service/item-placement/api-models';
import { GetAnalystsPerformanceResponse } from '../api-services/dashboard-api-service/analyst/api-models';
import { GetTotalPerformanceMetricsResponse } from '../api-services/dashboard-api-service/performance-metrics/api-models';

import { DURATION_PERIOD } from '../../constants';
import {
    GetQueueSizeHistoryArrayResponse,
    GetQueueSizeHistoryResponse
} from '../api-services/dashboard-api-service/queue-size-history/api-models';

export interface DashboardRequestApiParams {
    /**
     * from - start of the date range, excluding a time zone
     * (format e. g.: 2020-06-10T00:00:00+00:00)
     */
    from: string,

    /**
     * to - end of the date range, excluding a time zone
     * (format e. g.: 2020-06-10T00:00:00+00:00
     */
    to: string,

    /**
     *  aggregation - string($PnDTnHnMn.nS) (e. g.: P1DT24H)
     */
    aggregation: DURATION_PERIOD,

    /**
     * queueId - queue id, if provided gets statistic by specified queue
     * (keep empty to query all)
     */
    queue?: string | string[],

    /**
     * analystId - analyst id, if provided gets gets statistic by specified analyst
     * (keep empty to query all)
     */
    analyst?: string | string[]
}

export interface DashboardApiService {

    /**
     * Returns performance metrics for all queues
     * @param params - api params
     */
    getQueuesPerformance(params: DashboardRequestApiParams): Promise<ApiServiceResponse<GetQueuesPerformanceResponse>>

    /**
     * Returns size history metrics for list of queue/queues
     * @param params - api params
     */
    getQueueSizeHistory(params: DashboardRequestApiParams): Promise<ApiServiceResponse<GetQueueSizeHistoryArrayResponse>>

    getQueueSizeHistoryOverall(params: DashboardRequestApiParams): Promise<ApiServiceResponse<GetQueueSizeHistoryResponse>>

    /**
     * Returns performance metrics for all queues
     * @param params - api params
     */
    getItemPlacementMetrics(params: DashboardRequestApiParams): Promise<ApiServiceResponse<GetItemPlacementMetricsResponseArray>>

    getItemPlacementMetricsOverall(params: DashboardRequestApiParams): Promise<ApiServiceResponse<GetItemPlacementMetricsResponse>>

    /**
     * Returns performance metrics for specific queue for all analysts
     * @param params - API endpoint params
     */
    getAnalystsPerformanceMetrics(params: DashboardRequestApiParams): Promise<ApiServiceResponse<GetAnalystsPerformanceResponse>>

    getTotalPerformanceMetrics(params: DashboardRequestApiParams): Promise<ApiServiceResponse<GetTotalPerformanceMetricsResponse>>
}
