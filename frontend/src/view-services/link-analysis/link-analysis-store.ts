// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';

import {
    action, computed, observable, reaction, runInAction
} from 'mobx';
import { AnalysisField, BatchLabelItemsResult, Item } from '../../models/item';
import { ANALYSIS_FIELDS_CONFIG } from '../../constants/link-analysis';
import { TYPES } from '../../types';
import { ItemService, QueueService } from '../../data-services/interfaces';
import { LABEL, LABEL_NAMES } from '../../constants';
import { LinkAnalysisDfpItem, LinkAnalysisMrItem } from '../../models/item/link-analysis';
import { LinkAnalysisMRItemsStore } from './link-analysis-mr-items-store';
import { LinkAnalysisDFPItemsStore } from './link-analysis-dfp-items-store';

export type LinkAnalysisItem = LinkAnalysisMrItem | LinkAnalysisDfpItem;

export enum ANALYSIS_RESULT_ITEMS {
    /**
     * Orders selected for Manual Review
     */
    MR = 'MR',

    /**
     * Other data in Dynamics 356 Fraud Protection
     */
    DFP = 'DFP'
}

@injectable()
export class LinkAnalysisStore {
    @observable
    searchId: string = '';

    @observable
    analysisFields: AnalysisField[] = [];

    @observable
    isLinkAnalysisLoading = false;

    @observable
    mrItemsStore: LinkAnalysisMRItemsStore;

    @observable
    dfpItemsStore: LinkAnalysisDFPItemsStore;

    @observable
    item!: Item;

    @observable
    isConfirmationModalOpen = false;

    @observable
    isMakeDecisionModalOpen = false;

    @observable
    isResultModalOpen = false;

    @observable
    decisionLabelToApply: LABEL = LABEL.GOOD;

    @observable
    note!: string;

    @observable
    queueId: string = '';

    @observable
    found: number = 0;

    @observable
    foundInMr: number = 0;

    @observable
    analysisResult: BatchLabelItemsResult[] = [];

    @observable
    isBatchApplyDecisionsLoading = false;

    constructor(
        @inject(TYPES.QUEUE_SERVICE) private readonly queueService: QueueService,
        @inject(TYPES.ITEM_SERVICE) private readonly itemsService: ItemService,
        @inject(TYPES.LINK_ANALYSIS_MR_ITEMS_STORE) private readonly linkAnalysisMRItemsStore: LinkAnalysisMRItemsStore,
        @inject(TYPES.LINK_ANALYSIS_DFP_ITEMS_STORE) private readonly linkAnalysisDFPItemsStore: LinkAnalysisDFPItemsStore,
    ) {
        this.mrItemsStore = linkAnalysisMRItemsStore;
        this.dfpItemsStore = linkAnalysisDFPItemsStore;

        this.setAnalysisFields(this.getLinkAnalysisFieldsFromStaticConfig());
        this.queueService = queueService;
    }

    @computed
    get selectedAnalysisFieldsCount() {
        return this.selectedAnalysisFields
            .length;
    }

    @computed
    get selectedAnalysisFields() {
        return this.analysisFields
            .filter(filed => filed.isChecked);
    }

    @computed
    private get selectedAnalysisFieldsIds() {
        return this.selectedAnalysisFields
            .map(field => field.id);
    }

    @computed
    get totalCountDecisionsToBeApplied() {
        return this.mrItemsStore.selectedAnalysisItemsToLabeledIds.length;
    }

    @computed
    get decisionLabelToApplyDisplayName() {
        return LABEL_NAMES[this.decisionLabelToApply];
    }

    @computed
    get sortedAnalysisResult() {
        return this.analysisResult
            .slice()
            // eslint-disable-next-line no-nested-ternary
            .sort((prev, next) => ((prev.success === next.success)
                ? 0
                : prev.success ? 1 : -1));
    }

    @computed
    get successAnalysisResultsCount() {
        return this.analysisResult
            .filter(result => result.success)
            .length;
    }

    @computed
    get failedAnalysisResultsCount() {
        return this.analysisResult
            .filter(result => !result.success)
            .length;
    }

    @computed
    get isSelectedItemsIdsToLabelContainsCurrentItemId() {
        if (this.item) {
            return this.mrItemsStore.selectedAnalysisItemsToLabeledIds
                .includes(this.item.id);
        }

        return false;
    }

    /**
     * Reaction
     * @param callback
     */
    reactOnSearchIdUpdate(callback: (searchId: string) => void) {
        return reaction(() => this.searchId, callback);
    }

    @action
    async labelBatchItems() {
        this.isBatchApplyDecisionsLoading = true;

        try {
            const result = await this.itemsService.batchLabelItems({
                label: this.decisionLabelToApply,
                itemIds: this.mrItemsStore.selectedAnalysisItemsToLabeledIds,
                note: this.note
            });

            runInAction(() => {
                this.isBatchApplyDecisionsLoading = false;

                if (result) {
                    this.analysisResult = result;
                }
            });
        } catch (e) {
            runInAction(() => {
                this.isBatchApplyDecisionsLoading = false;
                throw e;
            });
        } finally {
            runInAction(() => {
                this.isBatchApplyDecisionsLoading = false;
            });
        }
    }

    @action
    async fetchLinkAnalysis() {
        this.isLinkAnalysisLoading = true;

        try {
            const linkAnalysisData = await this.itemsService.postLinkAnalysis(
                {
                    itemId: this.item.id,
                    queueId: this.queueId,
                    fields: this.selectedAnalysisFieldsIds
                }
            );

            runInAction(() => {
                if (linkAnalysisData) {
                    const { id, found, foundInMR } = linkAnalysisData;

                    this.setSearchId(id);
                    this.found = found;
                    this.foundInMr = foundInMR;
                }

                this.isLinkAnalysisLoading = false;
            });

            return linkAnalysisData;
        } catch (e) {
            runInAction(() => {
                this.isLinkAnalysisLoading = false;
                throw e;
            });
        } finally {
            runInAction(() => {
                this.isLinkAnalysisLoading = false;
            });
        }

        return null;
    }

    @action
    async fetchLinkAnalysisAndUpdateValues() {
        const linkAnalysis = await this.fetchLinkAnalysis();

        if (linkAnalysis) {
            this.analysisFields = this.analysisFields.map(field => {
                const linkAnalysisField = linkAnalysis.fields.find(item => item.id === field.id);

                if (linkAnalysisField) {
                    const { purchaseCounts, value } = linkAnalysisField;
                    field.setCount(purchaseCounts);
                    field.setValue(value || 'N/A');

                    return field;
                }

                return field;
            });
        }
    }

    @action
    setItem(item: Item) {
        this.item = item;
    }

    @action setNewNoteValue(value: string) {
        this.note = value;
    }

    @action
    setAnalysisFields(analysisFields: AnalysisField[]) {
        this.analysisFields = analysisFields;
    }

    @action
    setDecisionLabelToApply(label: LABEL) {
        this.decisionLabelToApply = label;
    }

    @action
    setIsConfirmationModalOpen(isOpen: boolean) {
        this.isConfirmationModalOpen = isOpen;
    }

    @action
    openConfirmationModal() {
        this.setIsConfirmationModalOpen(true);
    }

    @action
    closeConfirmationModal() {
        this.setIsConfirmationModalOpen(false);
    }

    @action
    openResultModal() {
        this.isResultModalOpen = true;
    }

    @action
    closeResultModal() {
        this.isResultModalOpen = false;
    }

    @action
    openMakeDecisionModal() {
        this.isMakeDecisionModalOpen = true;
    }

    @action
    closeMakeDecisionModal() {
        this.isMakeDecisionModalOpen = false;
    }

    @action
    setQueueId(queueId: string) {
        this.queueId = queueId;
    }

    @action
    setSearchId(searchId: string) {
        this.searchId = searchId;
    }

    @action
    resetSelectedItems() {
        this.mrItemsStore.resetSelectedItems();
    }

    async loadMoreAnalysisItems(type: ANALYSIS_RESULT_ITEMS) {
        if (this.searchId.length) {
            this.loadAnalysisItems(type, true);
        }
    }

    async refreshAnalysisFieldCounts() {
        this.mrItemsStore.clearStore();
        this.dfpItemsStore.clearStore();

        await this.fetchLinkAnalysisAndUpdateValues();

        this.mrItemsStore.fetchItems(this.searchId);
        this.dfpItemsStore.fetchItems(this.searchId);
    }

    /**
     * Reaction, reacts to changes in selected analysis fields
     */
    reactOnSelectedAnalysisFields() {
        return reaction(() => this.selectedAnalysisFieldsIds, async selectedAnalysisFieldsIds => {
            this.mrItemsStore.clearStore();
            this.dfpItemsStore.clearStore();

            await this.fetchLinkAnalysisAndUpdateValues();

            if (selectedAnalysisFieldsIds.length && this.searchId.length) {
                this.mrItemsStore.fetchItems(this.searchId);
                this.dfpItemsStore.fetchItems(this.searchId);
            }
        }, {
            fireImmediately: true,
            name: 'reactOnSelectedAnalysisFields',
            equals: (a: string[], b: string[]) => a.length === b.length
        });
    }

    private async loadAnalysisItems(type: ANALYSIS_RESULT_ITEMS, loadMore = false) {
        if (type === ANALYSIS_RESULT_ITEMS.MR) {
            this.mrItemsStore.fetchItems(this.searchId, loadMore);
        }

        if (type === ANALYSIS_RESULT_ITEMS.DFP) {
            this.dfpItemsStore.fetchItems(this.searchId, loadMore);
        }
    }

    @action
    private getLinkAnalysisFieldsFromStaticConfig() {
        return Array
            .from(ANALYSIS_FIELDS_CONFIG.values())
            .map(fieldConfig => new AnalysisField(fieldConfig));
    }
}
