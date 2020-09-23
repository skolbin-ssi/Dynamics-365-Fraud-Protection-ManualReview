// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import cn from 'classnames';

import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { TextField } from '@fluentui/react/lib/TextField';
import { SpinButton } from '@fluentui/react/lib/SpinButton';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Text } from '@fluentui/react/lib/Text';

import {
    SORTING_FIELD,
    SORTING_FIELD_DISPLAY,
    SORTING_ORDER,
    QUEUE_MUTATION_TYPES,
    LABEL
} from '../../../../constants';
import { LockButton } from '../lock-button/lock-button';
import { QueueMutationModalStore } from '../../../../view-services/essence-mutation-services';
import { CreateEditQueueField } from '../create-edit-queue-field/create-edit-queue-field';

import './general-tab.scss';

interface SortBy extends IDropdownOption {
    key: SORTING_FIELD;
}

interface SortDirection extends IDropdownOption {
    key: SORTING_ORDER;
}

interface GeneralTabProps {
    queueMutationModalStoreInstance: QueueMutationModalStore;
}

const CN = 'general-tab';

@observer
export class GeneralTab extends Component<GeneralTabProps, never> {
    private sortByOptions: SortBy[] = [
        { text: SORTING_FIELD_DISPLAY[SORTING_FIELD.SCORE], key: SORTING_FIELD.SCORE },
        { text: SORTING_FIELD_DISPLAY[SORTING_FIELD.IMPORT_DATE], key: SORTING_FIELD.IMPORT_DATE }
    ];

    private sortDirectionOptions: SortDirection[] = [
        { text: 'Ascending order', key: SORTING_ORDER.ASC },
        { text: 'Descending order', key: SORTING_ORDER.DESC }
    ];

    @autobind
    handleNameChange(_: unknown, newName?: string) {
        if (newName !== undefined) {
            const { queueMutationModalStoreInstance } = this.props;
            queueMutationModalStoreInstance.queueMutationStore.changeName(newName);
        }
    }

    @autobind
    handleLockOrganizationToggled() {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.toggleIsOrderOrganizationLocked();
    }

    @autobind
    handleSortByChange(_: unknown, option: IDropdownOption | undefined) {
        // There will asways be a value, thus so many "as"
        const valueToSet = (option as IDropdownOption).key as SORTING_FIELD;
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.changeSortBy(valueToSet);
    }

    @autobind
    handleSortDirectionChange(_: unknown, option: IDropdownOption | undefined) {
        // There will asways be a value, thus so many "as"
        const valueToSet = (option as IDropdownOption).key as SORTING_ORDER;
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.changeSortDirection(valueToSet);
    }

    @autobind
    handleProcessingDeadlineToggled() {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.toggleIsProcessingDeadlineUsed();
    }

    @autobind
    incrementProcessingDeadlineDaysChanged(value: string) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.changeProcessingDeadline(value, 'days', 'incr');
    }

    @autobind
    decrementProcessingDeadlineDaysChanged(value: string) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.changeProcessingDeadline(value, 'days', 'decr');
    }

    @autobind
    incrementProcessingDeadlineHoursChanged(value: string) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.changeProcessingDeadline(value, 'hours', 'incr');
    }

    @autobind
    decrementProcessingDeadlineHoursChanged(value: string) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.changeProcessingDeadline(value, 'hours', 'decr');
    }

    @autobind
    validateProcessingDeadlineDaysManualInput(value: string) {
        const { queueMutationModalStoreInstance } = this.props;
        const { processingDeadlineDays } = queueMutationModalStoreInstance.queueMutationStore.fields;
        queueMutationModalStoreInstance.queueMutationStore.changeProcessingDeadline(value, 'days');
        return `${processingDeadlineDays} day${processingDeadlineDays === 1 ? '' : 's'}`;
    }

    @autobind
    validateProcessingDeadlineHoursManualInput(value: string) {
        const { queueMutationModalStoreInstance } = this.props;
        const { processingDeadlineHours } = queueMutationModalStoreInstance.queueMutationStore.fields;
        queueMutationModalStoreInstance.queueMutationStore.changeProcessingDeadline(value, 'hours');
        return `${processingDeadlineHours} hour${processingDeadlineHours === 1 ? '' : 's'}`;
    }

    @autobind
    handleLabelToggled(label: LABEL[]) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.changeLabelToggledState(label);
    }

    render() {
        const { queueMutationModalStoreInstance } = this.props;
        const {
            queueMutationStore,
            blockDisablingProcessingDeadline,
            blockUpdatingProcessingDeadline,
            blockNameChange
        } = queueMutationModalStoreInstance;
        const {
            fields,
            labelObjects,
            isDeadlineChanged,
            mutationType
        } = queueMutationStore;

        const {
            name,
            sortBy,
            sortDirection,
            enableProcessingDeadline,
            processingDeadlineDays,
            processingDeadlineHours,
            sortingLocked
        } = fields;

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
                    <TextField
                        required
                        label="Queue name"
                        value={name}
                        onChange={this.handleNameChange}
                        className={`${CN}__name-field`}
                        disabled={blockNameChange}
                    />
                </CreateEditQueueField>
                <CreateEditQueueField
                    className={`${CN}__field`}
                    title="Orders organization"
                >
                    <div className={`${CN}__order-organization`}>
                        <LockButton
                            className={`${CN}__order-organization-buttons`}
                            onToggle={this.handleLockOrganizationToggled}
                            isLocked={sortingLocked}
                            disabled={mutationType === QUEUE_MUTATION_TYPES.UPDATE}
                        />
                        <ul className={`${CN}__order-organization-explanation`}>
                            <li>
                                {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                                If you want to allow arbitrary order processing, select <strong>unlocked</strong> option. Queue orders will be sorted by import date.
                            </li>
                            <li>
                                {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                                If you need to set a restricted order processing, select the <strong>locked</strong> option.
                            </li>
                        </ul>
                        {
                            sortingLocked && (
                                <>
                                    <Dropdown
                                        label="Sort by"
                                        selectedKey={sortBy}
                                        onChange={this.handleSortByChange}
                                        options={this.sortByOptions}
                                        className={`${CN}__order-sort-by`}
                                        disabled={mutationType === QUEUE_MUTATION_TYPES.UPDATE}
                                    />
                                    <Dropdown
                                        selectedKey={sortDirection}
                                        onChange={this.handleSortDirectionChange}
                                        options={this.sortDirectionOptions}
                                        className={`${CN}__order-sort-direction`}
                                        disabled={mutationType === QUEUE_MUTATION_TYPES.UPDATE}
                                    />
                                </>
                            )
                        }
                    </div>
                </CreateEditQueueField>
                <CreateEditQueueField className={`${CN}__field`}>
                    <>
                        <div className={`${CN}__processing-deadline`}>
                            <div>
                                <Checkbox
                                    label="Processing deadline"
                                    checked={enableProcessingDeadline}
                                    onChange={this.handleProcessingDeadlineToggled}
                                    className={`${CN}__enable-processing-deadline`}
                                    disabled={blockDisablingProcessingDeadline}
                                />
                                <Text>Deadline:&nbsp;&nbsp;</Text>
                            </div>
                            <div>
                                <SpinButton
                                    className={cn(`${CN}__deadline-picker`, { disabled: !enableProcessingDeadline })}
                                    onIncrement={this.incrementProcessingDeadlineDaysChanged}
                                    onDecrement={this.decrementProcessingDeadlineDaysChanged}
                                    value={`${processingDeadlineDays} day${processingDeadlineDays === 1 ? '' : 's'}`}
                                    onValidate={this.validateProcessingDeadlineDaysManualInput}
                                    disabled={!enableProcessingDeadline || blockUpdatingProcessingDeadline}
                                />
                                <SpinButton
                                    className={cn(`${CN}__deadline-picker`, { disabled: !enableProcessingDeadline })}
                                    onIncrement={this.incrementProcessingDeadlineHoursChanged}
                                    onDecrement={this.decrementProcessingDeadlineHoursChanged}
                                    value={`${processingDeadlineHours} hour${processingDeadlineHours === 1 ? '' : 's'}`}
                                    onValidate={this.validateProcessingDeadlineHoursManualInput}
                                    disabled={!enableProcessingDeadline || blockUpdatingProcessingDeadline}
                                />
                            </div>
                        </div>
                        {
                            isDeadlineChanged && (
                                <MessageBar
                                    messageBarType={MessageBarType.warning}
                                    isMultiline={false}
                                    className={`${CN}__deadline-warning`}
                                >
                                    Please note that changing the deadline time will affect the processing
                                </MessageBar>
                            )
                        }
                    </>
                </CreateEditQueueField>
                <CreateEditQueueField
                    className={`${CN}__field`}
                    title="Decision labels"
                    description="Each queue can be set up for different decision scenarios."
                >
                    <div className={`${CN}__label-field`}>
                        {
                            labelObjects.map(label => (
                                <Checkbox
                                    label={label.name}
                                    checked={label.value}
                                    onChange={() => this.handleLabelToggled(label.type)}
                                    className={cn(`${CN}__labels-field-item`, { disabled: label.disabled })}
                                    key={`create-queue-label-field-${label.name}`}
                                    disabled={label.disabled}
                                />
                            ))
                        }
                    </div>
                </CreateEditQueueField>
            </>
        );
    }
}
