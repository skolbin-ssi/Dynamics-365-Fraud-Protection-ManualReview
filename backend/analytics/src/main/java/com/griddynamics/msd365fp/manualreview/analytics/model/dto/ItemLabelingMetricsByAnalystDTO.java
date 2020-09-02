package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemLabelingMetricsByAnalystDTO {
    private String id;
    @Deprecated
    private String displayName; //TODO: delete
    private Map<OffsetDateTime, ItemLabelingMetricDTO> data;
    private ItemLabelingMetricDTO total;
}
