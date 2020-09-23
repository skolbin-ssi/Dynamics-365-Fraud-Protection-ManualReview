// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.ItemLockActivityEntity;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import lombok.Builder;
import lombok.Data;

import java.time.Duration;

/**
 * Aggregating entity for storing information on how much time
 * was spent on the item to be labeled and how many times it was
 * released from the lock.
 */
@Builder
@Data
public class LockTimeBucket {
    /**
     * The reason of lock/release.
     */
    private LockActionType actionType;
    /**
     * The sum of periods that items were in locked state.
     * </p>
     * Summary duration of differences
     * {@link ItemLockActivityEntity#getLocked()} and
     * {@link ItemLockActivityEntity#getReleased()} dates.
     */
    private Duration totalDuration;
    /**
     * Shows how many locks were released with specified reason.
     * </p>
     * Count of {@link ItemLockActivityEntity}s.
     */
    private int cnt;
}
