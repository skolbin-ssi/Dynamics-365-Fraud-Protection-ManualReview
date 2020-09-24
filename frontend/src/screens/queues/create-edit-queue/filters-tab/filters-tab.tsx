// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component, FormEvent, createRef } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { Text } from '@fluentui/react/lib/Text';
import { CommandBarButton, ActionButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { TagPicker, ITag, IBasePicker } from '@fluentui/react/lib/Pickers';

import { CreateEditQueueField } from '../create-edit-queue-field/create-edit-queue-field';
import { QueueMutationModalStore } from '../../../../view-services/essence-mutation-services';
import { Filter, FilterValidator } from '../../../../models';
import { QUEUE_ITEMS_FIELD, QUEUE_MUTATION_TYPES, FILTER_VALUE_CONSTRAINTS } from '../../../../constants';
import { RangeSlider } from '../../../../components/range-picker/range-slider';

import './filters-tab.scss';

interface FilterTabProps {
    queueMutationModalStoreInstance: QueueMutationModalStore;
}

const CN = 'filters-tab';

@observer
export class FiltersTab extends Component<FilterTabProps, never> {
    @autobind
    onAddFilterClick(field: QUEUE_ITEMS_FIELD) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.addFilter(field);
    }

    @autobind
    onRemoveFilterClick(field: QUEUE_ITEMS_FIELD) {
        const { queueMutationModalStoreInstance } = this.props;
        queueMutationModalStoreInstance.queueMutationStore.removeFilter(field);
    }

    getTagFromText(text: string): ITag {
        return {
            name: text,
            key: text
        };
    }

    getTextFromTag(tag: ITag): string {
        return tag.name;
    }

    @autobind
    renderFraudScoreFilter(filter: Filter, isBlocked: boolean): JSX.Element | void {
        const { queueMutationModalStoreInstance } = this.props;
        const {
            name,
            description,
            values,
            validators
        } = filter;
        const field = filter.field as QUEUE_ITEMS_FIELD;
        const { queueMutationStore } = queueMutationModalStoreInstance;

        const [currentMin, currentMax] = values;
        const [minConstraint, maxConstraint] = FILTER_VALUE_CONSTRAINTS.get(QUEUE_ITEMS_FIELD.SCORE)!;

        const setMinValue = (value: number | string) => {
            queueMutationStore.setNumericRangeFilterValue({
                field,
                value: value.toString(),
                type: 'min'
            });
        };

        const onChangeMinValue = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { value } = event.target as HTMLInputElement;
            setMinValue(value);
        };

        const setMaxValue = (value: number | string) => {
            queueMutationStore.setNumericRangeFilterValue({
                field,
                value: value.toString(),
                type: 'max'
            });
        };

        const onChangeMaxValue = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { value } = event.target as HTMLInputElement;
            setMaxValue(value);
        };

        return (
            <CreateEditQueueField
                key={name}
                title={name}
                description={description}
                showDeleteBtn={!isBlocked}
                onDeleteClick={() => this.onRemoveFilterClick(field as QUEUE_ITEMS_FIELD)}
                className={`${CN}__filter`}
            >
                <>
                    <div className={`${CN}__num-range-inputs`}>
                        <div className={`${CN}__num-range-text-inputs`}>
                            <TextField
                                className={`${CN}__num-range-input`}
                                value={currentMin || ''}
                                onChange={onChangeMinValue}
                                disabled={isBlocked}
                            />
                            <hr />
                            <TextField
                                className={`${CN}__num-range-input`}
                                value={currentMax || ''}
                                onChange={onChangeMaxValue}
                                disabled={isBlocked}
                            />
                        </div>
                        <RangeSlider
                            className={`${CN}__num-range-slider`}
                            currentMin={+currentMin || 0}
                            currentMax={+currentMax || 0}
                            overallMin={minConstraint}
                            overallMax={maxConstraint}
                            onMinValueChanged={setMinValue}
                            onMaxValueChanged={setMaxValue}
                            disabled={isBlocked}
                        />
                    </div>
                    { this.renderValidatorErrors(validators) }
                </>
            </CreateEditQueueField>
        );
    }

    renderOrderAmountFilter(filter: Filter, isBlocked: boolean) {
        const { queueMutationModalStoreInstance } = this.props;
        const {
            name,
            description,
            values,
            validators
        } = filter;
        const field = filter.field as QUEUE_ITEMS_FIELD;

        const onChangeMinValue = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { value } = event.target as HTMLInputElement;
            queueMutationModalStoreInstance.queueMutationStore.setNumericRangeFilterValue({
                field,
                value,
                type: 'min',
                allowDecimal: true
            });
        };
        const onChangeMaxValue = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { value } = event.target as HTMLInputElement;
            queueMutationModalStoreInstance.queueMutationStore.setNumericRangeFilterValue({
                field,
                value,
                type: 'max',
                allowDecimal: true
            });
        };

        return (
            <CreateEditQueueField
                key={name}
                title={name}
                description={description}
                showDeleteBtn={!isBlocked}
                onDeleteClick={() => this.onRemoveFilterClick(field as QUEUE_ITEMS_FIELD)}
                className={`${CN}__filter`}
            >
                <>
                    <div className={`${CN}__num-range-inputs`}>
                        <div className={`${CN}__num-range-text-inputs`}>
                            <TextField
                                className={`${CN}__num-range-input`}
                                value={values[0] || ''}
                                onChange={onChangeMinValue}
                                disabled={isBlocked}
                            />
                            <hr />
                            <TextField
                                className={`${CN}__num-range-input`}
                                value={values[1] || ''}
                                onChange={onChangeMaxValue}
                                disabled={isBlocked}
                            />
                        </div>
                    </div>
                    { this.renderValidatorErrors(validators) }
                </>
            </CreateEditQueueField>
        );
    }

    @autobind
    renderSKUsFilter(filter: Filter, isBlocked: boolean) {
        const { queueMutationModalStoreInstance } = this.props;
        const {
            name,
            description,
            values,
            validators
        } = filter;
        const field = filter.field as QUEUE_ITEMS_FIELD;
        const { SKUInput } = queueMutationModalStoreInstance.queueMutationStore;

        const getSuggestions = async (term: string, selectedItems?: ITag[]) => {
            const textSuggestions = await queueMutationModalStoreInstance.queueMutationStore.getSKUSuggestions(term);
            const filteredTextSuggestions = textSuggestions.filter((suggestion: string) => !selectedItems?.find(selected => selected.name === suggestion));
            return filteredTextSuggestions.map(this.getTagFromText);
        };

        const getAllSuggestions = (selectedItems?: ITag[]) => getSuggestions('', selectedItems);

        const onChange = (items?: ITag[]) => {
            if (items) {
                const newValues = items.map(item => item.name);
                queueMutationModalStoreInstance.queueMutationStore.setMultiValuesFilterValues({ field, values: newValues });
            }
        };

        const onInputChange = (newValue: string) => {
            queueMutationModalStoreInstance.queueMutationStore.setSKUInput(newValue);
            return newValue;
        };

        const selectedItems = values.map(this.getTagFromText);

        const inputRef = createRef<IBasePicker<ITag>>();

        const addCustomSKU = (value: string) => {
            queueMutationModalStoreInstance.queueMutationStore.createCustomSKU(value);
            queueMutationModalStoreInstance.queueMutationStore.addMultiValuesFilterValue({ field, value });
            queueMutationModalStoreInstance.queueMutationStore.setSKUInput('');
            inputRef.current?.completeSuggestion(true);
        };

        const renderNoSuggestionsFound = () => (
            <div className={`${CN}__no-sku-found`}>
                {
                    values.includes(SKUInput)
                        ? <Text className={`${CN}__no-sku-found-text`}>{`Custom SKU "${SKUInput}" is already in the list`}</Text>
                        : (
                            <>
                                <Text className={`${CN}__no-sku-found-text`}>No SKUs found</Text>
                                <ActionButton
                                    className={`${CN}__add-custom-sku-btn`}
                                    iconProps={{ iconName: 'AddTo' }}
                                    onClick={() => addCustomSKU(SKUInput)}
                                >
                                    { `Add custom SKU "${SKUInput}"` }
                                </ActionButton>
                            </>
                        )
                }
            </div>
        );

        return (
            <CreateEditQueueField
                key={name}
                title={name}
                description={description}
                showDeleteBtn={!isBlocked}
                onDeleteClick={() => this.onRemoveFilterClick(field as QUEUE_ITEMS_FIELD)}
                className={`${CN}__filter`}
            >
                <>
                    <TagPicker
                        componentRef={inputRef}
                        onResolveSuggestions={getSuggestions}
                        onEmptyResolveSuggestions={getAllSuggestions}
                        getTextFromItem={this.getTextFromTag}
                        pickerSuggestionsProps={{
                            suggestionsHeaderText: 'Suggested SKUs',
                            onRenderNoResultFound: renderNoSuggestionsFound
                        }}
                        selectedItems={selectedItems}
                        onInputChange={onInputChange}
                        onChange={onChange}
                        disabled={isBlocked}
                        createGenericItem={this.getTagFromText}
                        onValidateInput={() => 0}
                        resolveDelay={250}
                    />
                    { this.renderValidatorErrors(validators) }
                </>
            </CreateEditQueueField>
        );
    }

    @autobind
    renderCountryFilter(filter: Filter, isBlocked: boolean) {
        const { queueMutationModalStoreInstance } = this.props;
        const {
            name,
            description,
            values,
            validators
        } = filter;
        const field = filter.field as QUEUE_ITEMS_FIELD;

        const getSuggestions = async (term?: string, selectedItems?: ITag[]) => {
            const textSuggestions = await queueMutationModalStoreInstance.queueMutationStore.getCountrySuggestions(term);
            const filteredTextSuggestions = textSuggestions.filter((suggestion: string) => !selectedItems?.find(selected => selected.name === suggestion));
            return filteredTextSuggestions.map(this.getTagFromText);
        };

        const getAllSuggestions = (selectedItems?: ITag[]) => getSuggestions('', selectedItems);

        const onChange = (items?: ITag[]) => {
            if (items) {
                const newValues = items.map(item => item.name);
                queueMutationModalStoreInstance.queueMutationStore.setMultiValuesFilterValues({ field, values: newValues });
            }
        };

        const selectedItems = values.map(this.getTagFromText);

        return (
            <CreateEditQueueField
                key={name}
                title={name}
                description={description}
                showDeleteBtn={!isBlocked}
                onDeleteClick={() => this.onRemoveFilterClick(field as QUEUE_ITEMS_FIELD)}
                className={`${CN}__filter`}
            >
                <>
                    <TagPicker
                        onResolveSuggestions={getSuggestions}
                        onEmptyResolveSuggestions={getAllSuggestions}
                        getTextFromItem={this.getTextFromTag}
                        pickerSuggestionsProps={{
                            suggestionsHeaderText: 'Suggested countries',
                            noResultsFoundText: 'No countries found'
                        }}
                        selectedItems={selectedItems}
                        onChange={onChange}
                        disabled={isBlocked}
                        resolveDelay={250}
                    />
                    { this.renderValidatorErrors(validators) }
                </>
            </CreateEditQueueField>
        );
    }

    renderValidatorErrors(validators: FilterValidator[]) {
        return (
            <div className={`${CN}__validation-errors`}>
                {
                    validators.filter(validator => !validator.isPassed).map(validator => (
                        <Text variant="smallPlus" className={`${CN}__validator-error`} key={`${validator.filterField} ${validator.type}`}>
                            { validator.errorMessage }
                        </Text>
                    ))
                }
            </div>
        );
    }

    render() {
        const { queueMutationModalStoreInstance } = this.props;
        const { queueMutationStore } = queueMutationModalStoreInstance;
        const { fields, mutationType, availableFilterTypes } = queueMutationStore;
        const { filters } = fields;
        const areFiltersBlocked = mutationType === QUEUE_MUTATION_TYPES.UPDATE;
        const addFilterMenuItems = availableFilterTypes.map(filterType => ({
            key: filterType.name,
            text: filterType.name,
            onClick: () => this.onAddFilterClick(filterType.field as QUEUE_ITEMS_FIELD),
            disabled: filterType.isUsed
        }));

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
                {
                    filters.map(filter => {
                        switch (filter.field) {
                            case QUEUE_ITEMS_FIELD.SCORE: {
                                return this.renderFraudScoreFilter(filter, areFiltersBlocked);
                            }
                            case QUEUE_ITEMS_FIELD.TOTAL_AMOUNT: {
                                return this.renderOrderAmountFilter(filter, areFiltersBlocked);
                            }
                            case QUEUE_ITEMS_FIELD.PRODUCT_SKU: {
                                return this.renderSKUsFilter(filter, areFiltersBlocked);
                            }
                            case QUEUE_ITEMS_FIELD.USER_COUNTRY: {
                                return this.renderCountryFilter(filter, areFiltersBlocked);
                            }
                            default:
                                return null;
                        }
                    })
                }
                {
                    !areFiltersBlocked && (
                        <>
                            <hr className={`${CN}__add-another-condition-delimeter`} />
                            <CommandBarButton
                                className={`${CN}__add-another-condition-btn`}
                                text="Add another condition"
                                iconProps={{ iconName: 'Add' }}
                                menuProps={{ items: addFilterMenuItems }}
                            />
                        </>
                    )
                }
            </>
        );
    }
}
