// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { computed } from 'mobx';
import { Datum, Serie } from '@nivo/line';

import { QueueSizeHistoryDTO } from '../../../data-services/api-services/models/dashboard/demand-supply';

export class QueueSizeHistory {
    id = '';

    data: {
        [key: string]: number
    } = {};

    @computed
    get getRemainingChartDatum(): Datum[] {
        const datum = [] as Datum[];
        if (this.data) {
            Object.entries(this.data).forEach(([dateString, metric]) => {
                datum.push({
                    x: new Date(dateString),
                    y: metric,
                    name: 'Remaining'
                });
            });
        }

        return datum;
    }

    @computed
    get getRemainingStatistic(): Serie[] {
        if (this.getRemainingChartDatum) {
            return [
                {
                    id: 'Remaining',
                    data: this.getRemainingChartDatum,
                    color: '#BF82F1'
                }
            ];
        }

        return [];
    }

    /**
     * Returns total remaining orders count
     */
    @computed
    get totalRemainingCount() {
        if (this.getRemainingChartDatum) {
            const totalCount: {
                total: number
            } = this.getRemainingChartDatum
                .reduce((prev, next) => ({ total: prev.total + next.y }), { total: 0 }) as { total: number};

            return totalCount.total;
        }

        return undefined;
    }

    @computed
    get remainingOrdersReport() {
        if (this.data) {
            return Object.entries(this.data);
        }

        return null;
    }

    fromDTO(queueSizeHistoryDTO: QueueSizeHistoryDTO) {
        this.id = queueSizeHistoryDTO.id;
        this.data = queueSizeHistoryDTO.data;

        return this;
    }
}
