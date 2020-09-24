// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';

import { BaseDomainService } from '../base-domain-service';
import { TYPES } from '../../types';
import { Logger } from '../../utility-services/logger';
import { CollectedInfoService, DashboardService, UserService } from '../interfaces';
import { DashboardApiServiceImpl } from '../api-services/dashboard-api-service/dashboard-api-service-impl';
import {
    GetQueuePerformanceTransformer,
    GetItemPlacementMetricsTransformer,
    GetAnalystsPerformanceTransformer,
    GetQueueSizeHistoryTransformer
} from '../data-transformers/dashboard-transformers';
import { DashboardRequestApiParams } from '../interfaces/dashboard-api-service';
import { AnalystPerformance, PerformanceMetrics, ProcessingTimeMetric } from '../../models/dashboard';
import { ProgressPerformanceMetric } from '../../models/dashboard/progress-performance-metric';
import { GetProcessingTimeTransformer } from '../data-transformers/dashboard-transformers/get-processing-time-transformer';
import { UserBuilder, CacheStoreService } from '../../utility-services';

@injectable()
export class DashboardServiceImpl extends BaseDomainService implements DashboardService {
    constructor(
        @inject(TYPES.DASHBOARD_API_SERVICE) private readonly dashboardApiService: DashboardApiServiceImpl,
        @inject(TYPES.COLLECTED_INFO_SERVICE) private readonly collectedInfoService: CollectedInfoService,
        @inject(TYPES.USER_SERVICE) private readonly userService: UserService,
        @inject(TYPES.USER_BUILDER) protected readonly userBuilder: UserBuilder,
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.CACHE_STORE_SERVICE) private readonly cacheStoreService: CacheStoreService
    ) {
        super(logger, 'DashboardService');
    }

    async getQueuesPerformance(params: DashboardRequestApiParams) {
        const dataTransformer = new GetQueuePerformanceTransformer();
        let response;

        try {
            response = await this.dashboardApiService.getQueuesPerformance(params);
        } catch (e) {
            throw this.handleApiException('getQueuesPerformance', e, {
                500: 'Failed to get queues performance from the Api due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getQueuesPerformance',
                    'Failed to parse response from API while retrieving queue performance',
                    e
                );
            }
        }

        return null;
    }

    async getItemPlacementMetrics(params: DashboardRequestApiParams) {
        const dataTransformer = new GetItemPlacementMetricsTransformer();
        let response;

        try {
            response = await this.dashboardApiService.getItemPlacementMetrics(params);
        } catch (e) {
            throw this.handleApiException('getItemPlacementMetrics', e, {
                500: 'Failed to get item placement metrics from the API due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponseToArray(response.data);
            } catch (e) {
                throw this.handleException(
                    'getItemPlacementMetrics',
                    'Failed to parse response from API while retrieving item placement metrics',
                    e
                );
            }
        }

        return null;
    }

    async getItemPlacementMetricsOverall(params: DashboardRequestApiParams) {
        const dataTransformer = new GetItemPlacementMetricsTransformer();
        let response;

        try {
            response = await this.dashboardApiService.getItemPlacementMetricsOverall(params);
        } catch (e) {
            throw this.handleApiException('getItemPlacementMetricsOverall', e, {
                500: 'Failed to get item placement metrics from the API due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getItemPlacementMetricsOverall',
                    'Failed to parse response from API while retrieving item placement metrics',
                    e
                );
            }
        }

        return null;
    }

    async getQueuesSizeHistory(params: DashboardRequestApiParams) {
        const dataTransformer = new GetQueueSizeHistoryTransformer();
        let response;

        try {
            response = await this.dashboardApiService.getQueueSizeHistory(params);
        } catch (e) {
            throw this.handleApiException('getQueueSizeHistory', e, {
                500: 'Failed to get queue size history from the API due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapArrayResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getQueueSizeHistoryOverall',
                    'Failed to parse response from API while retrieving overall queue size history',
                    e
                );
            }
        }

        return null;
    }

    async getQueueSizeHistoryOverall(params: DashboardRequestApiParams) {
        const dataTransformer = new GetQueueSizeHistoryTransformer();
        let response;

        try {
            response = await this.dashboardApiService.getQueueSizeHistoryOverall(params);
        } catch (e) {
            throw this.handleApiException('getQueueSizeHistoryOverall', e, {
                500: 'Failed to get overall queue size history from the API due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getQueueSizeHistory',
                    'Failed to parse response from API while retrieving queue size history',
                    e
                );
            }
        }

        return null;
    }

    async getAnalystsPerformance(params: DashboardRequestApiParams): Promise<AnalystPerformance[] | null> {
        const dataTransformer = new GetAnalystsPerformanceTransformer(this.collectedInfoService, this.userBuilder, this.userService);
        let response;

        try {
            response = await this.dashboardApiService.getAnalystsPerformanceMetrics(params);
        } catch (e) {
            throw this.handleApiException('getAnalystsPerformanceMetrics', e, {
                500: 'Failed to get analysts performance metrics from the Api due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getAnalystsPerformance',
                    'Failed to parse response from API while retrieving analysts performance metrics',
                    e
                );
            }
        }

        return null;
    }

    async getTotalPerformanceMetrics(params: DashboardRequestApiParams): Promise<PerformanceMetrics | null> {
        let response;

        try {
            response = await this.dashboardApiService.getTotalPerformanceMetrics(params);
        } catch (e) {
            throw this.handleApiException('getTotalPerformanceMetrics', e, {
                500: 'Failed to get total performance metrics from the API due to internal server error'
            });
        }

        if (response.data) {
            try {
                return new PerformanceMetrics(response.data);
            } catch (e) {
                throw this.handleException(
                    'getTotalPerformanceMetrics',
                    'Failed to parse response from API while retrieving total performance metrics',
                    e
                );
            }
        }

        return null;
    }

    async getProcessingTimePerformanceMetrics(params: DashboardRequestApiParams): Promise<ProcessingTimeMetric | null> {
        const dataTransformer = new GetProcessingTimeTransformer();

        let response;

        try {
            response = await this.dashboardApiService.getProcessingTimePerformanceMetrics(params);
        } catch (e) {
            throw this.handleApiException('getProcessingTimePerformanceMetrics', e, {
                500: 'Failed to get processing time metric from the API due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getProcessingTimePerformanceMetrics',
                    'Failed to parse response from API while retrieving processing time performance metric',
                    e
                );
            }
        }

        return null;
    }

    async getProgressPerformanceMetric(params: DashboardRequestApiParams): Promise<ProgressPerformanceMetric| null> {
        let response;

        try {
            response = await this.dashboardApiService.getProgressPerformanceMetric(params);
        } catch (e) {
            throw this.handleApiException('getProgressPerformanceMetric', e, {
                500: 'Failed to get progress performance metric from the API due to internal server error'
            });
        }

        if (response.data) {
            try {
                return new ProgressPerformanceMetric(response.data);
            } catch (e) {
                throw this.handleException(
                    'getProgressPerformanceMetric',
                    'Failed to parse response from API while retrieving progress performance metric',
                    e
                );
            }
        }

        return null;
    }
}
