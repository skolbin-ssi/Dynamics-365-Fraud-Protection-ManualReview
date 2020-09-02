package com.griddynamics.msd365fp.manualreview.model.event.internal;

import com.griddynamics.msd365fp.manualreview.model.event.Event;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Set;


/**
 * The event that reflect item movement between queues.
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ItemAssignmentEvent implements Event {

    private String id;
    @Builder.Default
    private Set<String> oldQueueIds = Collections.emptySet();
    @Builder.Default
    private Set<String> newQueueIds = Collections.emptySet();
    private OffsetDateTime actioned;
}
