// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { PrimaryButton } from '@fluentui/react/lib/Button';

import './start-review-panel.scss';
import { ReviewNotes } from '../review-notes/review-notes';
import { Note } from '../../../models';

interface StartReviewPanelProps {
    /**
     * isItemReviewLocked - indicates whether item review is prohibited,
     * for instance in locked queues.
     */
    isItemReviewLocked: boolean
    notes: Note[];
    isActiveItem?: boolean;
    isReviewAllowed: boolean;
    reasonToPreventReview?: JSX.Element | string;

    onStartReviewCallback(): void
}

const CN = 'start-review-panel';

@observer
export class StartReviewPanel extends Component<StartReviewPanelProps, never> {
    static renderMessageBar(node: JSX.Element | string) {
        return (
            <MessageBar
                className={`${CN}__warning-message`}
                messageBarType={MessageBarType.warning}
                messageBarIconProps={{ iconName: 'Warning', className: `${CN}__warning-message-icon` }}
            >
                {node}
            </MessageBar>
        );
    }

    renderReviewBlock() {
        const {
            onStartReviewCallback,
            isItemReviewLocked,
            isActiveItem
        } = this.props;

        if (!isActiveItem) return null;

        if (isItemReviewLocked) {
            return StartReviewPanel.renderMessageBar(
                <>
                    It is not allowed to review transactions in random order because the queue is locked.
                    However, you can&nbsp;
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                    <span
                        className={`${CN}__start-review-link`}
                        role="link"
                        tabIndex={0}
                        onClick={onStartReviewCallback}
                    >
                        <abbr title="start-review">start review</abbr>
                    </span>
                    &nbsp;transactions according to the queue sorting configuration.
                </>
            );
        }

        return (
            <div className={`${CN}__start-review-btn-wrap`}>
                <PrimaryButton
                    primary
                    className={`${CN}__start-review-button`}
                    onClick={onStartReviewCallback}
                    text="Review this order"
                />
            </div>
        );
    }

    render() {
        const {
            notes,
            isReviewAllowed,
            reasonToPreventReview
        } = this.props;

        return (
            <div className={CN}>
                {isReviewAllowed
                    ? this.renderReviewBlock()
                    : StartReviewPanel.renderMessageBar(reasonToPreventReview!)}
                <ReviewNotes
                    className={`${CN}__user-notes`}
                    notes={notes}
                />
            </div>
        );
    }
}
