// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.model;

public interface HealthCheckProcessor {
    void processConsumerHealthCheck(final String hubName, final String partition, final String checkId);
}
