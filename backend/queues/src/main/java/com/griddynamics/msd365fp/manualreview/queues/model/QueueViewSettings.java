package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.*;

import java.io.Serializable;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueueViewSettings implements Serializable {
    private QueueViewType viewType;
    private String viewId;
}
