package com.griddynamics.msd365fp.manualreview.model.event.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Indicates the type of lock which was performed on the item
 * while it was reviewed by an analyst in the Queue BE.
 */
@RequiredArgsConstructor
public enum LockActionType implements ActionType {
    /**
     * Lock setup action.
     */
    SETUP(false, false),
    /**
     * Lock release via labeling action.
     */
    LABEL_APPLIED_RELEASE(false, true),
    /**
     * Lock release via lock timeout functionality.
     */
    TIMEOUT_RELEASE(true, true),
    /**
     * Lock release because of the manual end of review.
     */
    MANUAL_RELEASE(true, true),
    /**
     * Lock release because of item or queue deletion.
     */
    DELETION_RELEASE(false, true);

    /**
     * Flag specifies that the action reckon to be time waste
     * for the analyst who was reviewing the locked item.
     */
    @Getter
    private final boolean wasted;
    /**
     * Flag specifies whether the action was a lock release or
     * lock setup.
     */
    @Getter
    private final boolean release;
}
