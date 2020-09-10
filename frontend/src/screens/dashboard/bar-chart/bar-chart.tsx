import React from 'react';
import cx from 'classnames';
import autobind from 'autobind-decorator';

import { BarExtendedDatum, BarSvgProps, ResponsiveBar, } from '@nivo/bar';

import { WarningChartMessage } from '../warning-chart-message';
import { AccuracyChartDatum } from '../../../view-services/dashboard/base-overturned-performance-store';
import { formatDateToFullMonthDayYear } from '../../../utils/date';
import {
    OVERTURNED_ACTIONS_DISPLAY_NAMES,
    OVERTURNED_CHART_DATUM_KEYS,
    OVERTURNED_CHART_KEYS,
    OVERTURNED_LABELS_TO_OVERTURNED_CHART_KEYS_COLORS
} from '../../../constants';

import './bar-chart.scss';

import { generateTicksValues } from './generate-ticks-values';

interface OverturnedChartDatumAccumulator {
    approveUnmatched: number, approveMatched: number, rejectMatched: number, rejectUnmatched: number
}

/**
 * Returns dynamically calculated keys and colors for the responsive bar chart
 *
 * This function is intentionally create in order to resolve the issue when some of the datum points
 * has 0, nullish values if that is that case, then some of the provided colors under color property
 * of Responsive bar whould be shifted in unpredictable orders, and it brakes representation of actual
 * data to be displayed on the dashboard, thus such solution will aim to avoid such issue
 *
 * For more details please refer:
 * @see https://github.com/plouc/nivo/issues/952
 * @see https://github.com/plouc/nivo/issues/952#issuecomment-688245940
 * @see https://github.com/plouc/nivo/issues/986
 * @see https://github.com/plouc/nivo/issues/1031
 *
 * @returns Object<{ colors, keys }>  -  colors - array of colors representing in a string, keys - array of keys
 */
function getBarChartKeysAndColorsValues(data: AccuracyChartDatum[]) {
    const keys: string[] = [];
    const colors: string[] = [];

    // order of the keys must be in the defined order for the representation
    const dataSum: OverturnedChartDatumAccumulator = data.reduce((acc, next) => ({
        approveMatched: acc.approveMatched + Math.abs(next.approveMatched),
        approveUnmatched: acc.approveUnmatched + Math.abs(next.approveUnmatched),
        rejectMatched: acc.rejectMatched + Math.abs(next.rejectMatched),
        rejectUnmatched: acc.rejectUnmatched + Math.abs(next.rejectUnmatched),

    }), {
        approveUnmatched: 0, approveMatched: 0, rejectMatched: 0, rejectUnmatched: 0
    });

    Object.keys(dataSum).forEach(key => {
        const value = dataSum[key as keyof OverturnedChartDatumAccumulator];

        // filter keys if every decision exists (approveUnmatched, approveMatched, rejectMatched, rejectUnmatched)
        // total sum is greater then 0
        if (value > 0) {
            const overturnedChartDatumKey = OVERTURNED_CHART_DATUM_KEYS[key as keyof OverturnedChartDatumAccumulator];
            const { color, label } = OVERTURNED_LABELS_TO_OVERTURNED_CHART_KEYS_COLORS.get(overturnedChartDatumKey)!;
            keys.push(label);
            colors.push(color);
        }
    });

    return {
        keys, colors
    };
}

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
    static getLabels() {
        const approve = OVERTURNED_ACTIONS_DISPLAY_NAMES[OVERTURNED_CHART_KEYS.APPROVED_MATCHED];
        const approveOverturned = OVERTURNED_ACTIONS_DISPLAY_NAMES[OVERTURNED_CHART_KEYS.APPROVED_UNMATCHED];
        const reject = OVERTURNED_ACTIONS_DISPLAY_NAMES[OVERTURNED_CHART_KEYS.REJECTED_MATCHED];
        const rejectOverturned = OVERTURNED_ACTIONS_DISPLAY_NAMES[OVERTURNED_CHART_KEYS.REJECTED_UNMATCHED];

        return {
            approve,
            approveOverturned,
            reject,
            rejectOverturned
        };
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

    renderTooltipColorIndicator(color: string) {
        return (
            <div
                className={`${CN}__color-indicator`}
                style={{
                    background: color
                }}
            />
        );
    }

    renderTopLegends() {
        const {
            approve,
            approveOverturned,
            reject,
            rejectOverturned
        } = BarChart.getLabels();

        return (
            <div className={`${CN}__top-legend`}>
                <div>
                    <div style={{ background: approve.color }} className={`${CN}__legend-color-indicator`} />
                    <div
                        style={{ color: approve.color, filter: 'brightness(0.9)' }}
                        className={`${CN}__legend-label-text`}
                    >
                        {approve.label}
                    </div>
                </div>
                <div>
                    <div style={{ background: reject.color }} className={`${CN}__legend-color-indicator`} />
                    <div
                        style={{ color: reject.color, filter: 'brightness(0.9)' }}
                        className={`${CN}__legend-label-text`}
                    >
                        {reject.label}
                    </div>
                </div>
                <div>
                    <div style={{ background: approveOverturned.color }} className={`${CN}__legend-color-indicator`} />
                    <div
                        style={{ color: approve.color }}
                        className={`${CN}__legend-label-text`}
                    >
                        {approveOverturned.label}
                    </div>
                </div>
                <div>
                    <div style={{ background: rejectOverturned.color }} className={`${CN}__legend-color-indicator`} />
                    <div
                        style={{ color: reject.color }}
                        className={`${CN}__legend-label-text`}
                    >
                        {rejectOverturned.label}
                    </div>
                </div>
            </div>
        );
    }

    @autobind
    renderTooltip(extendedDatum: BarExtendedDatum) {
        const formatValue = (value: number) => `${Math.abs(value)}%`;
        const {
            id,
            data: {
                originalDate,
                approveUnmatched,
                approveMatched,
                rejectMatched,
                rejectUnmatched
            }
        } = extendedDatum as unknown as { data: AccuracyChartDatum } & BarExtendedDatum;
        const {
            approve,
            approveOverturned,
            reject,
            rejectOverturned
        } = BarChart.getLabels();

        return (
            <div className={`${CN}__tooltip`} key={id}>
                <div className={`${CN}__tooltip-header`}>
                    <strong>{formatDateToFullMonthDayYear(new Date(originalDate))}</strong>
                </div>
                <div className={`${CN}__tooltip-content`}>
                    <div className={`${CN}__tooltip-row`}>
                        {this.renderTooltipColorIndicator(approveOverturned.color)}
                        <div>{approveOverturned.label}</div>
                        <div className={`${CN}__tooltip-value`}>{formatValue(approveUnmatched)}</div>
                    </div>
                    <div className={`${CN}__tooltip-row`}>
                        {this.renderTooltipColorIndicator(approve.color)}
                        <div>{approve.label}</div>
                        <div className={`${CN}__tooltip-value`}>{formatValue(approveMatched)}</div>
                    </div>
                    <div className={`${CN}__tooltip-row`}>
                        {this.renderTooltipColorIndicator(reject.color)}
                        <div>{reject.label}</div>
                        <div className={`${CN}__tooltip-value`}>{formatValue(rejectMatched)}</div>
                    </div>
                    <div className={`${CN}__tooltip-row`}>
                        {this.renderTooltipColorIndicator(rejectOverturned.color)}
                        <div>{rejectOverturned.label}</div>
                        <div className={`${CN}__tooltip-value`}>{formatValue(rejectUnmatched)}</div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { className, data } = this.props;
        const { keys, colors } = getBarChartKeysAndColorsValues(data as AccuracyChartDatum[]);

        return (
            <div className={cx(CN, className)}>
                <ResponsiveBar
                    tooltip={this.renderTooltip}
                    indexBy="key"
                    padding={0.2}
                    labelSkipWidth={32}
                    labelSkipHeight={14}
                    enableGridX
                    enableGridY
                    margin={{
                        top: 40, right: 50, bottom: 40, left: 40
                    }}
                    axisRight={{
                        tickSize: 5, tickPadding: 5, tickRotation: 0, legend: '', legendOffset: 0, format: v => `${v}%`
                    }}
                    axisLeft={null}
                    axisBottom={{
                        tickValues: generateTicksValues(data as AccuracyChartDatum[])
                    }}
                    minValue={-100}
                    maxValue={100}
                    keys={keys}
                    colors={colors}
                    labelFormat={v => `${v}%`}
                    label={d => `${Math.abs(+d.value)}`}
                    animate
                    isInteractive
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...this.props}
                    theme={{
                        tooltip: {
                            container: {
                                minWidth: 280,
                                padding: 16,
                                background: 'white',
                                boxShadow: '0 6.4px 14.4px rgba(0, 0, 0, 0.13),0 1.2px 3.6px rgba(0, 0, 0, 0.1)',
                                borderRadius: 2
                            }
                        }
                    }}
                />
                <div className={`${CN}__approve-label`}>GOOD</div>
                <div className={`${CN}__reject-label`}>BAD</div>
                {this.renderTopLegends()}
                {this.renderNoDataWarningMessage()}
                {this.renderNoSelectedItemsWarningMessage()}
                <div className={`${CN}__baseline`} />
            </div>
        );
    }
}
