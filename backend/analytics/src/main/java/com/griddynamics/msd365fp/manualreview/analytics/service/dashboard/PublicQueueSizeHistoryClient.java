// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.SizeHistoryBucket;
import com.griddynamics.msd365fp.manualreview.analytics.repository.QueueSizeCalculationActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PublicQueueSizeHistoryClient {

    private final QueueSizeCalculationActivityRepository sizeCalculationActivitiesRepository;

    @PreAuthorize("@dataSecurityService.checkPermissionForDemandSupplyInfoReading(authentication)")
    public List<SizeHistoryBucket> getQueueSizeHistory(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> queueIds) {
        return sizeCalculationActivitiesRepository.getSizeHistory(from, to, aggregation, queueIds);
    }
}
