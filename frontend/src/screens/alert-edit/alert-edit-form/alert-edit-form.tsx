// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ActionButton, IconButton } from '@fluentui/react/lib/Button';
import {
    DetailsList,
    DetailsListLayoutMode,
    DetailsRow,
    IColumn,
    SelectionMode
} from '@fluentui/react/lib/DetailsList';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IPersonaProps, Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import {
    IBasePicker,
    NormalPeoplePicker,
    TagPicker,
    ITag
} from '@fluentui/react/lib/Pickers';
import { Text } from '@fluentui/react/lib/Text';
import { TextField } from '@fluentui/react/lib/TextField';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import React, { Component, createRef, RefObject } from 'react';
import {
    ALERT_METRIC_TYPE,
    ALERT_METRIC_TYPE_DISPLAY,
    ALERT_THRESHOLD_OPERATOR,
    ALERT_THRESHOLD_OPERATOR_DISPLAY,
    PERIOD_DURATION_TYPE,
    PERIOD_DURATION_TYPE_DISPLAY
} from '../../../constants';
import { Alert, Queue, User } from '../../../models';
import './alert-edit-form.scss';
import { AlertsMutationStore } from '../../../view-services';
import { AlertEditFormPart } from './form-part';

const CN = 'alert-edit-form';

interface AlertEditFormProps {
    alert: Alert;
    alertsMutationStore: AlertsMutationStore;
}

interface MetricType extends IDropdownOption {
    key: ALERT_METRIC_TYPE;
}

interface PeriodType extends IDropdownOption {
    key: PERIOD_DURATION_TYPE;
}

interface ThresholdType extends IDropdownOption {
    key: ALERT_THRESHOLD_OPERATOR;
}

interface AlertEditFormState {
    showAnalystSelector: boolean;
    showQueuesSelector: boolean;
}

@observer
export class AlertEditForm extends Component<AlertEditFormProps, AlertEditFormState> {
    private peoplePickerRef: RefObject<IBasePicker<IPersonaProps>> = createRef();

    private queuesPickerRef: RefObject<IBasePicker<ITag>> = createRef();

    private metricOptions: MetricType[] = [
        { text: ALERT_METRIC_TYPE_DISPLAY[ALERT_METRIC_TYPE.AVERAGE_OVERTURN_RATE], key: ALERT_METRIC_TYPE.AVERAGE_OVERTURN_RATE },
        { text: ALERT_METRIC_TYPE_DISPLAY[ALERT_METRIC_TYPE.GOOD_DECISION_RATE], key: ALERT_METRIC_TYPE.GOOD_DECISION_RATE },
        { text: ALERT_METRIC_TYPE_DISPLAY[ALERT_METRIC_TYPE.BAD_DECISION_RATE], key: ALERT_METRIC_TYPE.BAD_DECISION_RATE }
    ];

    private periodType: PeriodType[] = [
        { text: PERIOD_DURATION_TYPE_DISPLAY[PERIOD_DURATION_TYPE.YEARS], key: PERIOD_DURATION_TYPE.YEARS },
        { text: PERIOD_DURATION_TYPE_DISPLAY[PERIOD_DURATION_TYPE.MONTHS], key: PERIOD_DURATION_TYPE.MONTHS },
        { text: PERIOD_DURATION_TYPE_DISPLAY[PERIOD_DURATION_TYPE.WEEKS], key: PERIOD_DURATION_TYPE.WEEKS },
        { text: PERIOD_DURATION_TYPE_DISPLAY[PERIOD_DURATION_TYPE.DAYS], key: PERIOD_DURATION_TYPE.DAYS },
        { text: PERIOD_DURATION_TYPE_DISPLAY[PERIOD_DURATION_TYPE.HOURS], key: PERIOD_DURATION_TYPE.HOURS },
        { text: PERIOD_DURATION_TYPE_DISPLAY[PERIOD_DURATION_TYPE.MINUTES], key: PERIOD_DURATION_TYPE.MINUTES }
    ];

    private thresholdType: ThresholdType[] = [
        { text: ALERT_THRESHOLD_OPERATOR_DISPLAY[ALERT_THRESHOLD_OPERATOR.LESS_THAN], key: ALERT_THRESHOLD_OPERATOR.LESS_THAN },
        { text: ALERT_THRESHOLD_OPERATOR_DISPLAY[ALERT_THRESHOLD_OPERATOR.GREATER_THAN], key: ALERT_THRESHOLD_OPERATOR.GREATER_THAN }
    ];

    private analyticColumns: IColumn[] = [
        {
            key: 'name',
            name: '',
            minWidth: 300,
            maxWidth: 600,
            onRender: (item: User) => {
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
            key: 'remove',
            name: '',
            minWidth: 30,
            maxWidth: 30,
            isPadded: false,
            className: `${CN}__assignments-remove-cell`,
            onRender: (item: User) => (
                <IconButton
                    iconProps={{ iconName: 'ChromeClose' }}
                    onClick={() => this.handleReviewerRemoved(item.id as string)}
                    className={`${CN}__assignments-remove-button`}
                />
            ),
        },
    ];

    private queueColumns: IColumn[] = [
        {
            key: 'name',
            name: '',
            minWidth: 300,
            maxWidth: 600,
            onRender: (item: Queue) => {
                const { name } = item;

                return (
                    <div className={`${CN}__assignments-name-cell`}>
                        {name}
                    </div>
                );
            }
        },
        {
            key: 'remove',
            name: '',
            minWidth: 30,
            maxWidth: 30,
            isPadded: false,
            className: `${CN}__assignments-remove-cell`,
            onRender: (item: Queue) => (
                <IconButton
                    iconProps={{ iconName: 'ChromeClose' }}
                    onClick={() => this.handleQueueRemoved(item.queueId as string)}
                    className={`${CN}__assignments-remove-button`}
                />
            ),
        },
    ];

    constructor(props: AlertEditFormProps) {
        super(props);

        this.state = {
            showAnalystSelector: false,
            showQueuesSelector: false
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
    handleAddQueueClick() {
        this.setState({ showQueuesSelector: true }, () => {
            const { current } = this.queuesPickerRef;
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
    handleQueueSelectorBlur() {
        this.setState({ showQueuesSelector: false });
    }

    @autobind
    handleReviewerSelected(personas: IPersonaProps[] | undefined) {
        if (personas) {
            const [persona] = personas;
            const { alertsMutationStore } = this.props;
            alertsMutationStore.addAnalyst(persona.id as string);
            this.setState({ showAnalystSelector: false });
        }
    }

    @autobind
    handleQueueSelected(queues: ITag[] | undefined) {
        if (queues) {
            const [queue] = queues;
            const { alertsMutationStore } = this.props;
            alertsMutationStore.addQueue(queue.key as string);
            this.setState({ showQueuesSelector: false });
        }
    }

    @autobind
    handleNameChange(_: unknown, newName?: string) {
        if (newName !== undefined) {
            const { alertsMutationStore } = this.props;
            alertsMutationStore.setName(newName);
        }
    }

    @autobind
    handleMetricTypeChange(_: unknown, option: IDropdownOption | undefined) {
        // There will always be a value, thus so many "as"
        const valueToSet = (option as IDropdownOption).key as ALERT_METRIC_TYPE;
        const { alertsMutationStore } = this.props;
        alertsMutationStore.setMetricType(valueToSet);
    }

    @autobind
    handlePeriodValueChange(_: unknown, newPeriodValue?: string) {
        const { alertsMutationStore, alert } = this.props;
        if (newPeriodValue !== undefined) {
            const numberValue = parseInt(newPeriodValue, 10);
            alertsMutationStore.setPeriod(numberValue || 0, alert.periodDurationType);
        } else {
            alertsMutationStore.setPeriod(0, alert.periodDurationType);
        }
    }

    @autobind
    handlePeriodTypeChange(_: unknown, option: IDropdownOption | undefined) {
        // There will always be a value, thus so many "as"
        const valueToSet = (option as IDropdownOption).key as PERIOD_DURATION_TYPE;
        const { alertsMutationStore, alert } = this.props;
        alertsMutationStore.setPeriod(alert.periodBiggestDuration, valueToSet);
    }

    @autobind
    handleThresholdOperatorChange(_: unknown, option: IDropdownOption | undefined) {
        // There will always be a value, thus so many "as"
        const valueToSet = (option as IDropdownOption).key as ALERT_THRESHOLD_OPERATOR;
        const { alertsMutationStore } = this.props;
        alertsMutationStore.setThresholdOperator(valueToSet);
    }

    @autobind
    handleThresholdValueChange(_: unknown, newValue?: string) {
        if (newValue !== undefined) {
            const { alertsMutationStore } = this.props;
            const numberValue = parseInt(newValue, 10);
            alertsMutationStore.setThresholdValue(numberValue || 0);
        }
    }

    @autobind
    handleReviewerRemoved(id: string) {
        const { alertsMutationStore } = this.props;
        alertsMutationStore.removeAnalyst(id);
    }

    @autobind
    handleQueueRemoved(id: string) {
        const { alertsMutationStore } = this.props;
        alertsMutationStore.removeQueue(id);
    }

    @autobind
    resolveAnalystSuggestions(filterText: string): IPersonaProps[] {
        const { alertsMutationStore } = this.props;
        const { nonSelectedAnalysts } = alertsMutationStore;
        const filteredUsers = nonSelectedAnalysts
            .filter(user => user.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
        return filteredUsers.map(user => user.asPersona);
    }

    @autobind
    resolveQueuesSuggestions(filterText: string): ITag[] {
        const { alertsMutationStore } = this.props;
        const { nonSelectedQueues } = alertsMutationStore;
        const filteredQueues = nonSelectedQueues
            .filter(queue => queue.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
        return filteredQueues.map(queue => queue.asTag);
    }

    @autobind
    resolveEmptyAnalystSuggestions(): IPersonaProps[] {
        const { alertsMutationStore } = this.props;
        const { nonSelectedAnalysts } = alertsMutationStore;
        return nonSelectedAnalysts
            .sort((userA, userB) => userA.name.localeCompare(userB.name))
            .map(user => user.asPersona);
    }

    @autobind
    resolveEmptyQueuesSuggestions(): ITag[] {
        const { alertsMutationStore } = this.props;
        const { nonSelectedQueues } = alertsMutationStore;
        return nonSelectedQueues
            .sort((queueA, queueB) => queueA.name.localeCompare(queueB.name))
            .map(user => user.asTag);
    }

    render() {
        const { alert, alertsMutationStore } = this.props;
        const { showAnalystSelector, showQueuesSelector } = this.state;
        const {
            name,
            metricType,
            periodBiggestDuration,
            periodDurationType,
            thresholdOperator,
            thresholdValue
        } = alert;
        const {
            analyticModels,
            queueModels
        } = alertsMutationStore;

        return (
            <div className={CN}>
                <AlertEditFormPart>
                    <TextField
                        required
                        label="Alert name"
                        value={name}
                        onChange={this.handleNameChange}
                        className={`${CN}__name-field`}
                    />
                </AlertEditFormPart>
                <AlertEditFormPart
                    title="Analyze"
                    contentClassName={`${CN}__analyze-content`}
                >
                    <>
                        <Dropdown
                            label="Metric"
                            selectedKey={metricType}
                            onChange={this.handleMetricTypeChange}
                            options={this.metricOptions}
                            className={`${CN}__metric-type`}
                        />
                        <TextField
                            label="Period"
                            value={periodBiggestDuration.toString()}
                            onChange={this.handlePeriodValueChange}
                            className={`${CN}__period-value-field`}
                        />
                        <Dropdown
                            label="&nbsp;"
                            selectedKey={periodDurationType}
                            onChange={this.handlePeriodTypeChange}
                            options={this.periodType}
                            className={`${CN}__period-type-field`}
                        />
                        <Dropdown
                            label="Threshold"
                            selectedKey={thresholdOperator}
                            onChange={this.handleThresholdOperatorChange}
                            options={this.thresholdType}
                            className={`${CN}__threshold-type`}
                        />
                        <TextField
                            label="Value"
                            value={thresholdValue.toString()}
                            onChange={this.handleThresholdValueChange}
                            className={`${CN}__threshold-value-field`}
                        />
                    </>
                </AlertEditFormPart>
                <AlertEditFormPart title="Scope">
                    <>
                        <div className={`${CN}__scope-section`}>
                            <Text variant="large" className={`${CN}__sub-title`}>Queues</Text>
                            <br />
                            <Text variant="medium" className={`${CN}__sub-title-description`}>
                                Please select queues where a notification should be applied. If not queues are selected, a notification will be applied to all queues.
                            </Text>
                            {
                                queueModels.length
                                    ? (
                                        <DetailsList
                                            items={queueModels}
                                            compact
                                            columns={this.queueColumns}
                                            layoutMode={DetailsListLayoutMode.justified}
                                            selectionMode={SelectionMode.none}
                                            isHeaderVisible={false}
                                            className={`${CN}__analyst-table`}
                                            /* eslint-disable-next-line react/jsx-props-no-spreading */
                                            onRenderRow={props => <DetailsRow {...props as any} className={`${CN}__analyst-table-row`} />}
                                        />
                                    )
                                    : (
                                        <div className={`${CN}__no-analysts`}>
                                            <Text>No selected queues</Text>
                                        </div>
                                    )
                            }

                            {
                                showQueuesSelector
                                    ? (
                                        <div>
                                            <TagPicker
                                                onResolveSuggestions={this.resolveQueuesSuggestions}
                                                onEmptyResolveSuggestions={this.resolveEmptyQueuesSuggestions}
                                                onChange={this.handleQueueSelected}
                                                pickerSuggestionsProps={{
                                                    suggestionsHeaderText: 'Suggested Queues',
                                                    noResultsFoundText: 'No Queues found',
                                                    className: `${CN}__analysts-suggestion`
                                                }}
                                                inputProps={{
                                                    placeholder: 'Find a queue'
                                                }}
                                                itemLimit={1}
                                                className={`${CN}__analysts-people-selector`}
                                                componentRef={this.queuesPickerRef}
                                                onBlur={this.handleQueueSelectorBlur}
                                                // eslint-disable-next-line react/jsx-props-no-spreading
                                                onRenderSuggestionsItem={(queue: ITag) => (
                                                    <span>{queue.name}</span>
                                                )}
                                            />
                                        </div>
                                    )
                                    : (
                                        <ActionButton
                                            text="Add queue"
                                            onClick={this.handleAddQueueClick}
                                            iconProps={{ iconName: 'Add' }}
                                        />
                                    )
                            }

                        </div>

                        <div className={`${CN}__scope-section`}>
                            <Text variant="large" className={`${CN}__sub-title`}>Analysts</Text>
                            {
                                analyticModels.length
                                    ? (
                                        <DetailsList
                                            items={analyticModels}
                                            compact
                                            columns={this.analyticColumns}
                                            layoutMode={DetailsListLayoutMode.justified}
                                            selectionMode={SelectionMode.none}
                                            isHeaderVisible={false}
                                            className={`${CN}__analyst-table`}
                                            /* eslint-disable-next-line react/jsx-props-no-spreading */
                                            onRenderRow={props => <DetailsRow {...props as any} className={`${CN}__analyst-table-row`} />}
                                        />
                                    )
                                    : (
                                        <div className={`${CN}__no-analysts`}>
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
                                                    className: `${CN}__analysts-suggestion`
                                                }}
                                                inputProps={{
                                                    placeholder: 'Find an analyst'
                                                }}
                                                itemLimit={1}
                                                className={`${CN}__analysts-people-selector`}
                                                componentRef={this.peoplePickerRef}
                                                onBlur={this.handleAnalystSelectorBlur}
                                                /* eslint-disable-next-line react/jsx-props-no-spreading */
                                                onRenderSuggestionsItem={(props: IPersonaProps) => <Persona {...props as any} size={PersonaSize.size28} className={`${CN}__selector-persona`} />}
                                            />
                                        </div>
                                    )
                                    : (
                                        <ActionButton
                                            text="Add analyst"
                                            onClick={this.handleAddAnalystClick}
                                            iconProps={{ iconName: 'Add' }}
                                        />
                                    )
                            }
                        </div>
                    </>
                </AlertEditFormPart>
            </div>
        );
    }
}
