// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { computed } from 'mobx';

import { Datum } from '@nivo/line';

import { QueuePerformanceDTO } from '../../data-services/api-services/models/dashboard/queue';
import { generateColor } from '../../utils/colors';
import { EntityPerformance } from './entity-performance';
import { PerformanceMetrics } from './performance-metrics';

/**
 * QueuePerformance - queue performance model
 */
export class QueuePerformance extends EntityPerformance {
    fromDto(queue: QueuePerformanceDTO) {
        this.id = queue.id;
        this.data = queue.data;
        this.total = (queue.total as PerformanceMetrics);
        generateColor(queue.id)
            .then(generatedColor => { this.color = generatedColor || ''; });

        return this;
    }

    @computed
    get lineChartData(): Datum[] {
        const getPercent = (portion: number, total: number) => (total !== 0 ? (portion / total) * 100 : 0)
            .toFixed(1);
        return Object.entries(this.data).map(([key, value]) => ({
            x: new Date(key),
            y: getPercent((value as any as PerformanceMetrics).bad, (value as any as PerformanceMetrics).reviewed), // please @see https://github.com/microsoft/TypeScript/issues/35101,
            name: this.name,
            entityId: this.id
        }));
    }

    @computed
    get lineChartMaxYValue() {
        if (this.lineChartData) {
            const data = this.lineChartData.map(item => (item.y as number));

            return Math.max(...data);
        }

        return 0;
    }

    setQueueName(name: string) {
        this.name = name;
    }
}
