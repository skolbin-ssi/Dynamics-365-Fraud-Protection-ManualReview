// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPlacementMetricsByQueueDTO {
    private String id;
    @Deprecated
    private String name; //TODO: delete
    private Map<OffsetDateTime, ItemPlacementMetricDTO> data;
    private ItemPlacementMetricDTO total;
}
