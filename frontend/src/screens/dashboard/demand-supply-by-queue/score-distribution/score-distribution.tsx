// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';

import autobind from 'autobind-decorator';
import { PieDatumWithColor } from '@nivo/pie';

import { PieChart } from '../../pie-chart';
import { BlurLoader } from '../../blur-loader';

import { FraudScoreDistributionStore } from '../../../../view-services/dashboard';

import './score-distribution.scss';

interface ScoreDistributionComponentProps {
    fraudScoreDistributionStore: FraudScoreDistributionStore
}

const CN = 'score-distribution';

export class ScoreDistribution extends Component<ScoreDistributionComponentProps, never> {
    @autobind
    renderTooltip(datum: PieDatumWithColor) {
        const {
            id, color, value, label
        } = datum;

        return (
            <div key={id} className={`${CN}__tooltip`}>
                <div className={`${CN}-tooltip-bg`} style={{ background: color }} />
                <div className={`${CN}-tooltip-text`}>
                    <div>
                        Risk score
                        {' '}
                        {label}
                        :
                    </div>
                    <div>
                        orders:
                        {value}
                    </div>
                </div>
            </div>
        );
    }

    renderLegendItems() {
        const { fraudScoreDistributionStore: { riskScoreGroups } } = this.props;

        if (riskScoreGroups) {
            return riskScoreGroups
                .map(riskGroup => {
                    const { color, count, group: [startValue, endValue] } = riskGroup;

                    const countText = count > 1 ? 'orders' : 'order';

                    return (
                        <div className={`${CN}__legend-item`}>
                            <div className={`${CN}__legend-score-text`}>
                                <div
                                    className={`${CN}__legend-color-indicator`}
                                    style={{ background: color }}
                                />
                                <div className={`${CN}__legend-values`}>
                                    {startValue}
                                    -
                                    {endValue}
                                </div>
                            </div>
                            <div className={`${CN}__legend-count`}>
                                {count}
                                {' '}
                                {countText}
                            </div>
                        </div>
                    );
                });
        }

        return null;
    }

    renderNoDataMessage() {
        return (
            <div>Data is not available</div>
        );
    }

    render() {
        const {
            fraudScoreDistributionStore: {
                pieChartData,
                isScoreDistributionLoading
            }
        } = this.props;

        return (
            <div className={CN}>
                <div className={`${CN}__decision-pie-chart`}>
                    <BlurLoader
                        isLoading={isScoreDistributionLoading}
                        spinnerProps={{
                            label: 'Please, wait! Loading chart data ...'
                        }}
                    >
                        <PieChart
                            margin={{
                                top: 30, bottom: 30, left: 30, right: 30
                            }}
                            data={pieChartData}
                            className={`${CN}__pie-chart`}
                            enableRadialLabels={false}
                            innerText="Risk score distribution"
                        />
                    </BlurLoader>
                </div>
                <div className={`${CN}__legends`}>
                    {this.renderLegendItems()}
                </div>
            </div>
        );
    }
}
