// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IPanelStyles } from '@fluentui/react/lib/Panel';
import { IButtonStyles } from '@fluentui/react/lib/Button';
import { DefaultPalette } from '@fluentui/react/lib/Styling';
import { ITextStyles } from '@fluentui/react/lib/Text';
import { customConstants } from '../../styles/variables';

export const myAccountPanelStyles: Partial<IPanelStyles> = {
    root: {
        top: customConstants.headerHeight
    },
    main: {
        backgroundColor: DefaultPalette.neutralLighterAlt
    },
    content: {
        padding: 0
    }
};

export const signOutButtonStyles: Partial<IButtonStyles> = {
    root: {
        padding: 0,
        borderWidth: 0,
        height: 'auto'
    },
    label: {
        margin: 0
    }
};

export const userNameTextStyles: Partial<ITextStyles> = {
    root: {
        fontWeight: '600',
        padding: '0 0 4px 0'
    }
};

export const emailTextStyles: Partial<ITextStyles> = {
    root: {
        padding: '0 0 6px 0'
    }
};
