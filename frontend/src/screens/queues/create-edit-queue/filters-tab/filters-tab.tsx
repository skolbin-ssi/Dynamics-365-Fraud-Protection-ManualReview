// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { Text } from '@fluentui/react/lib/Text';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

import { CreateEditQueueField } from '../create-edit-queue-field/create-edit-queue-field';
import { QUEUE_MUTATION_TYPES } from '../../../../constants';
import { CriteriaModal, FilterContextMenu, FilterSummary } from '../../../../components/filters';
import { QueueMutationModalStore } from '../../../../view-services/essence-mutation-services';
import { FiltersStore } from '../../../../view-services/essence-mutation-services/filters-store';

import './filters-tab.scss';

interface FilterTabProps {
    isDisabled: boolean,
    filtersStore: FiltersStore,
    queueMutationModalStoreInstance: QueueMutationModalStore;
}

interface FiltersTabState {}

const CN = 'filters-tab';

@observer
export class FiltersTab extends Component<FilterTabProps, FiltersTabState> {
    setMutatedFiltersToQueueMutationStore() {
        const {
            filtersStore: { mutatedFilters },
            queueMutationModalStoreInstance: { queueMutationStore }
        } = this.props;

        queueMutationStore.addFilters(mutatedFilters);
    }

    @autobind
    handleCloseModal() {
        const { filtersStore } = this.props;
        filtersStore.closeCriteriaModal();
    }

    @autobind
    handleOnCreateUpdateFilter() {
        const { filtersStore } = this.props;

        filtersStore.createUpdateFilter();
        this.setMutatedFiltersToQueueMutationStore();
    }

    @autobind
    handleFilterTileClick(filterId: string) {
        const { filtersStore } = this.props;

        filtersStore.updateFilter(filterId);
    }

    @autobind
    handleRemoveFilterClick(filterId: string) {
        const { filtersStore } = this.props;

        filtersStore.removeFilter(filterId);
        this.setMutatedFiltersToQueueMutationStore();
    }

    @autobind
    handleRemoveCategoryClick(category: string) {
        const { filtersStore } = this.props;

        filtersStore.removeCategory(category);
        this.setMutatedFiltersToQueueMutationStore();
    }

    @autobind
    handleFilterSummaryCriteriaDropdownChange(filterId: string) {
        const { filtersStore } = this.props;

        filtersStore.handleSelectedMenuFilterFromSubMenu(filterId);
    }

    renderFiltersSummaryTiles() {
        const { filtersStore: { categorizedMutatedFilters }, isDisabled } = this.props;

        return categorizedMutatedFilters.map(({ category, filters, contextualMenuItems }) => (
            <FilterSummary
                isDisabled={isDisabled}
                key={category}
                category={category}
                contextualMenuItems={contextualMenuItems}
                filters={filters}
                onTileClick={this.handleFilterTileClick}
                onTileRemoveClick={this.handleRemoveFilterClick}
                onRemoveCategoryClick={this.handleRemoveCategoryClick}
                onCriteriaDropdownChange={this.handleFilterSummaryCriteriaDropdownChange}
            />
        ));
    }

    renderCriteriaModal() {
        const { filtersStore } = this.props;
        const { isCriteriaModalOpen, selectedFilter } = filtersStore;

        return selectedFilter && (
            <CriteriaModal
                filter={selectedFilter}
                onCreateUpdateFilter={this.handleOnCreateUpdateFilter}
                onModalClose={this.handleCloseModal}
                isModalOpen={isCriteriaModalOpen}
            />
        );
    }

    render() {
        const { filtersStore: { categoriesFiltersListAsContextualMenuItems } } = this.props;
        const { queueMutationModalStoreInstance: { queueMutationStore: { mutationType } } } = this.props;

        const areFiltersBlocked = mutationType === QUEUE_MUTATION_TYPES.UPDATE;

        return (
            <>
                {
                    mutationType !== QUEUE_MUTATION_TYPES.UPDATE && (
                        <MessageBar
                            messageBarType={MessageBarType.warning}
                            messageBarIconProps={{ iconName: 'Warning', className: `${CN}__no-further-changes-warning-icon` }}
                            isMultiline
                            className={`${CN}__no-further-changes-warning`}
                        >
                            Please note that the following settings are not editable after creation: Lock options, Sorting, Filter configuration.
                        </MessageBar>
                    )
                }
                <CreateEditQueueField className={`${CN}__field`}>
                    <Text>
                        You should add rules to filter incoming orders.
                    </Text>
                </CreateEditQueueField>
                {this.renderFiltersSummaryTiles()}
                {
                    !areFiltersBlocked && (
                        <FilterContextMenu
                            className={`${CN}__filters-menu`}
                            buttonText="Add another condition"
                            items={categoriesFiltersListAsContextualMenuItems}
                        />
                    )
                }
                {this.renderCriteriaModal()}
            </>
        );
    }
}
