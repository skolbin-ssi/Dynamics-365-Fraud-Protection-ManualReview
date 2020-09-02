import React from 'react';

import cx from 'classnames';
import { ResponsiveBar, BarSvgProps } from '@nivo/bar';
import { COLORS } from '../../../styles/variables';
import { WarningChartMessage } from '../warning-chart-message';

import './bar-chart.scss';

interface BarChartProps extends BarSvgProps {
    className?: string;
    isDataLoading?: boolean;
    noSelectedItemsWarningMessage?: string;
    noDataWarningMessage?: string;

    /**
     * hasSelectedItems - indicates whether user selected at least one item in
     * table, to display data on the chart, otherwise no selected items message will
     * be displayed
     */
    hasSelectedItems?: boolean

    /**
     * hasData - indicates whether itself store has a data [store data].length is
     * greater the 0
     */
    hasData?: boolean
}

const CN = 'bar-chart';

export class BarChart extends React.Component<BarChartProps, never> {
    getPadding() {
        const { data } = this.props;
        if (data.length < 5) {
            return 0.9;
        }

        return 0.65;
    }

    renderNoDataWarningMessage() {
        const { isDataLoading, hasData, noDataWarningMessage } = this.props;

        if (!hasData && !isDataLoading && noDataWarningMessage) {
            return (
                <WarningChartMessage
                    className={`${CN}__no-data-warning-message`}
                    message={noDataWarningMessage}
                />
            );
        }

        return null;
    }

    renderNoSelectedItemsWarningMessage() {
        const {
            isDataLoading, noSelectedItemsWarningMessage, hasSelectedItems, hasData
        } = this.props;

        const hasDataNoSelected = (hasData && !hasSelectedItems);

        if (hasDataNoSelected && !isDataLoading && noSelectedItemsWarningMessage) {
            return (
                <WarningChartMessage
                    className={`${CN}__no-selected-items-warning-message`}
                    message={noSelectedItemsWarningMessage}
                />
            );
        }

        return null;
    }

    render() {
        const { className } = this.props;

        return (
            <div className={cx(CN, className)}>
                <ResponsiveBar
                    indexBy="key"
                    padding={this.getPadding()}
                    enableGridX
                    enableGridY
                    margin={{
                        top: 40, right: 50, bottom: 40, left: 40
                    }}
                    axisRight={{
                        tickSize: 5, tickPadding: 5, tickRotation: 0, legend: '', legendOffset: 0, format: v => `${v}%`
                    }}
                    axisLeft={null}
                    minValue={-100}
                    maxValue={100}
                    keys={['approveMatched', 'approveUnmatched', 'rejectMatched', 'rejectUnmatched']}
                    colors={[
                        COLORS.barChart.approveMatched,
                        COLORS.barChart.approvedUnmatched,
                        COLORS.barChart.rejectMatched,
                        COLORS.barChart.rejectUnmatched
                    ]}
                    labelFormat={v => `${v}%`}
                    label={d => `${Math.abs(+d.value)}`}
                    animate
                    isInteractive={false}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...this.props}
                />
                <div className={`${CN}__approve-label`}>Approve</div>
                <div className={`${CN}__reject-label`}>Reject</div>
                <div className={`${CN}__top-legend`}>
                    <div>
                        <div className={`${CN}__overturned-approve-indicator`} />
                        <span className={`${CN}__overturned-approve-text`}>Overturned action (Approve)</span>
                    </div>
                    <div>
                        <div className={`${CN}__overturned-reject-indicator`} />
                        <span className={`${CN}__overturned-reject-text`}>Overturned action (Reject)</span>
                    </div>
                </div>
                {this.renderNoDataWarningMessage()}
                {this.renderNoSelectedItemsWarningMessage()}
                <div className={`${CN}__baseline`} />
            </div>
        );
    }
}
