// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.logging;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.turbo.TurboFilter;
import ch.qos.logback.core.spi.FilterReply;
import org.slf4j.Marker;

public class EventHubSpamErrorFilter extends TurboFilter {
    @Override
    public FilterReply decide(final Marker marker, final Logger logger, final Level level, final String format, final Object[] params, final Throwable t) {
        if (level != null && level.isGreaterOrEqual(Level.WARN) &&
                logger != null && logger.getName() != null && logger.getName().contains("com.azure") &&
                format != null &&
                (format.contains("New receiver 'nil' with higher epoch of '0' is created hence current receiver 'nil' with epoch '0' is getting disconnected") ||
                        format.endsWith("Error occurred in link."))) {
            return FilterReply.DENY;
        }
        return FilterReply.NEUTRAL;
    }
}
