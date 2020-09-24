// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

import { Persona, PersonaSize, IPersonaProps } from '@fluentui/react/lib/Persona';
import { BasePicker, IBasePickerProps } from '@fluentui/react/lib/Pickers';
import { IChoiceGroupOption, ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup';
import { FontIcon } from '@fluentui/react/lib/Icon';

import {
    DASHBOARD_SEARCH_OPTIONS,
    DASHBOARD_SEARCH_DISPLAY_OPTIONS
} from '../../../../constants';
import { User } from '../../../../models/user';
import { DashboardScreenStore } from '../../../../view-services/dashboard';
import { Queue } from '../../../../models';

import './dashboard-search.scss';

const CN = 'dashboard-search';

const DASHBOARD_SEARCH_CHOICE_OPTIONS: IChoiceGroupOption[] = [
    {
        key: DASHBOARD_SEARCH_OPTIONS.QUEUES,
        text: DASHBOARD_SEARCH_DISPLAY_OPTIONS[DASHBOARD_SEARCH_OPTIONS.QUEUES]
    },
    {
        key: DASHBOARD_SEARCH_OPTIONS.ANALYSTS,
        text: DASHBOARD_SEARCH_DISPLAY_OPTIONS[DASHBOARD_SEARCH_OPTIONS.ANALYSTS]
    }
];

interface SearchProps {
    dashboardScreenStore: DashboardScreenStore,
    onQueueSearchChange(queue: Queue): void,
    onAnalystSearchChange(analyst: IPersonaProps): void,
}

interface SearchState {
    searchOption: DASHBOARD_SEARCH_OPTIONS
}

@observer
export class DashboardSearch extends Component<SearchProps, SearchState> {
    static mapUserToPersonaProps(user: User) {
        return {
            id: user.id,
            text: user.name,
            secondaryText: user.email ? user.email : `UPN: ${user.upn}`,
            showSecondaryText: !!user.upn,
            imageUrl: user.imageUrl
        };
    }

    constructor(props: SearchProps) {
        super(props);

        this.state = {
            searchOption: DASHBOARD_SEARCH_OPTIONS.QUEUES
        };
    }

    @autobind
    handleSearchOptionChange(option: IChoiceGroupOption | undefined) {
        if (option) {
            this.setState({
                searchOption: (option.key as DASHBOARD_SEARCH_OPTIONS),
            });
        }
    }

    @autobind
    handleAnalystSelectionChange(analysts: IPersonaProps[] | undefined) {
        const { onAnalystSearchChange } = this.props;

        if (analysts?.length) {
            onAnalystSearchChange(analysts[0]);
        }
    }

    @autobind
    handleQueueSelectionChange(queues: Queue[] | undefined) {
        const { onQueueSearchChange } = this.props;

        if (queues?.length) {
            onQueueSearchChange(queues[0]);
        }
    }

    @autobind
    resolveUsersSuggestions(filterText: string): IPersonaProps[] {
        const { dashboardScreenStore: { users } } = this.props;
        if (users) {
            const filteredUsers = users
                .filter(user => user.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
            return filteredUsers.map(DashboardSearch.mapUserToPersonaProps);
        }

        return [];
    }

    @autobind
    resolveEmptyUsersSuggestions(): IPersonaProps[] {
        const { dashboardScreenStore: { users } } = this.props;
        if (users) {
            return users
                .sort((userA, userB) => userA.name.localeCompare(userB.name))
                .map(DashboardSearch.mapUserToPersonaProps);
        }

        return [];
    }

    @autobind
    resolveQueueSuggestions(filterText: string): Queue[] {
        const { dashboardScreenStore: { queueStore: { queues } } } = this.props;
        if (queues) {
            return queues
                .filter(item => item.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
        }

        return [];
    }

    @autobind
    resolveEmptyQueueSuggestions(): Queue[] {
        const { dashboardScreenStore: { queueStore: { queues } } } = this.props;
        return queues || [];
    }

    renderQueueSuggestionItem(queue: Queue) {
        return (
            <div className={`${CN}__queue-suggestion-item`}>
                {queue.name}
            </div>
        );
    }

    renderSearch() {
        const { searchOption } = this.state;

        switch (searchOption) {
            case DASHBOARD_SEARCH_OPTIONS.QUEUES:
                return this.renderQueuePicker();
            case DASHBOARD_SEARCH_OPTIONS.ANALYSTS:
                return this.renderAnalystPicker();
            default:
                return null;
        }
    }

    renderAnalystPicker() {
        return (
            <BasePicker
                <IPersonaProps, IBasePickerProps<IPersonaProps>>
                inputProps={{
                    placeholder: 'Find a Queue or an Analyst',
                    className: `${CN}__input`
                }}
                selectedItems={[]}
                onResolveSuggestions={this.resolveUsersSuggestions}
                onEmptyResolveSuggestions={this.resolveEmptyUsersSuggestions}
                onChange={this.handleAnalystSelectionChange}
                pickerSuggestionsProps={{
                    suggestionsHeaderText: 'Suggested Analysts',
                    noResultsFoundText: 'No Analysts found',
                    className: `${CN}__assignment-suggestion`
                }}
                itemLimit={1}
                className={`${CN}__search`}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                onRenderSuggestionsItem={props => (<Persona {...props} size={PersonaSize.size28} className={`${CN}__selector-persona`} />)}
            />
        );
    }

    renderQueuePicker() {
        return (
            <BasePicker
                <Queue, IBasePickerProps<Queue>>
                inputProps={{
                    placeholder: 'Find a Queue or an Analyst',
                    className: `${CN}__input`
                }}
                selectedItems={[]}
                onResolveSuggestions={this.resolveQueueSuggestions}
                onEmptyResolveSuggestions={this.resolveEmptyQueueSuggestions}
                onChange={this.handleQueueSelectionChange}
                pickerSuggestionsProps={{
                    suggestionsHeaderText: 'Suggested Queues',
                    noResultsFoundText: 'No Queues found',
                    className: `${CN}__assignment-suggestion`
                }}
                itemLimit={1}
                className={`${CN}__search`}
                onRenderSuggestionsItem={this.renderQueueSuggestionItem}
            />
        );
    }

    render() {
        return (
            <div className={CN}>
                <div className={`${CN}__search-icon-container`}>
                    <FontIcon
                        iconName="Search"
                        className={`${CN}__search-icon`}
                    />
                </div>
                {this.renderSearch()}
                <ChoiceGroup
                    className={`${CN}__search-options`}
                    styles={{
                        flexContainer: `${CN}__group-container`
                    }}
                    defaultSelectedKey={DASHBOARD_SEARCH_OPTIONS.QUEUES}
                    options={DASHBOARD_SEARCH_CHOICE_OPTIONS}
                    onChange={(ev, option) => this.handleSearchOptionChange(option)}
                />
            </div>
        );
    }
}
