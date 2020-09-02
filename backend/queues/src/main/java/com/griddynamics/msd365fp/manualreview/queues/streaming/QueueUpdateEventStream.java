package com.griddynamics.msd365fp.manualreview.queues.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.QueueSizeUpdateEvent;
import org.springframework.cloud.stream.annotation.Output;
import org.springframework.messaging.MessageChannel;

/**
 * Event stream for {@link QueueSizeUpdateEvent}s.
 */
@SuppressWarnings("java:S1214")
public interface QueueUpdateEventStream {

    String OUTPUT = "queue-update-event-output";

    @Output(OUTPUT)
    MessageChannel output();
}
