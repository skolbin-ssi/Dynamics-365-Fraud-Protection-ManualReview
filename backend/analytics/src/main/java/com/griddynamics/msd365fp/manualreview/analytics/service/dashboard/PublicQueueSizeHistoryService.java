// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.SizeHistoryBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.SizeHistoryDTO;
import com.griddynamics.msd365fp.manualreview.analytics.util.DataGenerationUtility;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.OVERALL_SIZE_ID;

@Service
@RequiredArgsConstructor
public class PublicQueueSizeHistoryService {

    private final PublicQueueSizeHistoryClient publicQueueSizeHistoryClient;

    /**
     * Returns sizes of specified queues calculated for
     * ends of aggregation periods
     *
     * @param from        is the lower bound for history record to be included
     *                    in the result.
     * @param to          is the upper bound for history record to be included
     *                    in the result.
     * @param aggregation indicates how history records should be splitted and
     *                    aggregated inside each split. E.g. one day or one week
     *                    of aggregated data.
     * @param queueIds    a set of IDs for filtering of DB data.
     * @return a {@link Map} that contains queue ids as keys and
     * maps of date-size as values.
     */
    private Map<String, SizeHistoryDTO> getQueueSizeHistory(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> queueIds) {
        Map<String, SizeHistoryDTO> queues = new TreeMap<>();
        List<SizeHistoryBucket> dbResult =
                publicQueueSizeHistoryClient.getQueueSizeHistory(from, to, aggregation, queueIds);

        // map essential metrics
        dbResult.forEach(bucket -> {
            SizeHistoryDTO qdata = queues.computeIfAbsent(bucket.getId(),
                    id -> SizeHistoryDTO.builder()
                            .id(id)
                            .data(DataGenerationUtility.initDateTimeMap(from, to, aggregation, () -> 0))
                            .build());
            qdata.getData().put(
                    from.plus(aggregation.multipliedBy(bucket.getBucket())),
                    bucket.getSize());
        });

        // return response
        return queues;
    }


    public Collection<SizeHistoryDTO> getQueueSizeHistoryByQueues(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> queueIds) {
        Map<String, SizeHistoryDTO> queues =
                getQueueSizeHistory(from, to, aggregation, queueIds);
        queues.remove(OVERALL_SIZE_ID);

        return queues.values();
    }

    public SizeHistoryDTO getOverallQueueSizeHistory(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation) {
        return getQueueSizeHistory(from, to, aggregation, Set.of(OVERALL_SIZE_ID))
                .computeIfAbsent(OVERALL_SIZE_ID,
                        id -> SizeHistoryDTO.builder()
                                .id(id)
                                .data(DataGenerationUtility.initDateTimeMap(from, to, aggregation, () -> 0))
                                .build());
    }
}
