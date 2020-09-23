// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.model;


import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubProcessorClient;

import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings("rawtypes")
public class DurableEventHubProcessorClientRegistry extends ConcurrentHashMap<String, DurableEventHubProcessorClient> {
}
