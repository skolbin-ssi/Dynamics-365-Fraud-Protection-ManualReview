// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.model;


import com.griddynamics.msd365fp.manualreview.ehub.durable.streaming.DurableEventHubProducerClient;

import java.util.concurrent.ConcurrentHashMap;

public class DurableEventHubProducerClientRegistry extends ConcurrentHashMap<String, DurableEventHubProducerClient> {
}
