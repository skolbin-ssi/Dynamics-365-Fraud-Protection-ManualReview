// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.LockTimeBucket;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import org.springframework.lang.NonNull;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

public interface ItemLockActivityRepositoryCustomMethods {

    /**
     * Calculate overall spent time by provided query parameters.
     * Buckets are separated by lock action reasons
     * (see {@link LockActionType}).
     *
     * @param startDateTime a time bound
     * @param endDateTime   a time bound
     * @param analystIds    a list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @param queueIds      list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @return the list of buckets
     */
    List<LockTimeBucket> getSpentTime(@NonNull OffsetDateTime startDateTime,
                                      @NonNull OffsetDateTime endDateTime,
                                      Set<String> analystIds,
                                      Set<String> queueIds);
}
