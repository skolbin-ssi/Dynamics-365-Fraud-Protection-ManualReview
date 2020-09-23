// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

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
    get goodDecisionsProgress(): CurrentProgress {
        return {
            current: this.currentPeriod.good,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.currentPeriod.good, this.previousPeriod.good)
        };
    }

    @computed
    get badDecisionsProgress(): CurrentProgress {
        return {
            current: this.currentPeriod.bad,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.currentPeriod.bad, this.previousPeriod.bad)
        };
    }

    @computed
    get watchDecisionsProgress(): CurrentProgress {
        return {
            current: this.currentPeriod.watched,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.currentPeriod.watched, this.previousPeriod.watched)
        };
    }

    @computed
    get escalatedItemsProgress(): CurrentProgress {
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
    get annualGoodDecisionsProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.good,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.good, this.annualBeforePeriod.good)
        };
    }

    @computed
    get annualBadDecisionsProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.bad,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.bad, this.annualBeforePeriod.bad)
        };
    }

    @computed
    get annualWatchDecisionsProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.watched,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.watched, this.annualBeforePeriod.watched)
        };
    }

    @computed
    get annualEscalatedItemsProgress(): CurrentProgress {
        return {
            current: this.annualIncludingPeriod.escalated,
            progress: ProgressPerformanceMetric
                .calculateProgress(this.annualIncludingPeriod.escalated, this.annualBeforePeriod.escalated)
        };
    }

    @computed
    get overviewReport() {
        return [
            this.badDecisionsProgress,
            this.annualReviewedProgress,
            this.goodDecisionsProgress,
            this.annualGoodDecisionsProgress,
            this.watchDecisionsProgress,
            this.annualWatchDecisionsProgress,
            this.badDecisionsProgress,
            this.annualBadDecisionsProgress,
            this.escalatedItemsProgress,
            this.annualEscalatedItemsProgress,
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
