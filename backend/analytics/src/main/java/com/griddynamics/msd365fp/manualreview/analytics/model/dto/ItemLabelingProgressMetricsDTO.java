package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemLabelingProgressMetricsDTO {
    private ItemLabelingMetricDTO currentPeriod;
    private ItemLabelingMetricDTO previousPeriod;
    private ItemLabelingMetricDTO annualIncludingPeriod;
    private ItemLabelingMetricDTO annualBeforePeriod;
}
