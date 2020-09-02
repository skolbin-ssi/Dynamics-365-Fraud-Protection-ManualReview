import { action, computed, observable } from 'mobx';
import { Datum } from '@nivo/line';

import { PerformanceMetrics } from './performance-metrics';

import { PeriodPerformanceMetrics } from '../../data-services/api-services/models/dashboard';
import { BasicEntityPerformance } from './basic-entity-performance';
import { calculatePercentageRatio } from '../../utils/math';
import { formatMetricToPercentageString } from '../../utils/text';
import { OVERTURNED_ACTIONS_CHART_KEYS, OVERTURNED_ACTIONS_REPORT_KEYS } from '../../constants';

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
    get approvedRatio() {
        const { reviewed, approved } = this.total;
        return EntityPerformance.getRatio(reviewed, approved);
    }

    @computed
    get watchedRatio() {
        const { reviewed, watched } = this.total;
        return EntityPerformance.getRatio(reviewed, watched);
    }

    @computed
    get rejectedRatio() {
        const { reviewed, rejected } = this.total;
        return EntityPerformance.getRatio(reviewed, rejected);
    }

    @action
    setIsChecked(isChecked: boolean) {
        this.isChecked = isChecked;
    }

    @computed
    private get decisions() {
        return {
            approvedApplied: this.approvedApplied,
            approvedOverturned: this.approvedOverturned,
            approvedAccuracy: this.approvedAccuracy,
            rejectedApplied: this.rejectedApplied,
            rejectedOverturned: this.rejectedOverturned,
            rejectedAccuracy: this.rejectedAccuracy,
            accuracyAverage: this.accuracyAverage,
        };
    }

    // TODO: Refactor this to using Object.keys, or Array.reduce
    @computed
    get accuracyReport() {
        return {
            name: this.name,
            [OVERTURNED_ACTIONS_REPORT_KEYS[OVERTURNED_ACTIONS_CHART_KEYS.APPROVED_APPLIED]]:
                this.decisions.approvedApplied,
            [OVERTURNED_ACTIONS_REPORT_KEYS[OVERTURNED_ACTIONS_CHART_KEYS.APPROVED_OVERTURNED]]:
                this.decisions.approvedOverturned,
            [OVERTURNED_ACTIONS_REPORT_KEYS[OVERTURNED_ACTIONS_CHART_KEYS.APPROVED_ACCURACY]]:
                formatMetricToPercentageString(this.decisions.approvedAccuracy),
            [OVERTURNED_ACTIONS_REPORT_KEYS[OVERTURNED_ACTIONS_CHART_KEYS.APPROVED_APPLIED]]:
            this.decisions.rejectedApplied,
            [OVERTURNED_ACTIONS_REPORT_KEYS[OVERTURNED_ACTIONS_CHART_KEYS.REJECTED_OVERTURNED]]:
            this.decisions.rejectedOverturned,
            [OVERTURNED_ACTIONS_REPORT_KEYS[OVERTURNED_ACTIONS_CHART_KEYS.REJECTED_ACCURACY]]:
                formatMetricToPercentageString(this.decisions.rejectedAccuracy),
            [OVERTURNED_ACTIONS_REPORT_KEYS[OVERTURNED_ACTIONS_CHART_KEYS.ACCURACY_AVERAGE]]:
                formatMetricToPercentageString(this.decisions.accuracyAverage),
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
                approved: this.total.approved,
                watched: this.total.watched,
                rejected: this.total.rejected
            };
        }

        return null;
    }

    @computed
    get approvedApplied() {
        return this.total.approved + this.total.watched;
    }

    @computed
    get approvedOverturned() {
        return this.total.approveOverturned;
    }

    @computed
    get approvedAccuracy() {
        const approve = this.approvedApplied - this.approvedOverturned;

        return calculatePercentageRatio(approve, this.approvedApplied, 2);
    }

    @computed
    get rejectedApplied() {
        return this.total.rejected;
    }

    @computed
    get rejectedOverturned() {
        return this.total.rejectOverturned;
    }

    @computed
    get rejectedAccuracy() {
        const reject = this.rejectedApplied - this.rejectedOverturned;

        return calculatePercentageRatio(reject, this.rejectedApplied, 2);
    }

    @computed
    get accuracyAverage() {
        const numerator = (this.approvedApplied + this.rejectedApplied)
            - (this.approvedOverturned + this.rejectedOverturned);
        const denominator = this.approvedApplied + this.rejectedApplied;

        return calculatePercentageRatio(numerator, denominator, 2);
    }

    private static getRatio(numerator: number, denominator: number) {
        const quotient = 100;
        const ratio = (denominator * quotient) / numerator;
        const result = Number.isFinite(ratio) ? ratio : 0;

        return Math.floor(result);
    }
}
