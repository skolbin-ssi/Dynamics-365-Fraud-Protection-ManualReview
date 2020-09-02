package com.griddynamics.msd365fp.manualreview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ItemEscalation implements Serializable  {
    private OffsetDateTime escalated;
    private String reviewerId;
    private String queueId;
}
