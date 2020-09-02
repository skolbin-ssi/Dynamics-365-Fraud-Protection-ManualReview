import { computed, observable } from 'mobx';

import { PerformanceMetrics } from './performance-metrics';

import { ProgressMetricDto } from '../../data-services/api-services/models/dashboard';
import { roundNumberToDigit } from '../../utils/math';

export interface CurrentProgress {
    /**
     * current- Represents current value
     */
    current: number | string;

    /**
     * progress - Represents percentage ratio between current and previous values
     */
    progress: number | undefined
}

export class ProgressPerformanceMetric implements ProgressMetricDto {
    @observable annualBeforePeriod = new PerformanceMetrics();

    @observable annualIncludingPeriod = new PerformanceMetrics();

    @observable currentPeriod = new PerformanceMetrics();

    @observable previousPeriod = new PerformanceMetrics();

    constructor(progressPerformanceMetricDto?: ProgressMetricDto) {
        Object.assign(this, progressPerformanceMetricDto);
    }

    @computed
    get reviewedProgress(): CurrentProgress {
        return {
            current: this.currentPeriod.reviewed,
            progress: ProgressPerformanceMetric.calculateProgress(this.currentPeriod.reviewed, this.previousPeriod.reviewed)
        };
    }

    @computed
    get approvedProgress(): CurrentProgress {
        return {
            current: this.currentPeriod.approved,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.currentPeriod.approved, this.previousPeriod.approved)
        };
    }

    @computed
    get rejectedProgress(): CurrentProgress {
        return {
            current: this.currentPeriod.rejected,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.currentPeriod.rejected, this.previousPeriod.rejected)
        };
    }

    @computed
    get watchedProgress(): CurrentProgress {
        return {
            current: this.currentPeriod.watched,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.currentPeriod.watched, this.previousPeriod.watched)
        };
    }

    @computed
    get escalatedProgress(): CurrentProgress {
        return {
            current: this.currentPeriod.escalated,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.currentPeriod.escalated, this.previousPeriod.escalated)
        };
    }

    @computed
    get annualReviewedProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.reviewed,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.reviewed, this.annualBeforePeriod.reviewed)
        };
    }

    @computed
    get annualApprovedProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.approved,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.approved, this.annualBeforePeriod.approved)
        };
    }

    @computed
    get annualRejectedProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.rejected,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.rejected, this.annualBeforePeriod.rejected)
        };
    }

    @computed
    get annualWatchedProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.watched,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.watched, this.annualBeforePeriod.watched)
        };
    }

    @computed
    get annualEscalatedProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.escalated,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.escalated, this.annualBeforePeriod.escalated)
        };
    }

    @computed
    get overviewReport() {
        return [
            this.rejectedProgress,
            this.annualReviewedProgress,
            this.approvedProgress,
            this.annualApprovedProgress,
            this.watchedProgress,
            this.annualWatchedProgress,
            this.rejectedProgress,
            this.annualRejectedProgress,
            this.escalatedProgress,
            this.annualEscalatedProgress,
        ];
    }

    // TODO: Move to shared math functions
    private static calculateProgress(current: number, previous: number) {
        const quotient = 100;
        let ratio = 0;

        if (current > previous) {
            ratio = (current - previous) / current;
        }

        if (current < previous) {
            ratio = (current - previous) / previous;
        }

        ratio = Number.isFinite(ratio) ? ratio : 0;

        return roundNumberToDigit(ratio * quotient, 2);
    }
}
