package com.griddynamics.msd365fp.manualreview.analytics.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemResolutionEvent;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.MessageChannel;

/**
 * Bindable interface for incoming {@link ItemResolutionEvent}.
 */
@SuppressWarnings("java:S1214")
public interface ItemResolutionEventStream {

    String INPUT = "item-resolution-event-input";
    String ERROR_INPUT = "item-resolution-event-hub.mr-analytics.errors";

    @Input(INPUT)
    MessageChannel input();
}
