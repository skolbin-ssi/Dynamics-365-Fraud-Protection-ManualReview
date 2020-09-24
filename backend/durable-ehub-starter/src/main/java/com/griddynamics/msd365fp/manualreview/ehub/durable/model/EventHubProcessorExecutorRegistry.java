// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.model;

import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings("rawtypes")
public class EventHubProcessorExecutorRegistry extends ConcurrentHashMap<String, EventHubProcessorExecutor> {

}
