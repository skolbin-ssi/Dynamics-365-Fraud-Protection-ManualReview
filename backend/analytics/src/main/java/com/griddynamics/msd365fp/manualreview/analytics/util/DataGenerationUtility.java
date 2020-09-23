// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.util;

import lombok.experimental.UtilityClass;
import org.springframework.lang.NonNull;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Supplier;

@UtilityClass
public class DataGenerationUtility {

    public <T> SortedMap<OffsetDateTime, T> initDateTimeMap(@NonNull final OffsetDateTime from,
                                                      @NonNull final OffsetDateTime to,
                                                      @NonNull final Duration aggregation,
                                                      final Supplier<T> generator) {
        SortedMap<OffsetDateTime, T> result = new TreeMap<>();
        for (OffsetDateTime i = from; i.isBefore(to); i = i.plus(aggregation)) {
            result.putIfAbsent(i, generator.get());
        }
        return result;
    }
}
