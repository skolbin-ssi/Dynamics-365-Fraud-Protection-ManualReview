// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed, observable } from 'mobx';
import { parse, Duration } from 'iso8601-duration';
import { ITag } from '@fluentui/react/lib/Pickers';

import {
    LABEL,
    QUEUE_VIEW_TYPE,
    SORTING_FIELD,
    SORTING_ORDER
} from '../constants';
import { QueueViewDTO } from '../data-services/api-services/models';
import { User } from './user';
import { CollectedQueueInfoDto } from '../data-services/api-services/models/collected-info/collecte-queue-info';
import { FilterField } from './filter/filter-field';
import { FilterConditionDto } from '../data-services/api-services/models/settings/filter-condition-dto';

export class Queue {
    /**
     * For URL, get queue details
     */
    viewId: string = '';

    /**
     * For update / delete
     */
    queueId: string = '';

    name: string = '';

    allowedLabels: LABEL[] = [];

    @observable
    reviewers: string[] = [];

    @observable
    supervisors: string[] = [];

    /**
     * reviewers + supervisors
     */
    @observable
    assigneeUsers: User[] = [];

    size: number = 0;

    shortId: string = '';

    forEscalations: boolean = false;

    sortBy: SORTING_FIELD = SORTING_FIELD.SCORE;

    sortDirection: SORTING_ORDER = SORTING_ORDER.ASC;

    created: string = '';

    /**
     * processingDeadline - string($PnDTnHnMn.nS) (e. g.: P1DT24H)
     */
    processingDeadline: string = '';

    sortingLocked: boolean = false;

    filters: FilterField[] = [];

    color?: string;

    residual: boolean = false;

    /**
     * Indicates whether this queue was deactivated or not
     */
    active?: boolean;

    /**
     * String ($date-time)
     */
    updated?: string;

    @observable
    views: QueueView[] | null = null;

    @computed
    get assigneeFacepilePersonas() {
        return this
            .assigneeUsers
            .map(user => user.asFacepilePersona);
    }

    @computed
    get reviewersFacepilePersonas() {
        return this
            .assigneeUsers
            .filter(({ id }) => this.reviewers.includes(id))
            .map(user => user.asFacepilePersona);
    }

    @computed
    get getProcessingDeadlineInDh(): Duration | undefined {
        if (this.processingDeadline) {
            return parse(this.processingDeadline);
        }

        return undefined;
    }

    @computed
    get supervisorsFacepilePersonas() {
        return this
            .assigneeUsers
            .filter(({ id }) => this.supervisors.includes(id))
            .map(user => user.asFacepilePersona);
    }

    /**
     * reviewers + supervisors
     */
    @computed
    get assignees(): string[] {
        return this.reviewers.concat(this.supervisors);
    }

    @action
    setAssigneeUsers(users: User[]) {
        this.assigneeUsers = users;
    }

    @computed
    get asTag(): ITag {
        return { name: this.name, key: this.queueId };
    }

    fromDTO(queue: QueueViewDTO) {
        const {
            allowedLabels,
            queueId,
            viewId,
            size,
            name,
            viewType,
            reviewers,
            supervisors,
            sorting: { field: sortBy, order: sortDirection, locked: sortingLocked },
            created,
            processingDeadline,
            residual,
            views
        } = queue;

        this.allowedLabels = allowedLabels;
        this.viewId = viewId;
        this.queueId = queueId;
        this.size = size;
        this.name = name;
        this.shortId = viewId.substr(0, 8);
        this.forEscalations = viewType === QUEUE_VIEW_TYPE.ESCALATION;
        this.reviewers = reviewers || [];
        this.supervisors = supervisors || [];
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;
        this.sortingLocked = sortingLocked;
        this.created = created;
        this.processingDeadline = processingDeadline;
        this.residual = residual;
        this.views = views as QueueView[];

        return this;
    }

    fromCollectedDTO(collectedQueueInfoDTO: CollectedQueueInfoDto) {
        const {
            id,
            name,
            active,
            processingDeadline,
            residual,
            reviewers,
            supervisors,
            updated
        } = collectedQueueInfoDTO;

        this.queueId = id;
        this.name = name;
        this.active = active;
        this.processingDeadline = processingDeadline;
        this.residual = residual;
        this.reviewers = reviewers || [];
        this.supervisors = supervisors || [];
        this.updated = updated;

        return this;
    }

    @action
    setFilters(filters: FilterField[]) {
        this.filters = filters;
    }
}

export interface NewQueue {
    name: string;
    allowedLabels: LABEL[];
    reviewers: string[];
    supervisors: string[];
    processingDeadline: string;
    sortBy: SORTING_FIELD;
    sortDirection: SORTING_ORDER;
    sortingLocked: boolean;
    filters: FilterConditionDto[];
}

export interface QueueToUpdate extends NewQueue {
    viewId: string;
    queueId: string;
}

export interface QueueView {
    viewId: string
    viewType: QUEUE_VIEW_TYPE,
}
