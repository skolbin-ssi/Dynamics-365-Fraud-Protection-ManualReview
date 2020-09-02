package com.griddynamics.msd365fp.manualreview.analytics.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemLockEvent;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.MessageChannel;

/**
 * Bindable interface for incoming {@link ItemLockEvent}.
 */
@SuppressWarnings("java:S1214")
public interface ItemLockEventStream {

    String INPUT = "item-lock-event-input";
    String ERROR_INPUT = "item-lock-event-hub.mr-analytics.errors";

    @Input(INPUT)
    MessageChannel input();
}
