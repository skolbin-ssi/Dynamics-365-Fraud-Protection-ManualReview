// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autoBind from 'autobind-decorator';
import cx from 'classnames';

import { BlurLoader } from '../../blur-loader';
import { PieChart } from '../../pie-chart';
import { CurrentProgress } from '../../../../models/dashboard/progress-performance-metric';
import ArrowUpGreen from '../../../../assets/icon/arrows/arrow-up-top-right-green.svg';
import ArrowUpRed from '../../../../assets/icon/arrows/arrow-up-top-right-red.svg';

import { AnalystPerformanceStore } from '../../../../view-services/dashboard/analyst-performance-store';

import './performance-overview.scss';

const CN = 'performance-overview';

interface PerformanceOverviewComponentProps {
    analystPerformanceStore: AnalystPerformanceStore
}

@observer
export class PerformanceOverview extends Component<PerformanceOverviewComponentProps, never> {
    @autoBind
    renderProgressTableCells() {
        const { analystPerformanceStore: { progressPerformanceMetric, processingTimeMetric } } = this.props;
        if (progressPerformanceMetric && processingTimeMetric) {
            // TODO: Move string keys to the constant values, and create a mapper related with reports
            const renderMapCells = new Map<string, CurrentProgress>([
                ['Number of decisions', progressPerformanceMetric.reviewedProgress],
                ['Annual number of decisions', progressPerformanceMetric.annualReviewedProgress],
                ['Good decisions', progressPerformanceMetric.goodDecisionsProgress],
                ['Annual good decisions', progressPerformanceMetric.annualGoodDecisionsProgress],
                ['Watch decisions', progressPerformanceMetric.watchDecisionsProgress],
                ['Annual watch decisions', progressPerformanceMetric.annualWatchDecisionsProgress],
                ['Bad decisions', progressPerformanceMetric.badDecisionsProgress],
                ['Annual bad decisions', progressPerformanceMetric.annualBadDecisionsProgress],
                ['Escalated items', progressPerformanceMetric.escalatedItemsProgress],
                ['Annual escalated items', progressPerformanceMetric.annualEscalatedItemsProgress],
                ['Wasted time', processingTimeMetric.waistedTime],
                ['Avg. time to make a decision', processingTimeMetric.getTimeToMakeDecision]
            ]);

            const renderArrow = (progress: number) => {
                if (progress === 0) {
                    return null;
                }

                return (
                    <div className={`${CN}__progress-percent-arrow`}>
                        {progress > 0 ? <ArrowUpGreen /> : <ArrowUpRed />}
                    </div>
                );
            };

            return Array.from(renderMapCells).map(([cellTitle, metric]) => (
                <div key={cellTitle} className={`${CN}__decision-cell`}>
                    <div className={`${CN}__progress-item-title`}>{cellTitle}</div>
                    <span className={`${CN}__progress-number`}>
                        <span>{metric.current}</span>
                        {metric.progress !== undefined && (
                            <div className={cx(
                                `${CN}__progress-percents`,
                                { [`${CN}__progress-percents--red`]: metric.progress < 0 },
                                { [`${CN}__progress-percents--green`]: metric.progress > 0 }
                            )}
                            >
                                {renderArrow(metric.progress)}
                                <div>{metric.progress}</div>
                                %
                            </div>
                        )}
                    </span>

                </div>
            ));
        }

        return null;
    }

    render() {
        const {
            analystPerformanceStore: {
                isTotalPerformanceLoading,
                pieChartData
            }
        } = this.props;

        return (
            <section className={`${CN}__analyst-overview-section`}>
                <div className={`${CN}__analyst-overview-section-title`}>Analyst overview</div>
                <div className={`${CN}__analyst-overview-section-content`}>
                    <div className={`${CN}__analyst-progress-table`}>
                        {this.renderProgressTableCells()}
                    </div>
                    <div className={`${CN}__decision-pie-chart`}>
                        <BlurLoader
                            isLoading={isTotalPerformanceLoading}
                            spinnerProps={{
                                label: 'Please, wait! Loading chart data ...'
                            }}
                        >
                            <PieChart data={pieChartData} className={`${CN}__pie-chart`} />
                        </BlurLoader>
                    </div>
                </div>
            </section>
        );
    }
}
