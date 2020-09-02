package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.Alert;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

/**
 * Threshold operator is used for the {@link Alert} conditions creation.
 */
@Getter
@RequiredArgsConstructor
public enum ThresholdOperator {
    LESS_THAN, GREATER_THAN;
}
