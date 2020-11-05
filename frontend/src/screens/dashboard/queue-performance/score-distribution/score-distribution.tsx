// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { ResponsiveBar, BarExtendedDatum } from '@nivo/bar';
import autobind from 'autobind-decorator';
import { BlurLoader } from '../../blur-loader';
import { QueueRiskScoreDistributionBarDatum } from '../../../../models/dashboard';
import {
    QUEUE_RISK_SCORE_CHART_DATUM_KEYS,
    QUEUE_RISK_SCORE_DISPLAY_CHART_KEYS_MAP,
    WARNING_MESSAGES
} from '../../../../constants';
import './score-distribution.scss';
import { getBarChartKeysAndColorsValues } from './get-bar-chart-keys-and-colors-values';
import { WarningChartMessage } from '../../warning-chart-message';
import { COLORS, GENERAL_COLORS } from '../../../../styles/variables';

interface ScoreDistributionComponentProps {
    data: QueueRiskScoreDistributionBarDatum[];
    isDataLoading: boolean;

    /**
     * isEmpty - Indicates if data is not available
     */
    isEmpty: boolean;
}

const CN = 'queue-score-distribution';

export class ScoreDistribution extends Component<ScoreDistributionComponentProps, never> {
    private static renderTooltipColorIndicator(color: string) {
        return (
            <div
                className={`${CN}__color-indicator`}
                style={{
                    background: color
                }}
            />
        );
    }

    private static renderChartLegends() {
        const { GOOD, BAD, WATCHED } = QUEUE_RISK_SCORE_DISPLAY_CHART_KEYS_MAP;
        const { demandSupplyCharts: { released } } = COLORS;
        const { badDark, goodDark } = GENERAL_COLORS;

        return (
            <div className={`${CN}__chart-legends`}>
                <div className={`${CN}__chart-legend`}>
                    <div className={`${CN}__chart-legend-good`}>
                        <div className={`${CN}__chart-legend-indicator`} style={{ background: GOOD.color }} />
                        <div className={`${CN}__chart-legend-label`} style={{ color: goodDark }}>{GOOD.label}</div>
                    </div>
                    <div className={`${CN}__chart-legend-watched`}>
                        <div className={`${CN}__chart-legend-indicator`} style={{ background: WATCHED.color }} />
                        <div className={`${CN}__chart-legend-label`} style={{ color: released }}>{WATCHED.label}</div>
                    </div>
                    <div className={`${CN}__chart-legend-bad`}>
                        <div className={`${CN}__chart-legend-indicator`} style={{ background: BAD.color }} />
                        <div className={`${CN}__chart-legend-label`} style={{ color: badDark }}>{BAD.label}</div>
                    </div>
                </div>
            </div>
        );
    }

    private static rotateTicksValues(data: QueueRiskScoreDistributionBarDatum[]) {
        const DEFAULT_TICKS_ROTATION_DEGREE = 0;
        const ROTATE_TICKS_DEGREE = 35;
        const BAR_THRESHOLD_COUNT = 6;

        if (data.length < BAR_THRESHOLD_COUNT) {
            return DEFAULT_TICKS_ROTATION_DEGREE;
        }

        return ROTATE_TICKS_DEGREE;
    }

    private static renderNoDataMessage() {
        return (
            <WarningChartMessage
                className={`${CN}__warning-message`}
                message={WARNING_MESSAGES.METRICS.NO_METRICS_MESSAGE}
            />
        );
    }

    @autobind
    renderTooltip(barDatum: BarExtendedDatum) {
        const {
            data: {
                scoreDistributionRange,
                good,
                bad,
                watched
            }
        } = barDatum as BarExtendedDatum & { data: QueueRiskScoreDistributionBarDatum };
        const { GOOD, BAD, WATCHED } = QUEUE_RISK_SCORE_DISPLAY_CHART_KEYS_MAP;
        const { neutralPrimary } = COLORS;

        return (
            <div className={`${CN}__tooltip`}>
                <div className={`${CN}__tooltip-content`}>
                    <div className={`${CN}__tooltip-header`}>
                        <strong style={{ color: neutralPrimary }}>
                            Risk score:
                            {' '}
                            {scoreDistributionRange}
                        </strong>
                    </div>
                    <div className={`${CN}__tooltip-content`}>
                        <div className={`${CN}__tooltip-row`}>
                            {ScoreDistribution.renderTooltipColorIndicator(GOOD.color)}
                            <div>{GOOD.label}</div>
                            <div className={`${CN}__tooltip-value`}>{good}</div>
                        </div>
                        <div className={`${CN}__tooltip-row`}>
                            {ScoreDistribution.renderTooltipColorIndicator(WATCHED.color)}
                            <div>{WATCHED.label}</div>
                            <div className={`${CN}__tooltip-value`}>{watched}</div>
                        </div>
                        <div className={`${CN}__tooltip-row`}>
                            {ScoreDistribution.renderTooltipColorIndicator(BAD.color)}
                            <div>{BAD.label}</div>
                            <div className={`${CN}__tooltip-value`}>{bad}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { data, isDataLoading, isEmpty } = this.props;
        const { keys, colors } = getBarChartKeysAndColorsValues(data);

        return (
            <div className={CN}>
                <div className={`${CN}__header`}>
                    <div className={`${CN}__header-title`}>Risk score distribution</div>
                </div>
                {ScoreDistribution.renderChartLegends()}
                <div className={`${CN}__chart-container`}>
                    <BlurLoader
                        isLoading={isDataLoading}
                        spinnerProps={{
                            label: 'Please, wait! Loading chart data ...'
                        }}
                    >
                        <ResponsiveBar
                            tooltip={this.renderTooltip}
                            indexBy={QUEUE_RISK_SCORE_CHART_DATUM_KEYS.SCORE_DISTRIBUTION_RANGE}
                            data={data}
                            colors={colors}
                            keys={keys}
                            padding={0.2}
                            margin={{
                                top: 10,
                                bottom: 80,
                                left: 40,
                                right: 40
                            }}
                            enableGridX
                            enableGridY
                            axisLeft={{
                                tickPadding: 10,
                                tickSize: 0,
                                // showing only those values that are not float, and have no float point
                                format: (tickValue: any) => Math.floor(tickValue) === tickValue && tickValue,
                                tickValues: 5
                            }}
                            axisBottom={{
                                tickPadding: 15,
                                tickRotation: ScoreDistribution.rotateTicksValues(data || []),
                            }}
                            enableLabel={false}
                            theme={{
                                tooltip: {
                                    container: {
                                        minWidth: 220,
                                        padding: 16,
                                        background: 'white',
                                        boxShadow: '0 6.4px 14.4px rgba(0, 0, 0, 0.13),0 1.2px 3.6px rgba(0, 0, 0, 0.1)',
                                        borderRadius: 2
                                    }
                                }
                            }}
                            isInteractive
                        />
                    </BlurLoader>
                    {isEmpty && !isDataLoading && ScoreDistribution.renderNoDataMessage()}
                </div>
            </div>
        );
    }
}
