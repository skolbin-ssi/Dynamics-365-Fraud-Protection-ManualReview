// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './pie-chart.scss';

import cx from 'classnames';
import React from 'react';

import {
    PieDatum,
    PieSvgProps,
    ResponsivePie
} from '@nivo/pie';

import { COLORS } from '../../../styles/variables';

interface PieChartProps {
    className?: string;
    innerText?: string;
    enableLegends?: boolean;
}

const CN = 'pie-chart';

export class PieChart extends React.Component<PieChartProps & PieSvgProps, never> {
    private static getDefs() {
        return [
            {
                id: 'squares',
                type: 'patternSquares',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                size: 5,
                padding: 2,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 1,
                spacing: 6
            }
        ];
    }

    getRenderLabel(datum: PieDatum) {
        return `${datum.id} (${datum.percentage}%)`;
    }

    renderPieChartInnerText() {
        const { innerText } = this.props;

        return (
            <div className={`${CN}__text-wrap`}>
                <div className={`${CN}__text`}>
                    {innerText}
                </div>
            </div>
        );
    }

    renderLegends() {
        const { data } = this.props;

        return (
            <div className={`${CN}__legends`}>
                {
                    data.map(datum => (
                        <div className={`${CN}__legend`}>
                            <div
                                className={`${CN}__legend-indicator`}
                                style={{
                                    background: datum.color
                                }}
                            />
                            <div className={`${CN}__legend-label`}>
                                {datum.label}
                                {' '}
                                {`(${datum.percentage}%)`}
                            </div>
                        </div>
                    ))
                }
            </div>
        );
    }

    render() {
        const { data, className, enableLegends } = this.props;

        return (
            <div className={cx(CN, className)}>
                <ResponsivePie
                    theme={{
                        labels: {
                            text: {
                                fontSize: 12,
                                fontWeight: 'bold'
                            }
                        }
                    }}
                    radialLabelsSkipAngle={15}
                    radialLabelsLinkOffset={0}
                    radialLabelsLinkDiagonalLength={15}
                    radialLabelsLinkHorizontalLength={14}
                    radialLabelsLinkColor={COLORS.neutralLight}
                    startAngle={-180}
                    colors={(d: any) => d.color} // maps colors from datum to appropriate on the chart pieces
                    innerRadius={0.7}
                    radialLabelsTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                    isInteractive={false}
                    padAngle={1}
                    enableSlicesLabels={false}
                    margin={{
                        top: 25, bottom: 25, left: 35, right: 35
                    }}
                    fill={[
                        {
                            match: {
                                id: 'Bad'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'Good'
                            },
                            id: 'squares'
                        },
                    ]}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...this.props}
                />
                {!!data.length && this.renderPieChartInnerText()}
                {!!data.length && enableLegends && this.renderLegends()}
            </div>
        );
    }
}
