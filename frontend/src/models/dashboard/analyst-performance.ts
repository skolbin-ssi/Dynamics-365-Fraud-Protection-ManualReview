// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    action, computed, observable
} from 'mobx';

import { EntityPerformance } from './entity-performance';
import { PerformanceMetrics } from './performance-metrics';

import { User } from '../user';

import { generateColor } from '../../utils/colors';
import { AnalystPerformanceDTO } from '../../data-services/api-services/models/dashboard';

/**
 * AnalystPerformance - analyst performance model
 */
export class AnalystPerformance extends EntityPerformance {
    @observable
    analyst: User | null = null;

    fromDto(entity: AnalystPerformanceDTO) {
        this.id = entity.id;
        this.data = entity.data;
        this.total = (entity.total as PerformanceMetrics);
        generateColor(entity.id)
            .then(generatedColor => {
                this.color = generatedColor || '';
            });

        return this;
    }

    @computed
    get lineChartData() {
        return Object.entries(this.data).map(([key, value]) => ({
            x: new Date(key),
            y: (value as any as PerformanceMetrics).reviewed, // please @see https://github.com/microsoft/TypeScript/issues/35101,
            name: this.name,
            entityId: this.id,
            user: this.analyst
        }));
    }

    @action
    populateUser(user: User | null) {
        this.analyst = user;
    }

    /**
     * Set name for entity, name is taken from users
     * @param name
     */
    setName(name: string) {
        this.name = name;
    }
}
