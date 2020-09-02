package com.griddynamics.msd365fp.manualreview.queues.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.internal.ItemLabelEvent;
import org.springframework.cloud.stream.annotation.Output;
import org.springframework.messaging.MessageChannel;

/**
 * Event stream for {@link ItemLabelEvent}s.
 */
@SuppressWarnings("java:S1214")
public interface ItemResolutionEventStream {

    String OUTPUT = "item-resolution-event-output";

    @Output(OUTPUT)
    MessageChannel output();
}
