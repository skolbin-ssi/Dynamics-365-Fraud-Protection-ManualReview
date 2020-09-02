package com.griddynamics.msd365fp.manualreview.analytics.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemLabelEvent;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.MessageChannel;

/**
 * Bindable interface for incoming {@link ItemLabelEvent}.
 */
@SuppressWarnings("java:S1214")
public interface ItemLabelEventStream {

    String INPUT = "item-label-event-input";
    String ERROR_INPUT = "item-label-event-hub.mr-analytics.errors";

    @Input(INPUT)
    MessageChannel input();
}
