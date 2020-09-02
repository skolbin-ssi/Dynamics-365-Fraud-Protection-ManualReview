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
public class ItemLock implements Serializable  {
    private OffsetDateTime locked;
    private String ownerId;
    private String queueId;
    private String queueViewId;

    public void lock(String queueId, String queueViewId, String actor) {
        this.ownerId = actor;
        this.queueId = queueId;
        this.queueViewId = queueViewId;
        this.locked = OffsetDateTime.now();
    }

    public void unlock() {
        this.ownerId = null;
        this.queueId = null;
        this.queueViewId = null;
        this.locked = null;
    }
}
