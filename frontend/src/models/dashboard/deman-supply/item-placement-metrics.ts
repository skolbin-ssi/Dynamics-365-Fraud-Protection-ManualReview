// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { computed } from 'mobx';

import { Datum } from '@nivo/line';

import { ItemPlacementMetric } from './item-placement-metric';
import { ItemPlacementMetricByDateKey } from './item-placement-metrics-by-date-key';

import { ItemPlacementMetricDTO, ItemPlacementMetricsDTO } from '../../../data-services/api-services/models/dashboard/demand-supply';

interface TotalReviewedNewReportDatum {
    released: number[],
    reviewed: number[],
    date: string[]
}

export class ItemPlacementMetrics {
    id = '';

    name = '';

    data: ItemPlacementMetricByDateKey | null = null;

    total = new ItemPlacementMetric();

    @computed
    get getItemPlacementDatums(): { received: Datum[], released: Datum[], reviewed: Datum[]} {
        const result = {
            reviewed: [] as Datum[],
            received: [] as Datum[],
            released: [] as Datum[]
        };

        if (this.data) {
            Object.entries(this.data).forEach(([date, itemPlacementMetric]) => {
                result.received.push({
                    x: new Date(date),
                    y: itemPlacementMetric.received,
                    name: 'New orders'
                });

                result.reviewed.push({
                    x: new Date(date),
                    y: itemPlacementMetric.reviewed,
                    name: 'Reviewed'
                });

                result.released.push({
                    x: new Date(date),
                    y: itemPlacementMetric.released,
                    name: 'Released'
                });
            });
        }

        return result;
    }

    /**
     * Returns individual report item for an entity by reviewed and received count
     */
    @computed
    get totalReviewedNewItemsReport() {
        if (this.data) {
            return Object.keys(this.data).map(key => [[key, this.data![key].reviewed, this.data![key].received]]);
        }

        return null;
    }

    /**
     * Returns individual report item for an entity by reviewed and received count
     */
    @computed
    get fullTotalReviewedNewItemsReport() {
        if (this.data) {
            return Object.keys(this.data).map(key => [[
                key,
                this.data![key].reviewed,
                this.data![key].released,
                this.data![key].received
            ]]);
        }

        return null;
    }

    fromDTO(itemPlacementMetricsDTO: ItemPlacementMetricsDTO) {
        this.id = itemPlacementMetricsDTO.id;
        this.name = itemPlacementMetricsDTO.name;
        this.data = this.mapItemPlacementMetric(itemPlacementMetricsDTO.data);
        this.total = new ItemPlacementMetric().fromDTO(itemPlacementMetricsDTO.total);

        return this;
    }

    private mapItemPlacementMetric(data: {[key: string]: ItemPlacementMetricDTO}): ItemPlacementMetricByDateKey {
        const model = {} as ItemPlacementMetricByDateKey;

        Object.keys(data).forEach(key => {
            model[key] = new ItemPlacementMetric().fromDTO(data[key]);
        });

        return model;
    }
}
