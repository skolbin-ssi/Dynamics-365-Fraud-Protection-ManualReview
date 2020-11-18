// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.ItemLabelingBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LabelBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LabelingTimeBucket;
import org.springframework.lang.NonNull;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

public interface ItemLabelActivityRepositoryCustomMethods {

    /**
     * Calculate overall performance by provided query parameters.
     * Buckets are separated by labels and merchantRuleDecisions.
     * Bucket ids are filled by queue ids. The number of the bucket
     * defines a period of time in accordance with {@code aggregation}.
     *
     * @param startDateTime a time bound
     * @param endDateTime   a time bound
     * @param aggregation   period of time for bucketing
     * @param analystIds    a list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @param queueIds      list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @return the list of buckets
     */
    List<ItemLabelingBucket> getQueuePerformance(
            @NonNull final OffsetDateTime startDateTime,
            @NonNull final OffsetDateTime endDateTime,
            @NonNull final Duration aggregation,
            final Set<String> analystIds,
            final Set<String> queueIds);

    /**
     * Calculate overall performance by provided query parameters.
     * Buckets are separated by labels and merchantRuleDecisions.
     * Bucket ids are filled by analyst ids. The number of the bucket
     * defines a period of time in accordance with {@code aggregation}.
     *
     * @param startDateTime a time bound
     * @param endDateTime   a time bound
     * @param aggregation   period of time for bucketing
     * @param analystIds    a list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @param queueIds      list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @return the list of buckets
     */
    List<ItemLabelingBucket> getAnalystPerformance(
            @NonNull final OffsetDateTime startDateTime,
            @NonNull final OffsetDateTime endDateTime,
            @NonNull final Duration aggregation,
            final Set<String> analystIds,
            final Set<String> queueIds);

    /**
     * Calculate overall performance by provided query parameters.
     * Buckets are separated by labels and merchantRuleDecisions.
     * Bucket ids and bucket numbers are null
     * as method doesn't differentiate
     * results by query parameters
     *
     * @param startDateTime a time bound
     * @param endDateTime   a time bound
     * @param analystIds    a list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @param queueIds      list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @return the list of buckets
     */
    List<ItemLabelingBucket> getTotalPerformance(
            @NonNull final OffsetDateTime startDateTime,
            @NonNull final OffsetDateTime endDateTime,
            final Set<String> analystIds,
            final Set<String> queueIds);

    /**
     * Calculate overall spent time by provided query parameters.
     * Buckets are separated by labels.
     *
     * @param startDateTime a time bound
     * @param endDateTime   a time bound
     * @param analystIds    a list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @param queueIds      list of analyst ids for filtering,
     *                      if it's empty the all analysts are counted
     * @return the list of buckets
     */
    List<LabelingTimeBucket> getSpentTime(
            @NonNull final OffsetDateTime startDateTime,
            @NonNull final OffsetDateTime endDateTime,
            final Set<String> analystIds,
            final Set<String> queueIds);

    Stream<LabelBucket> getRiskScoreDistribution(
            @NonNull final OffsetDateTime startDateTime,
            @NonNull final OffsetDateTime endDateTime,
            int bucketSize,
            Set<String> analystIds,
            Set<String> queueIds);
}
