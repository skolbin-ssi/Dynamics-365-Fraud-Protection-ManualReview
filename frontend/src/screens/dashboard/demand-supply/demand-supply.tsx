// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import autoBind from 'autobind-decorator';
import { resolve } from 'inversify-react';
import { History } from 'history';
import { observer, disposeOnUnmount } from 'mobx-react';
import cx from 'classnames';

import { SliceTooltipProps } from '@nivo/line';
import { Text } from '@fluentui/react/lib/Text';
import { ShimmeredDetailsList } from '@fluentui/react/lib/ShimmeredDetailsList';
import { DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { Facepile, IFacepilePersona, OverflowButtonType } from '@fluentui/react/lib/Facepile';
import { PersonaSize } from '@fluentui/react/lib/Persona';
import { DefaultButton } from '@fluentui/react/lib/Button';

import { SwitchHeader as AggregationHeader } from '../switch-header';
import { LineChart, SliceTooltip } from '../line-chart';

import {
    DashboardDemandSupplyScreenStore,
    DemandSupplyDashboardTableItemData
} from '../../../view-services/dashboard/dashboard-demand-supply-screen-store';
import { TYPES } from '../../../types';

import {
    CHART_AGGREGATION_PERIOD,
    CHART_AGGREGATION_PERIOD_DISPLAY, ROUTES,
} from '../../../constants';
import { BlurLoader } from '../blur-loader';
import { ReportsModalStore } from '../../../view-services';

import './demand-supply.scss';

const CN = 'demand-supply-dashboard';

const MAX_SUPERVISORS_TO_SHOW = 3;
const MAX_REVIEWERS_TO_SHOW = 3;

interface DemandSupplyProps extends RouteComponentProps {}

@observer
export class DemandSupply extends Component<DemandSupplyProps, never> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.DASHBOARD_DEMAND_SUPPLY_SCREEN_STORE)
    private dashboardDemandSupplyScreenStore!: DashboardDemandSupplyScreenStore;

    @resolve(TYPES.REPORTS_MODAL_STORE)
    private reportsModalStore!: ReportsModalStore;

    private readonly columns: IColumn[] = [
        {
            key: 'queueName',
            name: 'Queue',
            minWidth: 50,
            maxWidth: 600,
            onRender: ({ queueName, queueId }) => (
                <div className={`${CN}__queue-name-cell`}>
                    <button type="button" className={`${CN}__go-to-queue-db-btn`} onClick={() => this.goToQueueDashboard(queueId)}>
                        <Text variant="medium" className={`${CN}__score-cell`}>
                            {queueName}
                        </Text>
                    </button>
                </div>
            ),
        },
        {
            key: 'remaining',
            name: 'Remaining',
            minWidth: 100,
            maxWidth: 100,
            headerClassName: `${CN}__data-header-cell`,
            onRender: ({ remaining }) => (
                <div className={`${CN}__data-cell`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {remaining >= 0 ? remaining : 'N/A'}
                    </Text>
                </div>
            ),
        },
        {
            key: 'newOrders',
            name: 'New orders',
            minWidth: 100,
            maxWidth: 100,
            headerClassName: `${CN}__data-header-cell`,
            onRender: ({ newOrders }) => (
                <div className={`${CN}__data-cell`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {newOrders}
                    </Text>
                </div>
            ),
        },
        {
            key: 'reviewed',
            name: 'Reviewed',
            minWidth: 100,
            maxWidth: 100,
            headerClassName: `${CN}__data-header-cell`,
            onRender: ({ reviewed }) => (
                <div className={`${CN}__data-cell`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {reviewed}
                    </Text>
                </div>
            ),
        },
        {
            key: 'nearToSlaCount',
            name: 'Near to SLA',
            minWidth: 100,
            maxWidth: 100,
            headerClassName: `${CN}__data-header-cell`,
            onRender: ({ nearToSlaCount }) => (
                <div className={`${CN}__data-cell`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {nearToSlaCount >= 0 ? nearToSlaCount : 'N/A'}
                    </Text>
                </div>
            ),
        },
        {
            key: 'nearToTimeout',
            name: 'Near to timeout',
            minWidth: 120,
            maxWidth: 120,
            headerClassName: `${CN}__data-header-cell`,
            onRender: ({ nearToTimeoutCount }) => (
                <div className={`${CN}__data-cell`}>
                    <Text variant="medium" className={`${CN}__score-cell`}>
                        {nearToTimeoutCount >= 0 ? nearToTimeoutCount : 'N/A'}
                    </Text>
                </div>
            ),
        },
        {
            key: 'analysts',
            name: 'Analysts',
            minWidth: 200,
            maxWidth: 300,
            headerClassName: `${CN}__analysts-header-cell`,
            className: `${CN}__analysts-col`,
            onRender: ({ queue }: DemandSupplyDashboardTableItemData) => {
                const showDivider = queue
                    && !!queue.supervisorsFacepilePersonas.length
                    && !!queue.reviewersFacepilePersonas.length;

                return queue && (
                    <div className={`${CN}__faces-wrapper`}>
                        {this.renderFaces(queue.supervisorsFacepilePersonas, MAX_SUPERVISORS_TO_SHOW, true)}
                        { showDivider && (<div className={`${CN}__faces-wrapper-divider`} />) }
                        {this.renderFaces(queue.reviewersFacepilePersonas, MAX_REVIEWERS_TO_SHOW)}
                    </div>
                );
            },
        }
    ];

    componentDidMount() {
        disposeOnUnmount(this, this.dashboardDemandSupplyScreenStore.loadData());
    }

    goToQueueDashboard(queueId: string) {
        this.history.push(
            ROUTES.build.dashboard.demandByQueue(queueId)
        );
    }

    @autoBind
    handleAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        this.dashboardDemandSupplyScreenStore.setAggregationPeriod(label);
    }

    @autoBind
    handleGenerateReportsButtonClick() {
        const { reports } = this.dashboardDemandSupplyScreenStore;

        this.reportsModalStore.showReportsModal(reports);
    }

    @autoBind
    renderTotalReviewedNewChart() {
        const {
            itemPlacementMetricsOverallChartData,
            isItemPlacementMetricsOverallLoading,
            totalLineChartMaxYTick,
        } = this.dashboardDemandSupplyScreenStore;

        return (
            <BlurLoader
                isLoading={isItemPlacementMetricsOverallLoading}
                spinnerProps={{
                    label: 'Please, wait! Loading chart data ...'
                }}
            >
                <LineChart
                    isLoading={isItemPlacementMetricsOverallLoading}
                    maxYTicksValue={totalLineChartMaxYTick}
                    data={itemPlacementMetricsOverallChartData}
                    enableArea={false}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    sliceTooltip={(props: SliceTooltipProps) => <SliceTooltip {...props} />}
                    legends={[
                        {
                            anchor: 'top-left',
                            direction: 'row',
                            justify: false,
                            translateX: 30,
                            translateY: -30,
                            itemsSpacing: 10,
                            itemDirection: 'left-to-right',
                            itemWidth: 80,
                            itemHeight: 20,
                            itemOpacity: 0.75,
                            symbolSize: 14,
                            symbolShape: 'circle',
                            symbolBorderColor: 'rgba(0, 0, 0, .5)'
                        }
                    ]}
                />
            </BlurLoader>
        );
    }

    @autoBind
    renderRemainingOrdersChart() {
        const {
            queueSizeHistoryOverallChartData,
            remainingLineChartMaxYTick,
            isQueueSizeHistoryOverallLoading,
        } = this.dashboardDemandSupplyScreenStore;

        return (
            <>
                <Text variant="large" className={`${CN}__additional-title`}>Total remaining orders</Text>
                <LineChart
                    isLoading={isQueueSizeHistoryOverallLoading}
                    maxYTicksValue={remainingLineChartMaxYTick}
                    data={queueSizeHistoryOverallChartData}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    sliceTooltip={(props: SliceTooltipProps) => <SliceTooltip {...props} />}
                    enableArea
                />
            </>
        );
    }

    @autoBind
    renderQueueList() {
        const { demandSupplyDashboardTableData } = this.dashboardDemandSupplyScreenStore;

        return (
            <ShimmeredDetailsList
                enableShimmer={!demandSupplyDashboardTableData}
                layoutMode={DetailsListLayoutMode.justified}
                className={`${CN}__table`}
                selectionMode={SelectionMode.none}
                columns={this.columns}
                items={demandSupplyDashboardTableData || []}
                shimmerLines={5}
            />
        );
    }

    @autoBind
    renderFaces(persons: IFacepilePersona[], maxToShow: number, supervisors: boolean = false) {
        return (
            <Facepile
                className={cx(`${CN}__faces`, supervisors && `${CN}__faces--supervisors`)}
                personaSize={PersonaSize.size24}
                personas={persons.slice(0, maxToShow)}
                overflowPersonas={persons.slice(maxToShow)}
                overflowButtonType={OverflowButtonType.descriptive}
                getPersonaProps={() => ({ hidePersonaDetails: true })}
                overflowButtonProps={{
                    styles: { root: { cursor: 'default' } }
                }}
            />
        );
    }

    renderGenerateReportButton() {
        return (
            <DefaultButton
                className={`${CN}__generate-reports-button`}
                text="Generate reports"
                onClick={this.handleGenerateReportsButtonClick}
            />
        );
    }

    render() {
        const { aggregation } = this.dashboardDemandSupplyScreenStore;

        return (
            <div className={CN}>
                {this.renderGenerateReportButton()}
                <AggregationHeader
                    <CHART_AGGREGATION_PERIOD>
                    activeTab={aggregation}
                    className={`${CN}__aggregation-header`}
                    title="Total reviewed / New"
                    viewSwitchName="View:"
                    onViewChange={this.handleAggregationChange}
                    viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                />
                { this.renderTotalReviewedNewChart() }
                { this.renderRemainingOrdersChart() }
                { this.renderQueueList() }
            </div>
        );
    }
}
