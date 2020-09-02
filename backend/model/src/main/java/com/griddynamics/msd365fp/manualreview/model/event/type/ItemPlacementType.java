package com.griddynamics.msd365fp.manualreview.model.event.type;

/**
 * Indicates the type operation which was performed on the item
 * while it was active in the Queue BE.
 */
public enum ItemPlacementType implements ActionType {
    /**
     * Item was added to the queue.
     */
    ADDED,
    /**
     * Item was released from the queue.
     */
    RELEASED
}
