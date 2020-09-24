// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed, observable } from 'mobx';
import { Datum } from '@nivo/line';

import { PerformanceMetrics } from './performance-metrics';

import { PeriodPerformanceMetrics } from '../../data-services/api-services/models/dashboard';
import { BasicEntityPerformance } from './basic-entity-performance';
import { calculatePercentageRatio } from '../../utils/math';
import { formatMetricToPercentageString } from '../../utils/text';
import { OVERTURNED_DECISIONS_CHART_KEYS, OVERTURNED_DECISIONS_REPORT_KEYS } from '../../constants';

export abstract class EntityPerformance implements BasicEntityPerformance {
    /**
     * id - entity id
     */
    id = '';

    /**
     * name - entity name
     */
    name = '';

    /**
     * data - entity performance metrics
     */
    @observable
    data: PeriodPerformanceMetrics = {} as PeriodPerformanceMetrics;

    /**
     * total - total (aggregated) performance for an entity
     */
    total: PerformanceMetrics = new PerformanceMetrics();

    /**
     * color - calculated color for an entity (for charts display)
     */
    @observable
    color: string = '';

    /**
     * isChecked - indicates whether an entity has been checked and
     * its statistics should be displayed in the chart
     */
    @observable
    isChecked = false;

    /**
     * Returns datum for the line chart
     */
    abstract get lineChartData(): Datum[];

    /**
     * Maps DTO model to Entity Performance model
     * @param entity
     */
    abstract fromDto(entity: any): this;

    @computed
    get goodDecisionsRatio() {
        const { good, reviewed } = this.total;
        return calculatePercentageRatio(good, reviewed, 0);
    }

    @computed
    get watchDecisionsRatio() {
        const { watched, reviewed } = this.total;
        return calculatePercentageRatio(watched, reviewed, 0);
    }

    @computed
    get badDecisionsRatio() {
        const { bad, reviewed } = this.total;
        return calculatePercentageRatio(bad, reviewed, 0);
    }

    @action
    setIsChecked(isChecked: boolean) {
        this.isChecked = isChecked;
    }

    @computed
    private get decisions() {
        return {
            goodApplied: this.goodApplied,
            overturnedGood: this.goodOverturned,
            goodOverturnRate: this.goodOverturnRate,
            badApplied: this.badApplied,
            overturnedBad: this.badOverturned,
            badOverturnRate: this.badOverturnRate,
            averageOverturnRate: this.averageOverturnRate,
        };
    }

    // TODO: Refactor this to using Object.keys, or Array.reduce
    @computed
    get accuracyReport() {
        return {
            name: this.name,
            [OVERTURNED_DECISIONS_REPORT_KEYS[OVERTURNED_DECISIONS_CHART_KEYS.GOOD_DECISIONS]]:
                this.decisions.goodApplied,
            [OVERTURNED_DECISIONS_REPORT_KEYS[OVERTURNED_DECISIONS_CHART_KEYS.OVERTURNED_GOOD_DECISIONS]]:
                this.decisions.overturnedGood,
            [OVERTURNED_DECISIONS_REPORT_KEYS[OVERTURNED_DECISIONS_CHART_KEYS.GOOD_DECISION_OVERTURN_RATE]]:
                formatMetricToPercentageString(this.decisions.goodOverturnRate),
            [OVERTURNED_DECISIONS_REPORT_KEYS[OVERTURNED_DECISIONS_CHART_KEYS.BAD_DECISIONS]]:
            this.decisions.badApplied,
            [OVERTURNED_DECISIONS_REPORT_KEYS[OVERTURNED_DECISIONS_CHART_KEYS.OVERTURNED_BAD_DECISIONS]]:
            this.decisions.overturnedBad,
            [OVERTURNED_DECISIONS_REPORT_KEYS[OVERTURNED_DECISIONS_CHART_KEYS.BAD_DECISION_OVERTURN_RATE]]:
                formatMetricToPercentageString(this.decisions.badOverturnRate),
            [OVERTURNED_DECISIONS_REPORT_KEYS[OVERTURNED_DECISIONS_CHART_KEYS.AVERAGE_OVERTURN_RATE]]:
                formatMetricToPercentageString(this.decisions.averageOverturnRate),
        };
    }

    /**
     * Returns individual report item for an entity by reviewed count
     */
    @computed
    get totalReviewedEntityReport() {
        if (this.name && this.data) {
            const result = Object.keys(this.data).reduce((acc, date) => ({
                ...acc,
                [date]: this.data[date].reviewed
            }), {});

            return {
                name: this.name,
                ...result
            };
        }

        return null;
    }

    @computed
    get entityPerformanceReport() {
        if (this.name && this.total) {
            return {
                name: this.name,
                reviewed: this.total.reviewed,
                good: this.total.good,
                watched: this.total.watched,
                bad: this.total.bad
            };
        }

        return null;
    }

    @computed
    get goodApplied() {
        return this.total.good + this.total.watched;
    }

    @computed
    get goodOverturned() {
        return this.total.goodOverturned;
    }

    @computed
    get goodOverturnRate() {
        return calculatePercentageRatio(this.goodOverturned, this.goodApplied, 2);
    }

    @computed
    get badApplied() {
        return this.total.bad;
    }

    @computed
    get badOverturned() {
        return this.total.badOverturned;
    }

    @computed
    get badOverturnRate() {
        return calculatePercentageRatio(this.badOverturned, this.badApplied, 2);
    }

    @computed
    get averageOverturnRate() {
        const numerator = this.goodOverturned + this.badOverturned;
        const denominator = this.goodApplied + this.badApplied;

        return calculatePercentageRatio(numerator, denominator, 2);
    }
}
