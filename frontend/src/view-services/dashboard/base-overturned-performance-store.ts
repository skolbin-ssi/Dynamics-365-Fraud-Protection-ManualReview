// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed, toJS } from 'mobx';

import { BasePerformanceStore } from './base-performance-store';

import { BasicEntityPerformance } from '../../models/dashboard';
import { PeriodPerformanceMetrics } from '../../data-services/api-services/models/dashboard';
import { formatToLocaleMonthDayFormat } from '../../utils/date';
import { calculatePercentageRatio } from '../../utils/math';
import { OVERTURN_CHART_KEYS, OVERTURN_CHART_REPORT_KEYS, PERFORMANCE_RATING_TO_NUMBER } from '../../constants';
import { Report } from '../../models/misc';
import { formatMetricToPercentageString } from '../../utils/text';
import { PerformanceParsedQueryUrl } from '../../utility-services';

export interface AccuracyChartDatum {
    originalDate: string,
    good: number;
    overturnedGood: number;
    bad: number;
    overturnedBad: number;
    key: string
}

export class BaseOverturnedPerformanceStore<T extends BasicEntityPerformance> extends BasePerformanceStore<T> {
    /**
     *  Set initial values for the store, when page has mounted
     *  and URL parameters are in the URL
     *
     * @param parsedQuery - parsed URL params
     */
    @action
    setParsedUrlParams(parsedQuery: PerformanceParsedQueryUrl) {
        const { overturnedAggregation, overturnedRating, overturnedIds } = parsedQuery;

        if (overturnedIds) {
            this.setUrlSelectedIds(overturnedIds);
        }

        if (overturnedAggregation) {
            this.setAggregation(overturnedAggregation);
        }

        if (overturnedRating) {
            this.setRating(overturnedRating);
        }
    }

    @computed
    get getPerformanceData() {
        const quantity = PERFORMANCE_RATING_TO_NUMBER.get(this.rating);

        if (this.performanceData) {
            return this.performanceData.slice(0, quantity)
                .sort((a, b) => this.sortByDescendingAccuracyAverageRate(a, b));
        }

        return [];
    }

    @computed
    get barChartData(): AccuracyChartDatum[] {
        if (this.performanceData) {
            const data = this.performanceData.reduce((selectedAnalystsPerformanceMetrics, analyst) => {
                if (analyst.isChecked) {
                    return [...selectedAnalystsPerformanceMetrics, analyst.data];
                }

                return selectedAnalystsPerformanceMetrics;
            }, [] as PeriodPerformanceMetrics[]);

            if (data.length) {
                return BaseOverturnedPerformanceStore
                    .calculateAccuracyData(toJS(data));
            }
        }

        return [] as AccuracyChartDatum[];
    }

    static calculateAccuracyData(periodPerformanceMetrics: PeriodPerformanceMetrics[]): AccuracyChartDatum[] {
        return Object.keys(periodPerformanceMetrics[0])
            .reduce((result, date) => {
                const aggregationData = periodPerformanceMetrics
                    .reduce((aggregationResult, analystData) => {
                        const currentAnalystData = analystData[date];

                        return {
                            good: aggregationResult.good + currentAnalystData.good,
                            bad: aggregationResult.bad + currentAnalystData.bad,
                            watched: aggregationResult.watched + currentAnalystData.watched,
                            goodOverturned: aggregationResult.goodOverturned + currentAnalystData.goodOverturned,
                            badOverturned: aggregationResult.badOverturned + currentAnalystData.badOverturned,
                        };
                    }, {
                        good: 0,
                        bad: 0,
                        watched: 0,
                        goodOverturned: 0,
                        badOverturned: 0,
                    });

                const {
                    good, bad, watched, goodOverturned, badOverturned
                } = aggregationData;

                const total = good + bad + watched;

                const barData: AccuracyChartDatum = {
                    key: formatToLocaleMonthDayFormat(date),
                    overturnedGood: calculatePercentageRatio(goodOverturned, total, 0),
                    good: calculatePercentageRatio((good + watched - goodOverturned), total, 0),
                    overturnedBad: -calculatePercentageRatio(badOverturned, total, 0),
                    bad: -calculatePercentageRatio((bad - badOverturned), total, 0),
                    originalDate: date
                };

                return [...result, barData] as Array<AccuracyChartDatum>;
            }, [] as AccuracyChartDatum[]);
    }

    /**
     *   ___ REPORTS GENERATION METHODS ___
     */

    @computed
    protected get overturnedActionsReport(): Report | null {
        if (this.barChartData?.length) {
            const REPORT_NAME = 'Overturned actions';

            const reportRawData = this.barChartData.map(accuracyChartDatum => {
                const formatter = formatMetricToPercentageString;

                return {
                    date: accuracyChartDatum.originalDate,
                    [OVERTURN_CHART_REPORT_KEYS[OVERTURN_CHART_KEYS.GOOD]]:
                        formatter(accuracyChartDatum.good),
                    [OVERTURN_CHART_REPORT_KEYS[OVERTURN_CHART_KEYS.OVERTURNED_GOOD]]:
                        formatter(accuracyChartDatum.overturnedGood),
                    [OVERTURN_CHART_REPORT_KEYS[OVERTURN_CHART_KEYS.BAD]]:
                        formatter(accuracyChartDatum.bad),
                    [OVERTURN_CHART_REPORT_KEYS[OVERTURN_CHART_KEYS.OVERTURNED_BAD]]:
                        formatter(accuracyChartDatum.overturnedBad)
                };
            });

            return BaseOverturnedPerformanceStore.buildReport(REPORT_NAME, reportRawData);
        }

        return null;
    }

    /**
     * Boxed computed expresion function
     * @param name - report name
     * @see https://mobx.js.org/refguide/computed-decorator.html#computedexpression-as-function
     */
    protected accuracyReport(name: string): Report | null {
        return computed(() => {
            if (this.getPerformanceData?.length) {
                const reportRawData = this.getPerformanceData.map(performanceDatum => performanceDatum.accuracyReport);

                return BaseOverturnedPerformanceStore.buildReport(name, reportRawData);
            }

            return null;
        }).get();
    }

    private sortByDescendingAccuracyAverageRate(a: T, b: T) {
        return b.averageOverturnRate - a.averageOverturnRate;
    }
}
