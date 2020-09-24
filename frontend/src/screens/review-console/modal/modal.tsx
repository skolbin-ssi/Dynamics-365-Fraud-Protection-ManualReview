// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* eslint-disable react/prop-types */

import React from 'react';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { IModalProps, Modal } from '@fluentui/react/lib/Modal';
import { Text } from '@fluentui/react/lib/Text';
import './modal.scss';

interface ModalProps {
    isOpen: boolean;
    headerText?: string;
    closeIcon?: boolean;
    onClose?(): void
}

const CN = 'review-modal';

export const ReviewModal: React.FC<ModalProps & IModalProps> = ({
    closeIcon, onClose, isOpen, children, headerText
}) => (
    <Modal
        containerClassName={CN}
        onDismiss={onClose}
        isOpen={isOpen}
    >
        <div className={`${CN}__content`}>
            <div className={`${CN}__header`}>
                {headerText && (
                    <Text variant="xLarge">
                        {headerText}
                    </Text>
                )}
                {closeIcon && (
                    <FontIcon
                        className={`${CN}__close-icon`}
                        iconName="Cancel"
                        onClick={onClose}
                    />
                )}
            </div>
            <div className={`${CN}__children`}>
                {children}
            </div>
        </div>
    </Modal>
);
