import React from 'react';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import './error-content.scss';

interface ErrorContentProps {
    /**
     * illustrationSvg - SVG image component
     */
    illustrationSvg: any;

    /**
     * message - Message provided under SVG image
     */
    message: string

    /**
     * buttonText - Text displayed on the button
     */
    buttonText?: string;

    /**
     * onClick - Callback function to be triggered by clicking button
     */
    onClick?: () => void;
}

const CN = 'error-content';

export const ErrorContent: React.FunctionComponent<ErrorContentProps> = ({
    illustrationSvg: SvgImage, message, buttonText, onClick
}: ErrorContentProps) => (
    <Stack horizontalAlign="center">
        <SvgImage className={`${CN}__image`} />
        <Stack.Item align="center">
            <Text className={`${CN}__text`}>{message}</Text>
        </Stack.Item>
        {
            buttonText && onClick
                ? (
                    <Stack.Item>
                        <PrimaryButton
                            className={`${CN}__btn`}
                            text={buttonText}
                            onClick={onClick}
                        />
                    </Stack.Item>
                )
                : null
        }
    </Stack>
);
