import { DefaultPalette, DefaultFontStyles } from '@fluentui/react/lib/Styling';
import { IStackStyles } from '@fluentui/react/lib/Stack';
import { ISearchBoxStyles } from '@fluentui/react/lib/SearchBox';
import { IButtonStyles } from '@fluentui/react/lib/Button';
import { IIconStyles } from '@fluentui/react/lib/Icon';
import { IPersonaStyles } from '@fluentui/react/lib/Persona';
import { ITextStyles } from '@fluentui/react/lib/Text';

import { customConstants } from '../../../styles/variables';

export const headerStackStyles: IStackStyles = {
    root: {
        background: DefaultPalette.themePrimary,
        height: customConstants.headerHeight
    }
};

export const regularButtonStyles: Partial<IButtonStyles> = {
    root: {
        color: DefaultPalette.white,
        width: customConstants.headerHeight,
        height: customConstants.headerHeight
    },
    rootHovered: {
        background: 'inherit',
        color: DefaultPalette.white
    },
    rootPressed: {
        background: 'inherit',
        color: DefaultPalette.white
    },
};

export const regularButtonIconStyles: Partial<IIconStyles> = {
    root: {
        fontSize: DefaultFontStyles.xLarge.fontSize
    }
};

export const enlargedButtonIconStyles: Partial<IIconStyles> = {
    root: {
        fontSize: DefaultFontStyles.xxLarge.fontSize
    }
};

export const headingStyles: ITextStyles = {
    root: {
        color: DefaultPalette.white,
        paddingLeft: 8
    }
};

export const searchBoxStyles: Partial<ISearchBoxStyles> = {
    root: {
        width: 500,
        opacity: 0.8
    },
    icon: {
        color: DefaultPalette.themeDarker
    },
    field: {
        color: DefaultPalette.themeDarker,
        selectors: {
            '&::placeholder': {
                color: DefaultPalette.themeDarker
            }
        }
    }
};

export const userNameTextStyles: Partial<ITextStyles> = {
    root: {
        color: DefaultPalette.white,
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export const personaIconStyles: Partial<IPersonaStyles> = {
    root: {
        cursor: 'pointer',
        padding: '0 10px'
    }
};
