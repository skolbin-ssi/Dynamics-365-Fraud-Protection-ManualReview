package com.griddynamics.msd365fp.manualreview.queues.streaming;

import com.griddynamics.msd365fp.manualreview.model.event.dfp.PurchaseEvent;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.SubscribableChannel;

/**
 * Event stream for {@link PurchaseEvent}s
 */
@SuppressWarnings("java:S1214")
public interface DFPEventStream {

    String DFP_INPUT = "dfp-input";
    String ERROR_INPUT = "dfp-hub.mr-queues.errors";

    @Input(DFP_INPUT)
    SubscribableChannel input();
}
