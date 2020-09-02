package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Alert;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.model.ThresholdOperator.*;

/**
 * Metrics corresponds to those that are present on Dashboard. Used
 * to determine the {@link Alert}'s check condition.
 */
@RequiredArgsConstructor
@Getter
public enum MetricType {
    APPROVE_ACCURACY(
            Set.of(LESS_THAN, GREATER_THAN),
            true,
            true
    ),
    APPROVAL_RATE(
            Set.of(LESS_THAN, GREATER_THAN),
            true,
            true
    );

    private final Set<ThresholdOperator> thresholdOperators;
    private final boolean acceptAnalysts;
    private final boolean acceptQueues;
}
