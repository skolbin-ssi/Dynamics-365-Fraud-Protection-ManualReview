package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import com.griddynamics.msd365fp.manualreview.analytics.model.MetricType;
import com.griddynamics.msd365fp.manualreview.analytics.model.ThresholdOperator;
import lombok.Data;

import java.util.Set;

@Data
public class AlertMetricDTO {
    private MetricType metricType;
    private Set<ThresholdOperator> thresholdOperators;
    private boolean acceptAnalysts;
    private boolean acceptQueues;
}
