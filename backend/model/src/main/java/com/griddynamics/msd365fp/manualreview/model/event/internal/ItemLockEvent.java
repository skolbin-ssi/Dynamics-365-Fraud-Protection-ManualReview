package com.griddynamics.msd365fp.manualreview.model.event.internal;

import com.griddynamics.msd365fp.manualreview.model.event.Event;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ItemLockEvent implements Event {
    private String id;
    private String queueId;
    private String queueViewId;
    private String ownerId;
    private OffsetDateTime locked;
    private OffsetDateTime released;
    private LockActionType actionType;
}
