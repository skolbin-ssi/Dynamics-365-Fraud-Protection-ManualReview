// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.ehub.durable.logging;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.turbo.TurboFilter;
import ch.qos.logback.core.spi.FilterReply;
import org.slf4j.Marker;

public class EventHubSpamErrorFilter extends TurboFilter {

    public static final String DEGRADED_LOG_LEVEL_PREFIX = "Degraded log level: ";

    @Override
    public FilterReply decide(final Marker marker, final Logger logger, final Level level, final String format, final Object[] params, final Throwable t) {
        if (level != null &&
                format != null &&
                logger != null && logger.getName() != null &&
                (logger.getName().contains("com.azure.messaging.eventhubs") ||
                        logger.getName().contains("com.azure.core.amqp.implementation"))) {
            if (level.isGreaterOrEqual(Level.WARN)){
                logger.info(marker, DEGRADED_LOG_LEVEL_PREFIX + format, params);
                return FilterReply.DENY;
            } else if (level.isGreaterOrEqual(Level.INFO) && !format.startsWith(DEGRADED_LOG_LEVEL_PREFIX)){
                logger.debug(marker, DEGRADED_LOG_LEVEL_PREFIX + format, params);
                return FilterReply.DENY;
            }
        }
        return FilterReply.NEUTRAL;
    }
}
