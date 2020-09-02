import React from 'react';
import {
    ResponsivePie, PieDatum, PieSvgProps
} from '@nivo/pie';
import cx from 'classnames';

import './pie-chart.scss';
import { COLORS } from '../../../styles/variables';

interface PieChartProps {
    className?: string;
}

const CN = 'pie-chart';

export class PieChart extends React.Component<PieChartProps & PieSvgProps, never> {
    getRenderLabel(datum: PieDatum) {
        return `${datum.id} (${datum.percentage}%)`;
    }

    renderPieChartInnerText() {
        return (
            <div className={`${CN}__text-wrap`}>
                <div className={`${CN}__text`}>
                    All decisions for the period
                </div>
            </div>
        );
    }

    render() {
        const { data, className } = this.props;

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
                    radialLabelsLinkOffset={0}
                    radialLabelsLinkDiagonalLength={15}
                    radialLabelsLinkHorizontalLength={14}
                    radialLabelsLinkColor={COLORS.neutralLight}
                    startAngle={-180}
                    colors={(d: any) => d.color} // maps colors from datum to appropriate on the chart pieces
                    innerRadius={0.7}
                    radialLabel={datum => this.getRenderLabel(datum)}
                    radialLabelsTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                    data={data}
                    padAngle={1}
                    enableSlicesLabels={false}
                    margin={{
                        top: 40, bottom: 40, left: 20, right: 20
                    }}
                    defs={[
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
                    ]}
                    fill={[
                        {
                            match: {
                                id: 'Reject'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'Approve'
                            },
                            id: 'squares'
                        },
                    ]}
                />
                {data.length && this.renderPieChartInnerText()}
            </div>
        );
    }
}
