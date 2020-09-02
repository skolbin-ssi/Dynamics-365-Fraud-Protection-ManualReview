/* eslint-disable react/prop-types */

import React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { PrimaryButton } from '@fluentui/react/lib/Button';

import './start-review-panel.scss';
import { ReviewNotes } from '../review-notes/review-notes';
import { Note } from '../../../models';

interface StartReviewPanelProps {
    /**
     * isQueueSortingLocked - indicates whether sorting in queue is locked
     */
    isQueueSortingLocked: boolean
    notes: Note[];
    isReviewAllowed: boolean;
    reasonToPreventReview?: JSX.Element | string;

    onStartReviewCallback(): void
}

const CN = 'start-review-panel';

export const StartReviewPanel: React.FC<StartReviewPanelProps> = (
    {
        onStartReviewCallback,
        isQueueSortingLocked,
        notes,
        isReviewAllowed,
        reasonToPreventReview
    }
) => {
    function renderMessageBar(node: JSX.Element | string) {
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

    function renderReviewBlock() {
        // eslint-disable-next-line no-constant-condition
        if (isQueueSortingLocked) {
            return renderMessageBar(
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

    return (
        <div className={CN}>
            {isReviewAllowed ? renderReviewBlock() : renderMessageBar(reasonToPreventReview!)}
            <ReviewNotes
                className={`${CN}__user-notes`}
                notes={notes}
            />
        </div>
    );
};
