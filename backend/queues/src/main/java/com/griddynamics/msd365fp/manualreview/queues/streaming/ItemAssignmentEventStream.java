package com.griddynamics.msd365fp.manualreview.queues.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemAssignmentEvent;
import org.springframework.cloud.stream.annotation.Output;
import org.springframework.messaging.MessageChannel;

/**
 * Event stream for {@link ItemAssignmentEvent}s.
 */
@SuppressWarnings("java:S1214")
public interface ItemAssignmentEventStream {

    String OUTPUT = "item-assignment-event-output";

    @Output(OUTPUT)
    MessageChannel output();
}
