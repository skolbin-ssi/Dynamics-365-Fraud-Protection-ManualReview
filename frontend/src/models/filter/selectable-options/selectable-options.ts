// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { ACCEPTABLE_CONDITIONS } from '../../../constants';

export interface ConditionDropdownOption extends IDropdownOption {
    /**
     * key - unique id to identify the item, Acceptable condition
     */
    key: ACCEPTABLE_CONDITIONS;
    text: string;
}

export interface ConditionContextualMenuItem extends IContextualMenuItem {
    /**
     * key - unique id to identify the item, Acceptable condition
     */
    key: ACCEPTABLE_CONDITIONS;
    text: string;
}

export interface FilterContextualMenuItem extends IContextualMenuItem {
    /**
     * key - unique id to identify the item, filter id
     */
    key: string;
    text: string
}
