package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemLabelingMetricDTO {

    @Builder.Default
    private int reviewed = 0;
    @Builder.Default
    private int approved = 0;
    @Builder.Default
    private int rejected = 0;
    @Builder.Default
    private int watched = 0;
    @Builder.Default
    private int escalated = 0;
    @Builder.Default
    private int held = 0;
    @Builder.Default
    private int other = 0;
    @Builder.Default
    private int approveOverturned = 0;
    @Builder.Default
    private int rejectOverturned = 0;
}
