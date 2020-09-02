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
public class ItemLabel implements Serializable {
    private Label value;
    private String authorId;
    private String queueId;
    private String queueViewId;
    private OffsetDateTime labeled;

    public void label(Label label, String authorId, String queueId, String queueViewId) {
        this.value = label;
        this.authorId = authorId;
        this.queueId = queueId;
        this.queueViewId = queueViewId;
        this.labeled = OffsetDateTime.now();
    }
}
