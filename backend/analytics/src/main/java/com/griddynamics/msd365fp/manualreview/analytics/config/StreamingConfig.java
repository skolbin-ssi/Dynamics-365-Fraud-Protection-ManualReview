// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.config;

import com.griddynamics.msd365fp.manualreview.analytics.service.StreamService;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.EventHubProcessorExecutor;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.EventHubProcessorExecutorRegistry;
import com.griddynamics.msd365fp.manualreview.model.event.internal.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@RequiredArgsConstructor
@Configuration(proxyBeanMethods = false)
public class StreamingConfig {

    @Bean
    public EventHubProcessorExecutorRegistry eventHubProcessorExecutorRegistry(final StreamService streamService) {
        EventHubProcessorExecutorRegistry registry = new EventHubProcessorExecutorRegistry();

        registry.put("item-lock-event-hub", new EventHubProcessorExecutor<>(
                ItemLockEvent.class,
                streamService::processItemLockEvent));
        registry.put("queue-size-event-hub", new EventHubProcessorExecutor<>(
                QueueSizeUpdateEvent.class,
                streamService::processQueueSizeUpdateEvent));
        registry.put("overall-size-event-hub", new EventHubProcessorExecutor<>(
                OverallSizeUpdateEvent.class,
                streamService::processOverallSizeUpdateEvent));
        registry.put("item-assignment-event-hub", new EventHubProcessorExecutor<>(
                ItemAssignmentEvent.class,
                streamService::processItemAssignmentEvent));
        registry.put("item-label-event-hub", new EventHubProcessorExecutor<>(
                ItemLabelEvent.class,
                streamService::processItemLabelEvent));
        registry.put("item-resolution-event-hub", new EventHubProcessorExecutor<>(
                ItemResolutionEvent.class,
                streamService::processItemResolutionEvent));
        registry.put("queue-update-event-hub", new EventHubProcessorExecutor<>(
                QueueUpdateEvent.class,
                streamService::processQueueUpdateEvent));

        return registry;
    }

}
