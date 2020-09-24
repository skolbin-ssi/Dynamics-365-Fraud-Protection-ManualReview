// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.ItemPlacementBucket;
import org.springframework.lang.NonNull;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

public interface ItemPlacementActivityRepositoryCustomMethods {
    List<ItemPlacementBucket> getPlacementMetrics(
            @NonNull final OffsetDateTime startDateTime,
            @NonNull final OffsetDateTime endDateTime,
            @NonNull final Duration aggregation,
            final Set<String> queueIds);
}
