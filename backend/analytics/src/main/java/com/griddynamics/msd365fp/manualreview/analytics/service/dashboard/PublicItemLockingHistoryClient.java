// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.LockTimeBucket;
import com.griddynamics.msd365fp.manualreview.analytics.repository.ItemLockActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PublicItemLockingHistoryClient {
    private final ItemLockActivityRepository lockActivitiesRepository;

    @PreAuthorize("@dataSecurityService.checkPermissionForAnalystPerformanceReading(authentication, #analystIds)")
    public List<LockTimeBucket> getSpentTimeSummary(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        return lockActivitiesRepository.getSpentTime(
                from,
                to,
                analystIds,
                queueIds);
    }

}