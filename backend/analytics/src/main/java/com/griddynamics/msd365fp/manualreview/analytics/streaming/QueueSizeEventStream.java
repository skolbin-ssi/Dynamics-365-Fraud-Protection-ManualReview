package com.griddynamics.msd365fp.manualreview.analytics.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.QueueSizeUpdateEvent;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.MessageChannel;

/**
 * Bindable interface for incoming {@link QueueSizeUpdateEvent}.
 */
@SuppressWarnings("java:S1214")
public interface QueueSizeEventStream {

    String INPUT = "queue-size-event-input";
    String ERROR_INPUT = "queue-size-event-hub.mr-analytics.errors";

    @Input(INPUT)
    MessageChannel input();
}
