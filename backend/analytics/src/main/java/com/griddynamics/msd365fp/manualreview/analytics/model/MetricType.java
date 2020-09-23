// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Alert;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.model.ThresholdOperator.GREATER_THAN;
import static com.griddynamics.msd365fp.manualreview.analytics.model.ThresholdOperator.LESS_THAN;

/**
 * Metrics corresponds to those that are present on Dashboard. Used
 * to determine the {@link Alert}'s check condition.
 */
@RequiredArgsConstructor
@Getter
public enum MetricType {
    AVERAGE_OVERTURN_RATE(
            Set.of(LESS_THAN, GREATER_THAN),
            true,
            true
    ),
    GOOD_DECISION_RATE(
            Set.of(LESS_THAN, GREATER_THAN),
            true,
            true
    ),
    BAD_DECISION_RATE(
            Set.of(LESS_THAN, GREATER_THAN),
            true,
            true
    );

    private final Set<ThresholdOperator> thresholdOperators;
    private final boolean acceptAnalysts;
    private final boolean acceptQueues;
}
