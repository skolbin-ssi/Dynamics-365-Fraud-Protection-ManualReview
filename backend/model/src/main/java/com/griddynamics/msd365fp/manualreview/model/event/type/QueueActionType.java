package com.griddynamics.msd365fp.manualreview.model.event.type;

/**
 * Indicates the type operation which was performed on the queue
 * while it was active in the Queue BE.
 */
public enum QueueActionType implements ActionType {
    /**
     * Queue's size was changed by some action (e.g. item was labeled
     * or item was enriched with queue-filter-fitting values).
     */
    SIZE
}
