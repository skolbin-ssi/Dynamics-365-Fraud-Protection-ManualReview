package com.griddynamics.msd365fp.manualreview.analytics.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemAssignmentEvent;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.MessageChannel;

/**
 * Bindable interface for incoming {@link ItemAssignmentEvent}.
 */
@SuppressWarnings("java:S1214")
public interface ItemAssignmentEventStream {

    String INPUT = "item-assignment-event-input";
    String ERROR_INPUT = "item-assignment-event-hub.mr-analytics.errors";

    @Input(INPUT)
    MessageChannel input();
}
