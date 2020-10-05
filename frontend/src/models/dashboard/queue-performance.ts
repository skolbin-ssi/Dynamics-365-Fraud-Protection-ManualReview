// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Datum } from '@nivo/line';
import { computed } from 'mobx';

import { PerformanceMetrics } from './performance-metrics';
import { EntityPerformance } from './entity-performance';

import { generateColor } from '../../utils/colors';
import { QueuePerformanceDTO } from '../../data-services/api-services/models/dashboard/queue';

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
        return Object.entries(this.data).map(([key, value]) => ({
            x: new Date(key),
            y: (value as any as PerformanceMetrics).reviewed, // please @see https://github.com/microsoft/TypeScript/issues/35101,
            name: this.name
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
