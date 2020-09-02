package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemLabelingTimeProgressMetricsDTO {
    private ItemLabelingTimeMetricDTO currentPeriod;
    private ItemLabelingTimeMetricDTO previousPeriod;
}
