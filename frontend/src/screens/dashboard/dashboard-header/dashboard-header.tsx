// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import autoBind from 'autobind-decorator';
import { observer } from 'mobx-react';
import cx from 'classnames';
import { resolve } from 'inversify-react';
import { History } from 'history';

import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IPersonaProps } from '@fluentui/react/lib/Persona';
import { ActionButton } from '@fluentui/react/lib/Button';

import { DashboardSearch } from './dashboard-search';

import { DATE_RANGE, DATE_RANGE_DAYS, DATE_RANGE_DISPLAY } from '../../../constants';
import { getFullHoursDate, getPastDate } from '../../../utils/date';
import { Queue } from '../../../models';
import { TYPES } from '../../../types';
import { DashboardScreenStore, QueuesPerformanceStore } from '../../../view-services';
import './dashboard-header.scss';

const CN = 'dashboard-header';

interface DateRange extends IDropdownOption {
    key: DATE_RANGE;
}

interface DashboardHeaderProps {
    /**
     * displayBackButton - shows or hide go back button depending
     * on the current visited page
     */
    displayBackButton?: boolean;
    dashboardScreenStore: DashboardScreenStore;
    /**
     * isSearchBarDisplayed - show/hide dashboard header search filed based on the user role
     */
    isSearchBarDisplayed?: boolean;

    onQueueSearchChange?(queue: Queue): void;

    onAnalystSearchChange?(analyst: IPersonaProps): void;

    /**
     * onGoBackClick - callback, on go back button click
     */
    onGoBackClick?(): void;

    /**
     * renderSearchBar - render or not the search bar
     */
    renderSearchBar?: boolean
}

interface DashboardHeaderState {
    selectedDropdownOptionKey: DATE_RANGE,
    fromDate: Date | undefined,
    toDate: Date | undefined,
}

// TODO: Move this component to the shared components as it is used in {PersonalPerformance, Dashboards} components
@observer
export class DashboardHeader extends Component<DashboardHeaderProps, DashboardHeaderState> {
    private maxDate: Date = new Date();

    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.QUEUES_PERFORMANCE_STORE)
    private queuesPerformanceStore!: QueuesPerformanceStore;

    private dropdownOptions: DateRange[] = [
        { key: DATE_RANGE.SIX_WEEKS, text: DATE_RANGE_DISPLAY[DATE_RANGE.SIX_WEEKS] },
        { key: DATE_RANGE.FOUR_WEEKS, text: DATE_RANGE_DISPLAY[DATE_RANGE.FOUR_WEEKS] },
        { key: DATE_RANGE.TWO_WEEKS, text: DATE_RANGE_DISPLAY[DATE_RANGE.TWO_WEEKS] },
        { key: DATE_RANGE.CUSTOM, text: DATE_RANGE_DISPLAY[DATE_RANGE.CUSTOM] },
    ];

    constructor(props: DashboardHeaderProps) {
        super(props);

        this.state = {
            selectedDropdownOptionKey: DATE_RANGE.SIX_WEEKS,
            fromDate: undefined,
            toDate: undefined
        };
    }

    static getPastDate(option: DATE_RANGE) {
        switch (option) {
            case DATE_RANGE.TWO_WEEKS:
                return getPastDate(DATE_RANGE_DAYS[DATE_RANGE.TWO_WEEKS]);
            case DATE_RANGE.FOUR_WEEKS:
                return getPastDate(DATE_RANGE_DAYS[DATE_RANGE.FOUR_WEEKS]);
            case DATE_RANGE.SIX_WEEKS:
                return getPastDate(DATE_RANGE_DAYS[DATE_RANGE.SIX_WEEKS]);
            case DATE_RANGE.CUSTOM:
                return undefined;
            default:
                return undefined;
        }
    }

    componentDidMount(): void {
        const { dashboardScreenStore } = this.props;

        const pastDate = getPastDate(DATE_RANGE_DAYS[DATE_RANGE.SIX_WEEKS]);
        const nowDate = getFullHoursDate(new Date());

        dashboardScreenStore.setFromDate(pastDate);
        dashboardScreenStore.setToDate(nowDate);
    }

    @autoBind
    getDatepickerValue(start?: boolean) {
        const { selectedDropdownOptionKey } = this.state;
        const nowDate = selectedDropdownOptionKey !== DATE_RANGE.CUSTOM
            ? getFullHoursDate(new Date())
            : undefined;

        if (start) {
            return DashboardHeader.getPastDate(selectedDropdownOptionKey);
        }

        return nowDate;
    }

    /**
     * This method clears dashboard store dates if user picks custom options from range
     * in order to prevent making redundant request, store determines itself
     * when both dates has been selected
     */
    clearDashboardStoreDates() {
        const { fromDate } = this.state;
        const { dashboardScreenStore } = this.props;

        if (!fromDate) {
            dashboardScreenStore.clearDates();
        }
    }

    @autoBind
    handleDropdownChange(option: IDropdownOption | undefined) {
        const { dashboardScreenStore } = this.props;

        if (option) {
            this.setState({ selectedDropdownOptionKey: option.key as DATE_RANGE });

            let fromDate: Date | undefined;
            let toDate: Date | undefined;

            const pastDate = DashboardHeader.getPastDate(option.key as DATE_RANGE);
            const nowDate = getFullHoursDate(new Date());

            dashboardScreenStore.clearDates();

            if (pastDate) {
                fromDate = pastDate;
                toDate = nowDate;

                dashboardScreenStore.setFromDate(pastDate);
                dashboardScreenStore.setToDate(nowDate);
            }

            this.setState({ fromDate, toDate });
        }
    }

    @autoBind
    handleStartDateSelection(date: Date | null | undefined) {
        const { dashboardScreenStore } = this.props;

        if (date) {
            this.setState({
                fromDate: date
            });

            dashboardScreenStore.setFromDate(date);
        }
    }

    /**
     * Disable date picker only when custom range selection is issued
     */
    isDatePickerDisabled() {
        const { selectedDropdownOptionKey } = this.state;

        return selectedDropdownOptionKey !== DATE_RANGE.CUSTOM;
    }

    @autoBind
    handleEndDateSelection(date: Date | null | undefined) {
        const { dashboardScreenStore } = this.props;

        if (date) {
            const fullHoursDate = getFullHoursDate(date);
            this.setState({
                toDate: fullHoursDate
            });

            dashboardScreenStore.setToDate(fullHoursDate);
        }
    }

    @autoBind
    renderGoBackButton() {
        const { onGoBackClick } = this.props;

        return (
            <ActionButton
                className={`${CN}__go-back-btn`}
                iconProps={{ iconName: 'ChevronLeftSmall', className: `${CN}__back-to-queues-btn-icon` }}
                onClick={onGoBackClick}
            >
                Go Back
            </ActionButton>
        );
    }

    render() {
        const {
            dashboardScreenStore, onQueueSearchChange, onAnalystSearchChange, displayBackButton, isSearchBarDisplayed, renderSearchBar
        } = this.props;
        const { fromDate, toDate } = this.state;
        return (

            <div className={cx(CN, { [`${CN}--aligned`]: renderSearchBar })}>
                {
                    renderSearchBar && (
                        <div className={cx(`${CN}__search`, { [`${CN}__search--hide`]: isSearchBarDisplayed })}>
                            {displayBackButton && this.renderGoBackButton()}
                            <DashboardSearch
                                onAnalystSearchChange={onAnalystSearchChange!}
                                onQueueSearchChange={onQueueSearchChange!}
                                dashboardScreenStore={dashboardScreenStore}
                            />
                        </div>
                    )
                }
                <div className={`${CN}__date-selection`}>
                    <Dropdown
                        onChange={(ev, option) => this.handleDropdownChange(option)}
                        className={`${CN}__dropdown`}
                        defaultSelectedKey={DATE_RANGE.SIX_WEEKS}
                        options={this.dropdownOptions}
                    />
                    <DatePicker
                        value={fromDate || this.getDatepickerValue(true)}
                        disabled={this.isDatePickerDisabled()}
                        className={`${CN}__date-picker`}
                        maxDate={toDate || this.maxDate}
                        placeholder="Select start date..."
                        ariaLabel="Select start date"
                        onSelectDate={this.handleStartDateSelection}
                    />
                    <DatePicker
                        value={toDate || this.getDatepickerValue()}
                        disabled={this.isDatePickerDisabled()}
                        className={`${CN}__date-picker`}
                        minDate={fromDate}
                        maxDate={this.maxDate}
                        placeholder="Select end date..."
                        ariaLabel="Select end date"
                        onSelectDate={this.handleEndDateSelection}
                    />
                </div>
            </div>
        );
    }
}
