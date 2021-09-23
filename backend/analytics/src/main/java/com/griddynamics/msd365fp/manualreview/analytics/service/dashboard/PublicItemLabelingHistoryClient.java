// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.AnalystDetails;
import com.griddynamics.msd365fp.manualreview.analytics.model.ItemLabelingBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LabelBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LabelingTimeBucket;
import com.griddynamics.msd365fp.manualreview.analytics.repository.ItemLabelActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PublicItemLabelingHistoryClient {
    private final ItemLabelActivityRepository labelActivityRepository;

    @PreAuthorize("@dataSecurityService.checkPermissionForQueuePerformanceReading(authentication, #analystIds)")
    public List<ItemLabelingBucket> getItemLabelingSummary(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        return labelActivityRepository.getTotalPerformance(
                from,
                to,
                analystIds,
                queueIds);
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForQueuePerformanceReading(authentication, #analystIds)")
    public List<ItemLabelingBucket> getBatchLabelingSummary(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds) {
        return labelActivityRepository.getBatchPerformance(
                from,
                to,
                analystIds);
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForQueuePerformanceReading(authentication, #analystIds)")
    public List<ItemLabelingBucket> getItemLabelingHistoryGroupedByQueues(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        return labelActivityRepository.getQueuePerformance(
                from,
                to,
                aggregation,
                analystIds,
                queueIds);
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForAnalystPerformanceReading(authentication, #analystIds)")
    public List<ItemLabelingBucket> getItemLabelingHistoryGroupedByAnalysts(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        var result =  labelActivityRepository.getAnalystPerformance(
                from,
                to,
                aggregation,
                analystIds,
                queueIds);

        return result;
    }

    public List<AnalystDetails> getAnalystDetails( @NonNull final OffsetDateTime from,
                                                   @NonNull final OffsetDateTime to,
                                                   final Set<String> analystIds) {
        var result =  labelActivityRepository.getAnalystDetails(
                from,
                to,
                analystIds);

        return result;
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForAnalystPerformanceReading(authentication, #analystIds)")
    public List<LabelingTimeBucket> getItemLabelingTimeSummary(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        return labelActivityRepository.getSpentTime(
                from,
                to,
                analystIds,
                queueIds);
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForQueuePerformanceReading(authentication, #analystIds)")
    public Stream<LabelBucket> getRiskScoreDistribution(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            int bucketSize,
            Set<String> analystIds,
            Set<String> queueIds) {
        return labelActivityRepository.getRiskScoreDistribution(from, to, bucketSize, analystIds, queueIds);
    }

}