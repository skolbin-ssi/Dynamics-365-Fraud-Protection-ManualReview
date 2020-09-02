import { inject, injectable } from 'inversify';
import {
    action, autorun, computed, IReactionDisposer, observable, reaction
} from 'mobx';

import { Datum } from '@nivo/line';

import {
    CHART_AGGREGATION_PERIOD,
    PERFORMANCE_RATING,
    PERFORMANCE_RATING_TO_NUMBER,
    STATISTIC_AGGREGATION
} from '../../constants';
import { BasicEntityPerformance } from '../../models/dashboard';
import { TYPES } from '../../types';
import { DashboardScreenStore } from './dashboard-screen-store';
import { excludeLocalTimeZoneDiff, getDatesBetween, isoStringToDateString } from '../../utils/date';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { convertToCSVString, UnparseTypes } from '../../utility-services/convert-service';
import { Report } from '../../models/misc';
import { formatMetricToPercentageString } from '../../utils/text';
import { CSVReportBuilder } from '../../utility-services';

export interface UpdateQuerySearchReactionParams {
    /**
     * ids - selected ids
     */
    ids: string[],

    /**
     * rating - selected rating {PERFORMANCE_RATING}
     */
    rating: string,

    aggregation: string,
}

@injectable()
export class BasePerformanceStore<T extends BasicEntityPerformance> {
    @observable isDataLoading = false;

    @observable rating: PERFORMANCE_RATING = PERFORMANCE_RATING.THREE;

    @observable performanceData: T[] | null = null;

    @observable urlSelectedIds: string[] = [];

    @observable
    protected CSVReportBuilder = new CSVReportBuilder();

    /**
     * aggregation - indicates by what time period to aggregate queue performance statistics
     * @default {DAY}
     */
    @observable aggregation: CHART_AGGREGATION_PERIOD = CHART_AGGREGATION_PERIOD.DAY;

    fromDate: Date | null = null;

    toDate: Date | null = null;

    @inject(TYPES.DASHBOARD_SCREEN_STORE)
    protected dashboardScreenStore!: DashboardScreenStore;

    /**
     * Compare this time range (from & to) with the new chosen time range
     * if the new time range has been chosen, clears current performance data selection (urlSelectedIds)
     */
    @action
    checkIfDatesRangeChanged() {
        const toDate = this.toDate && this.toDate.getTime();
        const fromDate = this.fromDate && this.fromDate.getTime();

        const dashboardToDate = this.dashboardScreenStore.toDate && this.dashboardScreenStore.toDate.getTime();
        const dashboardFromDate = this.dashboardScreenStore.fromDate && this.dashboardScreenStore.fromDate.getTime();

        if ((!toDate) || (!fromDate)) {
            return;
        }

        if ((toDate !== dashboardToDate) || (fromDate !== dashboardFromDate)) {
            this.setUrlSelectedIds([]);
        }
    }

    @action
    loadDataGeneric(callback: (params: DashboardRequestApiParams) => Promise<T[] | null>): IReactionDisposer {
        return autorun(async () => {
            this.checkIfDatesRangeChanged();

            this.toDate = this.dashboardScreenStore.getToDate;
            this.fromDate = this.dashboardScreenStore.getFromDate;

            const { toDate } = this;
            const { fromDate } = this;
            const aggregation = STATISTIC_AGGREGATION.get(this.aggregation)!;

            if (toDate && fromDate) {
                const from = excludeLocalTimeZoneDiff(fromDate);
                const to = excludeLocalTimeZoneDiff(toDate);

                const data = await callback({ from, to, aggregation });

                if (data && this.urlSelectedIds.length) {
                    this.performanceData = this.setSelectedIds(data, this.urlSelectedIds);
                } else if (data) {
                    this.clearUrlSelectedIds();
                    this.performanceData = this.setSelection(data, this.rating);
                }
            }
        });
    }

    /**
     * Watches of changes in urlSelectedIds array, selected rating, and aggregated when a new item is added or removed it will fire
     * url updates in the current page (a.k.a route) by replacing the history. Synchronize search query string
     * in the route with the appropriate observables selected items form the store.
     */
    @action
    updateUrlParams(callback: (obj: UpdateQuerySearchReactionParams) => void) {
        return reaction(() => ({
            ids: this.urlSelectedIds,
            rating: this.rating,
            aggregation: this.aggregation,
        }), callback);
    }

    @action
    setSelectedIds(data: T[] | null, ids: string[]) {
        if (data) {
            return data.map(item => {
                if (ids.includes(item.id)) {
                    item.setIsChecked(true);
                    return item;
                }

                return item;
            });
        }

        return null;
    }

    /**
     * Slice data by chunks depending on rating count to show
     * e.g.: 10,5,3 or All
     */
    @computed
    get getPerformanceData() {
        const quantity = PERFORMANCE_RATING_TO_NUMBER.get(this.rating);

        if (this.performanceData) {
            return this.performanceData.slice(0, quantity);
        }

        return [];
    }

    @action
    setChecked(queueId: string) {
        if (this.performanceData) {
            this.performanceData = this.performanceData.map(item => {
                if (item.id === queueId) {
                    if (item.isChecked) {
                        item.setIsChecked(false);
                        this.removeSelectedId(item.id);
                        return item;
                    }

                    item.setIsChecked(true);
                    this.addSelectedIds(item.id);
                    return item;
                }

                return item;
            });
        }
    }

    @action
    setRating(rating: PERFORMANCE_RATING) {
        this.rating = rating;

        if (this.performanceData) {
            this.performanceData = this.setSelection(this.performanceData, this.rating);
        }
    }

    @action
    setSelection(performanceData: T[] | null, rating: PERFORMANCE_RATING): T[] | null {
        let selectionLimit = PERFORMANCE_RATING_TO_NUMBER.get(rating)!;

        if (rating === PERFORMANCE_RATING.ALL) {
            selectionLimit = 10;
        }

        if (performanceData) {
            return performanceData.map((item, index) => {
                if (index < selectionLimit) {
                    item.setIsChecked(true);

                    if (!this.urlSelectedIds.includes(item.id)) {
                        this.addSelectedIds(item.id);
                    }

                    return item;
                }

                item.setIsChecked(false);
                this.removeSelectedId(item.id);

                return item;
            });
        }

        return null;
    }

    @action
    setUrlSelectedIds(ids: string[]) {
        this.urlSelectedIds = ids;
    }

    /**
     * Checks weather at least one item is form the performance items is selected
     */
    @computed
    get hasSelectedItems() {
        if (this.performanceData) {
            return this.performanceData.some(analyst => analyst.isChecked);
        }

        return false;
    }

    /**
     * Checks weather performance data has loaded
     */
    @computed
    get hasStorePerformanceData() {
        if (this.performanceData) {
            return !!this.performanceData.length;
        }

        return false;
    }

    // TODO: Confirm if the substitution chart data is required to be displayed
    //  in case when data for requested period (from, to) is not available
    @computed
    protected get getSubstitutionLineChartData() {
        if (this.performanceData && !this.performanceData.length) {
            return [{
                id: '',
                data: this.getSubstitutionLineChartDatum as Datum[],
                color: ''
            }];
        }

        return [];
    }

    @computed
    private get getSubstitutionLineChartDatum() {
        if (this.dashboardScreenStore.fromDate && this.dashboardScreenStore.toDate) {
            const substitutionDates: Date[] = getDatesBetween(
                this.dashboardScreenStore.fromDate,
                this.dashboardScreenStore.toDate,
                this.aggregation
            );

            return substitutionDates.map((date: Date) => ({
                y: 0,
                x: isoStringToDateString(date.toISOString()),
            }));
        }

        return [] as Datum[];
    }

    /**
     * Add selected id to the urlSelectedIds array
     * @param id
     */
    @action
    private addSelectedIds(id: string) {
        this.setUrlSelectedIds([...this.urlSelectedIds, id]);
    }

    @action
    private removeSelectedId(id: string) {
        this.setUrlSelectedIds(this.urlSelectedIds.filter(selectedId => selectedId !== id));
    }

    @action
    clearStore() {
        this.clearPerformanceData();
        this.clearUrlSelectedIds();
        this.resetRating();
    }

    @action
    clearPerformanceData() {
        this.performanceData = null;
    }

    @action
    clearUrlSelectedIds() {
        this.urlSelectedIds = [];
    }

    @action
    resetRating() {
        this.rating = PERFORMANCE_RATING.THREE;
    }

    @action
    resetAggregation() {
        this.aggregation = CHART_AGGREGATION_PERIOD.DAY;
    }

    @action
    setAggregation(aggregation: CHART_AGGREGATION_PERIOD) {
        this.aggregation = aggregation;
    }

    /**
     *   ___ REPORTS GENERATION METHODS ___
     */

    /**
     * Boxed computed expresion function
     * @param name - report name
     * @see https://mobx.js.org/refguide/computed-decorator.html#computedexpression-as-function
     */
    protected performanceReport(name: string): Report | null {
        return computed(() => {
            if (this.getPerformanceData?.length) {
                const reportRawData: Array<any> = this.getPerformanceData
                    .map(performanceDatum => performanceDatum.entityPerformanceReport)
                    .filter(report => report !== null);

                return BasePerformanceStore.buildReport(name, reportRawData);
            }

            return null;
        }).get();
    }

    /**
     * Builds full report for the page including in-tune rate percentage
     * @param name - report name
     * @see https://mobx.js.org/refguide/computed-decorator.html#computedexpression-as-function
     */
    protected fullPerformanceReport(name: string): Report | null {
        return computed(() => {
            if (this.getPerformanceData?.length) {
                const reportRawData: Array<any> = this.getPerformanceData.map(performanceDatum => ({
                    ...performanceDatum.entityPerformanceReport,
                    'in-tune rate': formatMetricToPercentageString(performanceDatum.rejectedRatio)
                })).filter(report => report !== null);

                return BasePerformanceStore.buildReport(name, reportRawData);
            }

            return null;
        }).get();
    }

    @computed
    protected get totalReviewedReport(): Report | null {
        if (this.getPerformanceData?.length) {
            const REPORT_NAME = 'Total review orders';

            const reportRawData: Array<any> = this.getPerformanceData
                .map(entity => entity.totalReviewedEntityReport)
                .filter(report => report !== null);

            return BasePerformanceStore.buildReport(REPORT_NAME, reportRawData);
        }

        return null;
    }

    /**
     * Creates report item object
     *
     * @param name - name of the report to be displayed
     * @param rawData - raw report data
     * @returns Report - object that represents report
     */
    static buildReport(name: string, rawData: UnparseTypes): Report {
        return {
            name,
            data: convertToCSVString(rawData)
        };
    }
}
