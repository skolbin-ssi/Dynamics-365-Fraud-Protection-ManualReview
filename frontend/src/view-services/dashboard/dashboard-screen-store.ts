// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, computed, observable } from 'mobx';

import {
    calculateDateRange,
    getEndOfDate,
    getPastDate,
    getStartOfDate,
    isValidDateString,
} from '../../utils/date';
import { DASHBOARD_MANAGEMENT, DATE_RANGE, DATE_RANGE_DAYS } from '../../constants';
import { CurrentUserStore } from '../current-user-store';
import { PerformanceParsedQueryUrl } from '../../utility-services';

import { TYPES } from '../../types';
import { QueueStore } from '../queues';
import { User } from '../../models/user';
import { CollectedInfoService, QueueService, UserService } from '../../data-services/interfaces';

@injectable()
export class DashboardScreenStore {
    @observable users: User[] | null = null;

    @observable fromDate: Date | null = null;

    @observable toDate: Date | null = null;

    @observable dateRange: DATE_RANGE = DATE_RANGE.SIX_WEEKS;

    constructor(
        @inject(TYPES.USER_SERVICE)
        private userService: UserService,

        @inject(TYPES.QUEUE_STORE)
        public readonly queueStore: QueueStore,

        @inject(TYPES.QUEUE_SERVICE)
        public readonly queueService: QueueService,

        @inject(TYPES.COLLECTED_INFO_SERVICE)
        private readonly collectedInfoService: CollectedInfoService,

        @inject(TYPES.CURRENT_USER_STORE)
        private readonly currentUserStore: CurrentUserStore
    ) {
        /**
         * Loading users and users photo for the search bar
         */

        this.users = this.userService.getUsers();

        /**
         * Loading queues for the search bar
         */
        this.queueStore.loadQueues();

        /**
         * Loads historical queues beforehand
         */
        this.collectedInfoService.getQueuesCollectedInfo();

        /**
         * Loads historical users beforehand
         */
        this.fetchCollectedUsersInfo();
    }

    @computed
    get getFromDate() {
        return this.fromDate;
    }

    @computed
    get getToDate() {
        return this.toDate;
    }

    @action
    setFromDate(date: Date) {
        this.fromDate = date;
    }

    @action
    setToDate(date: Date) {
        this.toDate = date;
    }

    @action
    clearDates() {
        this.toDate = null;
        this.fromDate = null;
    }

    @action
    setDateRange(range: DATE_RANGE) {
        this.dateRange = range;
    }

    @action
    fetchCollectedUsersInfo() {
        const canUserAccessDashboards = this.currentUserStore
            .checkUserCan(DASHBOARD_MANAGEMENT.ACCESS);

        if (canUserAccessDashboards) {
            this.collectedInfoService.getCollectedInfoUsersAndCache();
        }
    }

    /**
     *  Set initial values for the store, when page has mounted
     *  and URL parameters are in the URL
     *
     * @param parsedQuery - parsed URL params
     */
    @action
    setParsedUrlParams(parsedQuery: Pick<PerformanceParsedQueryUrl, 'from' | 'to'>) {
        const { from, to } = parsedQuery;

        if (from && isValidDateString(from) && to && isValidDateString(to)) {
            const fromDate = getStartOfDate(new Date(from));
            const toDate = getEndOfDate(new Date(to));

            this.setFromDate(fromDate);
            this.setToDate(toDate);
            this.setDateRange(calculateDateRange(fromDate, toDate));
        } else {
            const pastDate = getPastDate(DATE_RANGE_DAYS[DATE_RANGE.SIX_WEEKS]);
            const nowDate = getEndOfDate(new Date());

            this.setFromDate(pastDate!);
            this.setToDate(nowDate);
            this.setDateRange(DATE_RANGE.SIX_WEEKS);
        }
    }
}
