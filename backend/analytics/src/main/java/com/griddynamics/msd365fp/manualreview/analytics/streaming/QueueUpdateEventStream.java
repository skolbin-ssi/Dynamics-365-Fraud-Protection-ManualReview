package com.griddynamics.msd365fp.manualreview.analytics.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.QueueUpdateEvent;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.MessageChannel;

/**
 * Bindable interface for incoming {@link QueueUpdateEvent}.
 */
@SuppressWarnings("java:S1214")
public interface QueueUpdateEventStream {

    String INPUT = "queue-update-event-input";
    String ERROR_INPUT = "queue-update-event-hub.mr-analytics.errors";

    @Input(INPUT)
    MessageChannel input();
}
