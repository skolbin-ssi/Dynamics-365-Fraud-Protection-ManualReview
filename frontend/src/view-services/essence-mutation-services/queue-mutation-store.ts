// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, computed, observable } from 'mobx';
import {
    FILTER_NAMES,
    LABEL,
    MAXIMUM_QUEUE_PROCESSING_DAYS,
    NOTIFICATION_TYPE,
    QUEUE_CONFIGURATION_LABEL,
    QUEUE_ITEMS_FIELD,
    QUEUE_MUTATION_TYPES,
    SORTING_FIELD,
    SORTING_ORDER,
} from '../../constants';
import {
    AppStore,
    LockedItemsStore,
    QueuesScreenStore,
    QueueStore,
} from '..';
import { QueueService, UserService } from '../../data-services';
import {
    NewQueue,
    Queue,
    QueueToUpdate,
    User,
    Filter,
    QueueAssignee,
} from '../../models';
import { TYPES } from '../../types';
import {
    getProcessingDeadlineValues,
    getQueueProcessingDeadline
} from '../../utils';

type MutationStatus = null | 'ongoing' | 'success' | 'failure';
type OverlayType = null | MutationStatus | 'loadingData';

interface CreateEditQueueModalFields {
    name: string;
    labels: LABEL[];
    sortingLocked: boolean;
    sortBy: SORTING_FIELD;
    sortDirection: SORTING_ORDER;
    enableProcessingDeadline: boolean;
    processingDeadlineDays: number;
    processingDeadlineHours: number;
    reviewers: string[];
    supervisors: string[];
    filters: Filter[];
}

export interface LabelObject {
    name: string;
    type: LABEL[];
    value: boolean;
    disabled: boolean;
}

@injectable()
export class QueueMutationStore {
    /**
     * Queue state before the update
     */
    @observable private initialQueue: Queue | null = null;

    /**
     * Mutation type
     */
    @observable mutationType: QUEUE_MUTATION_TYPES | null = null;

    /**
     * Queue ID (for update/delete operations)
     */
    @observable queueId: string | null = null;

    /**
     * View ID
     */
    @observable viewId: string | null = null;

    /**
     * Queue to create
     */
    @observable fields: CreateEditQueueModalFields = {
        name: '',
        labels: [LABEL.GOOD, LABEL.BAD],
        sortingLocked: false,
        sortBy: SORTING_FIELD.IMPORT_DATE,
        sortDirection: SORTING_ORDER.ASC,
        enableProcessingDeadline: false,
        processingDeadlineDays: 0,
        processingDeadlineHours: 0,
        reviewers: [],
        supervisors: [],
        filters: []
    };

    /**
     * Error
     */
    @observable error: Error | null = null;

    /**
     * Mutation status
     */
    @observable mutationStatus: MutationStatus = null;

    @observable users: User[] | null = null;

    // TODO: temporary fix, since get Users is not sync.
    @observable loadingUsers: boolean = false;

    @observable loadingQueue: boolean = false;

    /**
     * Searched SKU value, used in case a custom SKU needs to be created
     */
    @observable SKUInput: string = '';

    /**
     * Is queue residual
     */
    @observable isResidual = false;

    /**
     * Is queue for escalation
     */
    @observable forEscalation = false;

    /**
     * Whether deadline was set before
     */
    @computed get isInitialDeadlineSet() {
        return !!this.initialQueue?.processingDeadline && /([1-9]|\d{2,})(?=[DH])/g.test(this.initialQueue.processingDeadline);
    }

    /**
     * We cannot unset processing deadline if it was set before
     */
    @computed get blockDisablingProcessingDeadline() {
        return this.mutationType === QUEUE_MUTATION_TYPES.UPDATE
            && this.isInitialDeadlineSet;
    }

    /**
     * Was the deadline value changed?
     */
    @computed get isDeadlineChanged(): boolean {
        if (!this.initialQueue) {
            return false;
        }
        const { processingDeadline } = this.initialQueue;
        const { processingDeadlineDays, processingDeadlineHours } = this.fields;
        const deadline = getProcessingDeadlineValues(processingDeadline);
        const daysChanged = +deadline.days !== processingDeadlineDays;
        const hoursChanged = +deadline.hours !== processingDeadlineHours;
        return daysChanged || hoursChanged;
    }

    /**
     * Label objects made out of enum
     */
    @computed get labelObjects(): LabelObject[] {
        return QUEUE_CONFIGURATION_LABEL
            .map(({ name, labels }) => {
                const isEditDialog = !!this.initialQueue;
                let isDisabled = false;

                /**
                 * The label is blocked, if:
                 * ALL LABELS: it's an EDIT dialog
                 * GOOD, BAD: always, as they're mandatory
                 * HOLD - if no ESCALATE is selected
                 */
                if (
                    isEditDialog
                    || labels.includes(LABEL.GOOD)
                    || labels.includes(LABEL.BAD)
                    || (labels.includes(LABEL.HOLD) && !this.fields.labels.includes(LABEL.ESCALATE))
                ) {
                    isDisabled = true;
                }

                return {
                    name,
                    type: labels,
                    value: labels.every(label => this.fields.labels.indexOf(label) > -1),
                    disabled: isDisabled
                };
            });
    }

    /**
     * Overlay
     */
    @computed get overlayType(): OverlayType {
        if (this.loadingUsers || this.loadingQueue) {
            return 'loadingData';
        }
        return this.mutationStatus;
    }

    /**
     * Are required filled filled?
     */
    @computed get isValid(): boolean {
        const {
            name,
            enableProcessingDeadline,
            processingDeadlineDays,
            processingDeadlineHours,
            filters,
            supervisors
        } = this.fields;
        const isNameValid = !!name;
        const isDeadlineValid = !enableProcessingDeadline || (!!processingDeadlineDays || !!processingDeadlineHours);
        const areFiltersValid = this.isResidual || (!!filters.length && filters.every(filter => filter.validators.every(validator => validator.isPassed)));
        const hasSomeSupervisors = Array.isArray(supervisors) && supervisors.length > 0;
        return isNameValid && isDeadlineValid && areFiltersValid && hasSomeSupervisors;
    }

    /**
     * Selected analysts as QueueAssignee[]
     */
    @computed
    get selectedReviewerModels(): QueueAssignee[] {
        const { users } = this;
        const { reviewers, supervisors } = this.fields;
        if (!users) {
            return [];
        }

        return users
            .filter(({ id }) => reviewers.includes(id) || supervisors.includes(id))
            .map(user => new QueueAssignee(supervisors.includes(user.id), user));
    }

    /**
     * Selected analysts as User[]
     */
    @computed get nonSelectedReviewerModels(): User[] {
        const { users } = this;
        const { reviewers, supervisors } = this.fields;
        if (!users || !reviewers) {
            return [];
        }
        return users.filter(({ id }) => !reviewers.includes(id) && !supervisors.includes(id));
    }

    /**
     * Types of filters to display in "Add condition" dropdown
     */
    @computed
    get availableFilterTypes(): { field: string, name: string, isUsed: boolean }[] {
        return Array.from(FILTER_NAMES).map(([field, name]) => {
            const isUsed = !!this.fields.filters.find(filter => filter.field === field);
            return {
                field,
                name,
                isUsed
            };
        });
    }

    constructor(
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.QUEUE_STORE) private queueStore: QueueStore,
        @inject(TYPES.USER_SERVICE) private userService: UserService,
        @inject(TYPES.APP_STORE) private appStore: AppStore,
        @inject(TYPES.QUEUES_SCREEN_STORE) private queueScreenStore: QueuesScreenStore,
        @inject(TYPES.LOCKED_ITEMS_STORE) private lockedItemsStore: LockedItemsStore
    ) {}

    @action
    getUsersIfNecessary() {
        if (!this.users && !this.loadingUsers) {
            this.users = this.userService.getUsers();
        }
    }

    @action
    changeName(newName: string) {
        if (newName !== undefined) {
            this.fields.name = newName;
        }
    }

    @action
    toggleIsOrderOrganizationLocked() {
        const { sortingLocked: currentValue } = this.fields;
        this.fields.sortingLocked = !currentValue;
    }

    @action
    changeSortBy(newValue: SORTING_FIELD) {
        this.fields.sortBy = newValue;
    }

    @action
    changeSortDirection(newValue: SORTING_ORDER) {
        this.fields.sortDirection = newValue;
    }

    @action
    toggleIsProcessingDeadlineUsed() {
        const { enableProcessingDeadline } = this.fields;
        this.fields.enableProcessingDeadline = !enableProcessingDeadline;
    }

    @action
    changeProcessingDeadline(value: string, field: 'days' | 'hours', direction?: 'incr' | 'decr') {
        const [number] = value.split(' ');

        if (Number.isNaN(+number)) {
            return;
        }

        let toAdd: number;
        switch (direction) {
            case 'incr':
                toAdd = 1;
                break;
            case 'decr':
                toAdd = -1;
                break;
            default:
                toAdd = 0;
                break;
        }

        const newValue = +number + toAdd;

        switch (field) {
            case 'days':
                if (newValue <= MAXIMUM_QUEUE_PROCESSING_DAYS && newValue >= 0) {
                    this.fields.processingDeadlineDays = newValue;
                }
                break;
            case 'hours':
                if (newValue < 24 && newValue >= 0) {
                    this.fields.processingDeadlineHours = newValue;
                }
                break;
            default:
                break;
        }
    }

    @action
    changeLabelToggledState(toggledLabel: LABEL[]) {
        const { labels } = this.fields;
        let updatedLabelList: LABEL[];
        const isCurrentlySelected = toggledLabel.every(label => labels.includes(label));

        if (isCurrentlySelected) {
            updatedLabelList = labels.filter(it => !toggledLabel.includes(it));
        } else {
            updatedLabelList = [...labels].concat(toggledLabel);
        }
        this.fields.labels = updatedLabelList;
    }

    @action
    addAssignedReviewer(id: string, isSupervisor: boolean = false) {
        if (isSupervisor) {
            this.fields.supervisors.push(id);
        } else {
            this.fields.reviewers.push(id);
        }
    }

    /**
     * Changes assignee role between supervisor and reviewer
     * @param user
     * @param isSupervisor
     */
    @action
    changeAssigneeRole(user: QueueAssignee, isSupervisor: boolean) {
        if (isSupervisor) {
            this.fields.supervisors.push(user.id);
            this.fields.reviewers = this.fields.reviewers.filter(id => id !== user.id);
        } else {
            this.fields.reviewers.push(user.id);
            this.fields.supervisors = this.fields.supervisors.filter(id => id !== user.id);
        }
    }

    @action
    removeAssignedReviewer(id: string) {
        this.fields.reviewers = this.fields.reviewers.filter(rId => rId !== id);
        this.fields.supervisors = this.fields.supervisors.filter(sId => sId !== id);
    }

    @action
    async createQueueAndUpdateQueueList(newQueue: NewQueue) {
        let queueMutationResult;
        try {
            queueMutationResult = await this.queueService.createQueue(newQueue);
        } catch (e) {
            // to handle validation errors from backend
            return e;
        }

        this.queueStore.loadQueues();
        return queueMutationResult;
    }

    @action
    async updateQueueAndUpdateQueueInList(queueToUpdate: QueueToUpdate) {
        const { viewId } = queueToUpdate;
        let queueMutationResult;
        try {
            queueMutationResult = await this.queueService.updateQueue(queueToUpdate);
        } catch (e) {
            // to handle validation errors from backend
            return e;
        }

        this.queueScreenStore.refreshQueueAndLockedItems(viewId);
        this.queueStore.markQueueAsSelectedById(viewId);

        return queueMutationResult;
    }

    @action
    async deleteQueueAndUpdateQueueList(queueId: string) {
        try {
            await this.queueService.deleteQueue(queueId);
        } catch (e) {
            return e;
        }

        this.loadQueuesAndLockedItems();
        return null;
    }

    @action
    loadQueuesAndLockedItems() {
        this.queueStore.loadQueues();
        this.lockedItemsStore.getLockedItems();
    }

    @action
    async addFilter(field: QUEUE_ITEMS_FIELD) {
        const filter = new Filter(field);
        this.fields.filters.push(filter);
    }

    @action
    async removeFilter(field: QUEUE_ITEMS_FIELD) {
        this.fields.filters = this.fields.filters.filter(filter => filter.field !== field);
    }

    @action
    async setNumericRangeFilterValue(args: {
        field: QUEUE_ITEMS_FIELD,
        value: string,
        type: 'min' | 'max',
        allowDecimal?: boolean,
        allowNegative?: boolean
    }) {
        const {
            field,
            value,
            type,
            allowDecimal,
            allowNegative
        } = args;
        if ((value !== '' && Number.isNaN(+value)) || (!allowDecimal && value.includes('.')) || (!allowNegative && value.startsWith('-'))) {
            return;
        }
        const soughtFilter = this.fields.filters.find(filter => filter.field === field);
        const index = type === 'min' ? 0 : 1;
        if (soughtFilter) {
            soughtFilter.values[index] = value.toString();
        }
    }

    @action
    addMultiValuesFilterValue(args: {
        field: QUEUE_ITEMS_FIELD,
        value: string
    }) {
        const { field, value } = args;
        const soughtFilter = this.fields.filters.find(filter => filter.field === field);
        if (soughtFilter) {
            soughtFilter.values.push(value);
        }
    }

    @action
    removeMultiValuesFilterValue(args: {
        field: QUEUE_ITEMS_FIELD,
        value: string
    }) {
        const { field, value } = args;
        const soughtFilter = this.fields.filters.find(filter => filter.field === field);
        if (soughtFilter) {
            soughtFilter.values = soughtFilter.values.filter(filterValue => filterValue !== value);
        }
    }

    @action
    setMultiValuesFilterValues(args: {
        field: QUEUE_ITEMS_FIELD,
        values: string[]
    }) {
        const { field, values } = args;
        const soughtFilter = this.fields.filters.find(filter => filter.field === field);
        if (soughtFilter) {
            // We can't just replace an array, as it's observed
            soughtFilter.values.length = 0;
            values.forEach(value => soughtFilter.values.push(value));
        }
    }

    getSKUSuggestions(term: string) {
        return this.queueService.searchSKU(term);
    }

    createCustomSKU(sku: string) {
        return this.queueService.addSKU(sku);
    }

    setSKUInput(newValue: string) {
        this.SKUInput = newValue;
    }

    getCountrySuggestions(term: string = '') {
        return this.queueService.searchCountry(term);
    }

    @action
    async setCurrentValue(queue: Queue) {
        /**
         * when opening dialog have to request queue by queueId, not viewId to get all settings.
         */
        this.loadingQueue = true;

        try {
            const queueForSettings = await this.queueStore.loadSingleQueue(queue.queueId);

            this.initialQueue = queueForSettings;
            // we shouldn't take viewId from the response as it has viewId === queueId in this case
            this.viewId = queue.viewId;

            const {
                queueId,
                name,
                allowedLabels,
                sortBy,
                sortDirection,
                processingDeadline,
                reviewers,
                supervisors,
                filters,
                sortingLocked,
                residual,
                forEscalations
            } = queueForSettings;
            const deadline = getProcessingDeadlineValues(processingDeadline);
            this.fields.name = name;
            this.fields.sortBy = sortBy;
            this.fields.sortDirection = sortDirection;
            this.fields.sortingLocked = sortingLocked;
            this.fields.reviewers = [...reviewers];
            this.fields.supervisors = [...supervisors];
            this.fields.labels = [...allowedLabels];
            this.fields.enableProcessingDeadline = !!deadline.days || !!deadline.hours;
            this.fields.processingDeadlineDays = deadline.days;
            this.fields.processingDeadlineHours = deadline.hours;
            this.fields.filters = filters;

            this.queueId = queueId;
            this.isResidual = residual;
            this.forEscalation = forEscalations;
        } finally {
            this.loadingQueue = false;
        }
    }

    @action
    setMutationType(type: QUEUE_MUTATION_TYPES) {
        this.mutationType = type;
    }

    @action
    async performMutation(): Promise<MutationStatus> {
        const {
            name,
            labels,
            reviewers,
            supervisors,
            enableProcessingDeadline,
            processingDeadlineDays,
            processingDeadlineHours,
            sortBy,
            sortDirection,
            sortingLocked,
            filters
        } = this.fields;

        const filterDTOs = filters.map(filter => filter.toDTO());

        const queueBase = {
            name,
            allowedLabels: labels,
            reviewers,
            supervisors,
            processingDeadline: enableProcessingDeadline
                ? getQueueProcessingDeadline(processingDeadlineDays, processingDeadlineHours)
                : '',
            sortBy,
            sortDirection,
            sortingLocked,
            filters: filterDTOs
        };
        this.mutationStatus = 'ongoing';
        let result;
        if (this.mutationType === QUEUE_MUTATION_TYPES.CREATE) {
            result = await this.createQueueAndUpdateQueueList(queueBase);
        } else if (this.mutationType === QUEUE_MUTATION_TYPES.UPDATE && this.queueId && this.viewId) {
            result = await this.updateQueueAndUpdateQueueInList({
                queueId: this.queueId,
                viewId: this.viewId,
                ...queueBase
            });
        } else if (this.mutationType === QUEUE_MUTATION_TYPES.DELETE && this.queueId) {
            result = await this.deleteQueueAndUpdateQueueList(this.queueId);
        }

        if (result instanceof Error) {
            this.error = result;
            this.mutationStatus = 'failure';
            this.appStore.showToast({
                type: NOTIFICATION_TYPE.QUEUE_MUTATION_ERROR,
                mutation: this.mutationType!,
                queueName: name,
            });
            return 'failure';
        }

        this.mutationStatus = 'success';
        this.appStore.showToast({
            type: NOTIFICATION_TYPE.QUEUE_MUTATION_SUCCESS,
            mutation: this.mutationType!,
            queueName: name,
        });
        return 'success';
    }

    @action
    async performDeletion(): Promise<MutationStatus> {
        this.mutationType = QUEUE_MUTATION_TYPES.DELETE;
        return this.performMutation();
    }
}
