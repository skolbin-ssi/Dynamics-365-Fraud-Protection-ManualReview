// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component, createRef, RefObject } from 'react';
import { resolve } from 'inversify-react';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';

import { Text } from '@fluentui/react/lib/Text';
import { IBasePicker, ITag, TagPicker } from '@fluentui/react/lib/Pickers';
import { ActionButton } from '@fluentui/react/lib/Button';

import { FiltersStore } from '../../../../view-services/essence-mutation-services/filters-store';
import { InCondition } from '../../../../models/filter/conditions';
import { TYPES } from '../../../../types';

import './text-in-condition.scss';

interface TextInConditionComponentProps {
    filterId: string;
    condition: InCondition;
}

interface TextFilterComponentState {
    input: string;
}

const CN = 'text-in-condition';

@observer
export class TextInCondition extends Component<TextInConditionComponentProps, TextFilterComponentState> {
    @resolve(TYPES.FILTERS_STORE)
    private filtersStore!: FiltersStore;

    private inputRef: RefObject<IBasePicker<ITag>> = createRef();

    constructor(props: TextInConditionComponentProps) {
        super(props);

        this.state = {
            input: ''
        };
    }

    @autobind
    onInputChange(input: string) {
        this.setState({ input });
        return input;
    }

    @autobind
    onChange(items?: ITag[]) {
        const { condition } = this.props;

        if (items) {
            const newValues = items.map(item => item.name);
            condition.setValues(newValues);
        }
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
    async getSuggestions(filter: string, selectedItems?: ITag[]) {
        const { filterId } = this.props;

        const existedSuggestions = await this.filtersStore.getDictionaryValues(filterId, filter);
        const filteredTextSuggestions = existedSuggestions
            .filter(suggestion => !selectedItems?.find(selected => selected.name === suggestion));

        return filteredTextSuggestions.map(this.getTagFromText);
    }

    @autobind
    async getAllSuggestions(selectedItems?: ITag[]) {
        return this.getSuggestions('', selectedItems);
    }

    @autobind
    addCustomItem(input: string) {
        const { filterId, condition } = this.props;

        this.filtersStore.postDictionaryValues(filterId, input);

        if (condition) {
            condition.setValue(input);
        }

        this.inputRef.current?.completeSuggestion(true);

        this.setState({ input: '' });
    }

    @autobind
    renderNoSuggestionFound() {
        const { condition: { values } } = this.props;

        const { input } = this.state;

        return (
            <div className={`${CN}__no-sku-found`}>
                {
                    values.includes(input)
                        ? <Text className={`${CN}__no-sku-found-text`}>{`Custom input: "${input}" is already in the list`}</Text>
                        : (
                            <>
                                <Text className={`${CN}__no-sku-found-text`}>No results found</Text>
                                <ActionButton
                                    iconProps={{ iconName: 'AddTo' }}
                                    onClick={() => this.addCustomItem(input)}
                                >
                                    { `Add custom item "${input}"` }
                                </ActionButton>
                            </>
                        )
                }
            </div>
        );
    }

    // TODO: Move to a separate component
    renderValidatorErrors() {
        const { condition } = this.props;

        const inValidResults = condition
            .validate()
            .filter(result => !result.isValid);

        if (inValidResults.length) {
            return (
                <div className={`${CN}__validation-errors`}>
                    {
                        inValidResults.map(result => (
                            <Text
                                key={result.errorMessage}
                                variant="smallPlus"
                                className={`${CN}__validator-error`}
                            >
                                { result.errorMessage }
                            </Text>
                        ))
                    }
                </div>
            );
        }

        return null;
    }

    render() {
        const { condition } = this.props;

        return (
            <div
                key={condition.id}
                className={CN}
            >
                <TagPicker
                    componentRef={this.inputRef}
                    onResolveSuggestions={this.getSuggestions}
                    onEmptyResolveSuggestions={this.getAllSuggestions}
                    getTextFromItem={this.getTextFromTag}
                    pickerSuggestionsProps={{
                        suggestionsHeaderText: 'Suggested items',
                        onRenderNoResultFound: this.renderNoSuggestionFound
                    }}
                    selectedItems={condition.mappedValuesToTags}
                    onInputChange={this.onInputChange}
                    onChange={this.onChange}
                    disabled={false}
                    createGenericItem={this.getTagFromText}
                    resolveDelay={250}
                />
                { this.renderValidatorErrors() }
            </div>
        );
    }
}
