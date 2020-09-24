// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

import { Text } from '@fluentui/react/lib/Text';
import { Toggle } from '@fluentui/react/lib/Toggle';
import {
    DetailsList,
    IColumn,
    DetailsListLayoutMode,
    SelectionMode,
    DetailsRow
} from '@fluentui/react/lib/DetailsList';
import { Persona, PersonaSize, IPersonaProps } from '@fluentui/react/lib/Persona';
import { IBasePicker, NormalPeoplePicker } from '@fluentui/react/lib/Pickers';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';

import { QueueMutationModalStore } from '../../../../view-services/essence-mutation-services';
import { CreateEditQueueField } from '../create-edit-queue-field/create-edit-queue-field';
import { QueueAssignee } from '../../../../models';

import './assign-tab.scss';

interface AssignTabProps {
    queueMutationModalStoreInstance: QueueMutationModalStore;
}

interface AssignTabOwnState {
    showAnalystSelector: boolean;
}

const CN = 'assign-tab';

@observer
export class AssignTab extends Component<AssignTabProps, AssignTabOwnState> {
    private peoplePickerRef: RefObject<IBasePicker<IPersonaProps>> = createRef();

    constructor(props: AssignTabProps) {
        super(props);
        this.state = {
            showAnalystSelector: false
        };
    }

    @autobind
    handleAddAnalystClick() {
        this.setState({ showAnalystSelector: true }, () => {
            const { current } = this.peoplePickerRef;
            if (current) {
                current.focus();
            }
        });
    }

    @autobind
    handleAnalystSelectorBlur() {
        this.setState({ showAnalystSelector: false });
    }

    @autobind
    handleReviewerSelected(personas: IPersonaProps[] | undefined) {
        if (personas) {
            const [persona] = personas;
            const { queueMutationModalStoreInstance } = this.props;
            queueMutationModalStoreInstance.queueMutationStore.addAssignedReviewer(persona.id as string);
            this.setState({ showAnalystSelector: false });
        }
    }

    @autobind
    handleReviewerSupervisorChange(user: QueueAssignee) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.changeAssigneeRole(user, !user.isSupervisor);
    }

    @autobind
    handleReviewerRemoved(id: string) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.removeAssignedReviewer(id);
    }

    @autobind
    isLastSupervisor(item: QueueAssignee) {
        const { queueMutationModalStoreInstance } = this.props;
        const { queueMutationStore } = queueMutationModalStoreInstance;
        const { supervisors } = queueMutationStore.fields;

        if (supervisors.length > 1) {
            return false;
        }

        /**
         * Only in case when One supervisor left, disable toggre for particular assignee so it cannot be disabled.
         */
        return supervisors.includes(item.id);
    }

    @autobind
    resolveAnalystSuggestions(filterText: string): IPersonaProps[] {
        const { queueMutationModalStoreInstance } = this.props;
        const { nonSelectedReviewerModels } = queueMutationModalStoreInstance.queueMutationStore;
        const filteredUsers = nonSelectedReviewerModels
            .filter(user => user.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
        return filteredUsers.map(user => user.asPersona);
    }

    @autobind
    resolveEmptyAnalystSuggestions(): IPersonaProps[] {
        const { queueMutationModalStoreInstance } = this.props;
        const { nonSelectedReviewerModels } = queueMutationModalStoreInstance.queueMutationStore;
        return nonSelectedReviewerModels
            .sort((userA, userB) => userA.name.localeCompare(userB.name))
            .map(user => user.asPersona);
    }

    render() {
        const { showAnalystSelector } = this.state;
        const { queueMutationModalStoreInstance } = this.props;
        const { queueMutationStore } = queueMutationModalStoreInstance;
        const { selectedReviewerModels } = queueMutationStore;

        const columns: IColumn[] = [
            {
                key: 'name',
                name: '',
                minWidth: 300,
                maxWidth: 400,
                onRender: (item: QueueAssignee) => {
                    const {
                        id,
                        text,
                        secondaryText,
                        showSecondaryText,
                        imageUrl
                    } = item.asPersona;

                    return (
                        <div className={`${CN}__assignments-name-cell`}>
                            <Persona
                                id={id}
                                text={text}
                                secondaryText={secondaryText}
                                showSecondaryText={showSecondaryText}
                                imageUrl={imageUrl}
                                size={PersonaSize.size28}
                                className={`${CN}__selector-persona`}
                            />
                        </div>
                    );
                }
            },
            {
                key: 'supervisor',
                name: '',
                minWidth: 100,
                maxWidth: 100,
                onRender: (item: QueueAssignee) => (
                    <div className={`${CN}__assignments-supervisor-cell`}>
                        <Toggle
                            onText="On"
                            offText="Off"
                            checked={item.isSupervisor}
                            disabled={this.isLastSupervisor(item)}
                            onChange={() => this.handleReviewerSupervisorChange(item)}
                        />
                    </div>
                )
            },
            {
                key: 'remove',
                name: '',
                minWidth: 30,
                maxWidth: 30,
                isPadded: false,
                className: `${CN}__assignments-remove-cell`,
                onRender: (item: QueueAssignee) => (
                    <IconButton
                        disabled={this.isLastSupervisor(item)}
                        iconProps={{ iconName: 'ChromeClose' }}
                        onClick={() => this.handleReviewerRemoved(item.id as string)}
                        className={`${CN}__assignments-remove-button`}
                    />
                ),
            },
        ];

        return (
            <>
                <CreateEditQueueField
                    className={`${CN}__assignments-field`}
                    title="Analyst"
                    description="Supervisor"
                >
                    <>
                        {
                            selectedReviewerModels.length
                                ? (
                                    <DetailsList
                                        items={selectedReviewerModels}
                                        compact
                                        columns={columns}
                                        layoutMode={DetailsListLayoutMode.justified}
                                        selectionMode={SelectionMode.none}
                                        isHeaderVisible={false}
                                        className={`${CN}__assignments-table`}
                                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                                        onRenderRow={props => <DetailsRow {...props as any} className={`${CN}__assignments-table-row`} />}
                                    />
                                )
                                : (
                                    <div className={`${CN}__no-assignments`}>
                                        <Text>No selected analysts</Text>
                                    </div>
                                )
                        }
                        {
                            showAnalystSelector
                                ? (
                                    <div>
                                        <NormalPeoplePicker
                                            onResolveSuggestions={this.resolveAnalystSuggestions}
                                            onEmptyResolveSuggestions={this.resolveEmptyAnalystSuggestions}
                                            onChange={this.handleReviewerSelected}
                                            pickerSuggestionsProps={{
                                                suggestionsHeaderText: 'Suggested Analysts',
                                                noResultsFoundText: 'No Analysts found',
                                                className: `${CN}__assignment-suggestion`
                                            }}
                                            inputProps={{
                                                placeholder: 'Find an analyst'
                                            }}
                                            itemLimit={1}
                                            className={`${CN}__assignments-people-selector`}
                                            componentRef={this.peoplePickerRef}
                                            onBlur={this.handleAnalystSelectorBlur}
                                            /* eslint-disable-next-line react/jsx-props-no-spreading */
                                            onRenderSuggestionsItem={(props: IPersonaProps) => <Persona {...props as any} size={PersonaSize.size28} className={`${CN}__selector-persona`} />}
                                        />
                                    </div>
                                )
                                : (
                                    <DefaultButton
                                        text="Add analyst"
                                        onClick={this.handleAddAnalystClick}
                                        iconProps={{ iconName: 'CirclePlus' }}
                                    />
                                )
                        }
                    </>
                </CreateEditQueueField>
            </>
        );
    }
}
