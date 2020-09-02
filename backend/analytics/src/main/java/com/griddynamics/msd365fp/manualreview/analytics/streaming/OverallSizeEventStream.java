package com.griddynamics.msd365fp.manualreview.analytics.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.OverallSizeUpdateEvent;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.MessageChannel;

/**
 * Bindable interface for incoming {@link OverallSizeUpdateEvent}.
 */
@SuppressWarnings("java:S1214")
public interface OverallSizeEventStream {

    String INPUT = "overall-size-event-input";
    String ERROR_INPUT = "overall-size-event-hub.mr-analytics.errors";

    @Input(INPUT)
    MessageChannel input();
}
