import { computed, toJS } from 'mobx';

import { BasePerformanceStore } from './base-performance-store';

import { BasicEntityPerformance } from '../../models/dashboard';
import { PeriodPerformanceMetrics } from '../../data-services/api-services/models/dashboard';
import { isoStringToLocalMothDayFormat } from '../../utils/date';
import { calculatePercentageRatio } from '../../utils/math';
import { OVERTURNED_CHART_KEYS, OVERTURNED_CHART_REPORT_KEYS, PERFORMANCE_RATING_TO_NUMBER } from '../../constants';
import { Report } from '../../models/misc';
import { formatMetricToPercentageString } from '../../utils/text';

export interface AccuracyChartDatum {
    originalDate: string,
    approveUnmatched: number;
    approveMatched: number;
    rejectUnmatched: number;
    rejectMatched: number;
    key: string
}

export class BaseOverturnedPerformanceStore<T extends BasicEntityPerformance> extends BasePerformanceStore<T> {
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
                    .calculateAccuracyData(toJS(data))
                    .filter(datum => {
                        const { key, ...metrics } = datum;
                        return Object.values(metrics).some(metric => metric > 0);
                    });
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
                            approved: aggregationResult.approved + currentAnalystData.approved,
                            rejected: aggregationResult.rejected + currentAnalystData.rejected,
                            watched: aggregationResult.watched + currentAnalystData.watched,
                            approveOverturned: aggregationResult.approveOverturned + currentAnalystData.approveOverturned,
                            rejectOverturned: aggregationResult.rejectOverturned + currentAnalystData.rejectOverturned,
                        };
                    }, {
                        approved: 0,
                        rejected: 0,
                        watched: 0,
                        approveOverturned: 0,
                        rejectOverturned: 0,
                    });

                const {
                    approved, rejected, watched, approveOverturned, rejectOverturned
                } = aggregationData;

                const total = approved + rejected + watched;

                const barData: AccuracyChartDatum = {
                    key: isoStringToLocalMothDayFormat(date),
                    approveUnmatched: calculatePercentageRatio(approveOverturned, total, 0),
                    approveMatched: calculatePercentageRatio((approved + watched - approveOverturned), total, 0),
                    rejectUnmatched: -calculatePercentageRatio(rejectOverturned, total, 0),
                    rejectMatched: -calculatePercentageRatio((rejected - rejectOverturned), total, 0),
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
                    [OVERTURNED_CHART_REPORT_KEYS[OVERTURNED_CHART_KEYS.APPROVED_MATCHED]]:
                        formatter(accuracyChartDatum.approveMatched),
                    [OVERTURNED_CHART_REPORT_KEYS[OVERTURNED_CHART_KEYS.APPROVED_UNMATCHED]]:
                        formatter(accuracyChartDatum.approveUnmatched),
                    [OVERTURNED_CHART_REPORT_KEYS[OVERTURNED_CHART_KEYS.REJECTED_MATCHED]]:
                        formatter(accuracyChartDatum.rejectMatched),
                    [OVERTURNED_CHART_REPORT_KEYS[OVERTURNED_CHART_KEYS.REJECTED_UNMATCHED]]:
                        formatter(accuracyChartDatum.rejectUnmatched)
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
        return b.accuracyAverage - a.accuracyAverage;
    }
}
