// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.config;

import com.griddynamics.msd365fp.manualreview.ehub.durable.model.EventHubProcessorExecutor;
import com.griddynamics.msd365fp.manualreview.ehub.durable.model.EventHubProcessorExecutorRegistry;
import com.griddynamics.msd365fp.manualreview.model.event.dfp.PurchaseEventBatch;
import com.griddynamics.msd365fp.manualreview.queues.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@RequiredArgsConstructor
@Configuration(proxyBeanMethods = false)
public class StreamingConfig {

    @Bean
    public EventHubProcessorExecutorRegistry eventHubProcessorExecutorRegistry(final ItemService itemService) {
        EventHubProcessorExecutorRegistry registry = new EventHubProcessorExecutorRegistry();

        registry.put("dfp-hub", new EventHubProcessorExecutor<>(
                PurchaseEventBatch.class,
                itemService::saveEmptyItem));

        return registry;
    }

}
