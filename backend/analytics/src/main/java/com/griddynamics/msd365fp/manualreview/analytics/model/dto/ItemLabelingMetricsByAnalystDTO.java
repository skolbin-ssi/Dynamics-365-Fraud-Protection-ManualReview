// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import com.griddynamics.msd365fp.manualreview.analytics.model.AnalystDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemLabelingMetricsByAnalystDTO {
    private String id;
    private Map<OffsetDateTime, ItemLabelingMetricDTO> data;
    private List<AnalystDetails> details;
    private ItemLabelingMetricDTO total;
}
