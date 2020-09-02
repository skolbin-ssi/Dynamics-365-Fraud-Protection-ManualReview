package com.griddynamics.msd365fp.manualreview.queues.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemLockEvent;
import org.springframework.cloud.stream.annotation.Output;
import org.springframework.messaging.MessageChannel;

/**
 * Event stream for {@link ItemLockEvent}s.
 */
@SuppressWarnings("java:S1214")
public interface ItemLockEventStream {

    String OUTPUT = "item-lock-event-output";

    @Output(OUTPUT)
    MessageChannel output();
}
