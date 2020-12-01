// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.ItemLabelingBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LabelBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LabelingTimeBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LockTimeBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.*;
import com.griddynamics.msd365fp.manualreview.analytics.util.DataGenerationUtility;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicItemLabelingMetricService {
    private final PublicItemLabelingHistoryClient labelingClient;
    private final PublicItemLockingHistoryClient lockingClient;

    public ItemLabelingTimeMetricDTO getItemLabelingTimeTotalMetrics(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        ItemLabelingTimeMetricDTO totalResult = new ItemLabelingTimeMetricDTO();

        List<LockTimeBucket> dbLockTimeResults = lockingClient.getSpentTimeSummary(
                from,
                to,
                analystIds,
                queueIds);
        dbLockTimeResults.forEach(bucket -> mapLockingTimeMetrics(totalResult, bucket));

        List<LabelingTimeBucket> dbLabelTimeResults = labelingClient.getItemLabelingTimeSummary(
                from,
                to,
                analystIds,
                queueIds);
        dbLabelTimeResults.forEach(bucket -> mapLabelingTimeMetrics(totalResult, bucket));

        return totalResult;
    }

    public ItemLabelingMetricDTO getItemLabelingTotalMetrics(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        ItemLabelingMetricDTO totalResult = new ItemLabelingMetricDTO();

        List<ItemLabelingBucket> dbResult = labelingClient.getItemLabelingSummary(
                from,
                to,
                analystIds,
                queueIds);
        dbResult.forEach(bucket -> {
            mapDecisions(bucket, totalResult);
            mapOverturnedDecisions(bucket, totalResult);
        });

        List<ItemLabelingBucket> batchDBResult = labelingClient.getBatchLabelingSummary(
                from,
                to,
                analystIds);
        dbResult.forEach(bucket -> {
            mapBatchDecisions(bucket, totalResult);
        });

        calculateDerivedItemLabelingMetrics(totalResult);

        return totalResult;
    }

    public Set<ItemLabelingMetricsByQueueDTO> getItemLabelingMetricsByQueue(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        Map<String, Map<OffsetDateTime, ItemLabelingMetricDTO>> result = new HashMap<>();
        Map<String, ItemLabelingMetricDTO> totalResult = new HashMap<>();
        Set<ItemLabelingMetricsByQueueDTO> dto = new TreeSet<>(Comparator
                .comparing((ItemLabelingMetricsByQueueDTO qp) -> qp.getTotal().getReviewed()).reversed()
                .thenComparing(ItemLabelingMetricsByQueueDTO::getId));

        List<ItemLabelingBucket> dbResult = labelingClient.getItemLabelingHistoryGroupedByQueues(
                from,
                to,
                aggregation,
                analystIds,
                queueIds);
        aggergateDBResultsToLabelingMetricMaps(from, to, aggregation, result, totalResult, dbResult);

        if (!result.isEmpty()) {
            result.forEach((id, data) -> dto.add(ItemLabelingMetricsByQueueDTO.builder()
                    .id(id)
                    .data(data)
                    .total(totalResult.get(id))
                    .build()));
        }

        return dto;
    }


    public Set<ItemLabelingMetricsByAnalystDTO> getItemLabelingMetricsByAnalyst(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        Map<String, Map<OffsetDateTime, ItemLabelingMetricDTO>> result = new HashMap<>();
        Map<String, ItemLabelingMetricDTO> totalResult = new HashMap<>();
        Set<ItemLabelingMetricsByAnalystDTO> dto = new TreeSet<>(Comparator
                .comparing((ItemLabelingMetricsByAnalystDTO ap) -> ap.getTotal().getReviewed()).reversed()
                .thenComparing(ItemLabelingMetricsByAnalystDTO::getId));

        List<ItemLabelingBucket> dbResult = labelingClient.getItemLabelingHistoryGroupedByAnalysts(
                from,
                to,
                aggregation,
                analystIds,
                queueIds);
        aggergateDBResultsToLabelingMetricMaps(from, to, aggregation, result, totalResult, dbResult);

        if (!result.isEmpty()) {
            result.forEach((id, data) -> dto.add(ItemLabelingMetricsByAnalystDTO.builder()
                    .id(id)
                    .data(data)
                    .total(totalResult.get(id))
                    .build()));
        }

        return dto;
    }

    public ItemLabelingProgressMetricsDTO getItemLabelingProgressMetrics(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds,
            final Set<String> queueIds) {

        ItemLabelingMetricDTO currentPeriodDBResult = getItemLabelingTotalMetrics(
                from,
                to,
                analystIds,
                queueIds);
        ItemLabelingMetricDTO previousPeriodDBResult = getItemLabelingTotalMetrics(
                from.minus(Duration.between(from, to)),
                from,
                analystIds,
                queueIds);
        ItemLabelingMetricDTO annualIncludingPeriod = getItemLabelingTotalMetrics(
                to.minusYears(1),
                to,
                analystIds,
                queueIds);
        ItemLabelingMetricDTO annualBeforePeriod = getItemLabelingTotalMetrics(
                from.minusYears(1),
                from,
                analystIds,
                queueIds);

        return ItemLabelingProgressMetricsDTO.builder()
                .currentPeriod(currentPeriodDBResult)
                .previousPeriod(previousPeriodDBResult)
                .annualIncludingPeriod(annualIncludingPeriod)
                .annualBeforePeriod(annualBeforePeriod)
                .build();
    }

    public ItemLabelingTimeProgressMetricsDTO getItemLabelingTimeProgressMetrics(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        return ItemLabelingTimeProgressMetricsDTO.builder()
                .currentPeriod(getItemLabelingTimeTotalMetrics(
                        from,
                        to,
                        analystIds,
                        queueIds))
                .previousPeriod(getItemLabelingTimeTotalMetrics(
                        from.minus(Duration.between(from, to)),
                        from,
                        analystIds,
                        queueIds))
                .build();

    }

    public RiskScoreOverviewDTO getRiskScoreOverview(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            int bucketSize,
            Set<String> analystIds,
            Set<String> queueIds) {
        return new RiskScoreOverviewDTO(labelingClient.getRiskScoreDistribution(from, to, bucketSize, analystIds, queueIds)
                .collect(
                        Collectors.groupingBy(
                                LabelBucket::getLowerBound,
                                Collector.of(
                                        RiskScoreOverviewDTO.RiskScoreBucketDTO::new,
                                        (r, t) -> mapRiskScoreDistribution(t, r),
                                        (r, b) -> {
                                            r.setGood(r.getGood() + b.getGood());
                                            r.setBad(r.getBad() + b.getBad());
                                            return r;
                                        })
                        )
                ));
    }

    private void mapLockingTimeMetrics(final ItemLabelingTimeMetricDTO totalResult, final LockTimeBucket bucket) {
        if (bucket.getActionType().isWasted()) {
            totalResult.setWastedAmount(
                    totalResult.getWastedAmount() + bucket.getCnt());
            totalResult.setWastedDuration(
                    totalResult.getWastedDuration().plus(
                            Objects.requireNonNullElse(bucket.getTotalDuration(), Duration.ZERO)));
        } else {
            totalResult.setNotWastedAmount(
                    totalResult.getNotWastedAmount() + bucket.getCnt());
            totalResult.setNotWastedDuration(
                    totalResult.getNotWastedDuration().plus(
                            Objects.requireNonNullElse(bucket.getTotalDuration(), Duration.ZERO)));
        }
    }

    private void mapLabelingTimeMetrics(final ItemLabelingTimeMetricDTO totalResult, final LabelingTimeBucket bucket) {
        if (bucket.getLabel() != null) {
            if (bucket.getLabel().isFormsResolution()) {
                totalResult.setResolutionAmount(
                        totalResult.getResolutionAmount() + bucket.getCnt());
                totalResult.setResolutionApplyingDuration(
                        totalResult.getResolutionApplyingDuration().plus(
                                Objects.requireNonNullElse(bucket.getTotalDuration(), Duration.ZERO)));
            } else {
                totalResult.setInternalDecisionsAmount(
                        totalResult.getInternalDecisionsAmount() + bucket.getCnt());
                totalResult.setInternalDecisionsApplyingDuration(
                        totalResult.getInternalDecisionsApplyingDuration().plus(
                                Objects.requireNonNullElse(bucket.getTotalDuration(), Duration.ZERO)));
            }
        }
    }


    private void aggergateDBResultsToLabelingMetricMaps(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Map<String, Map<OffsetDateTime, ItemLabelingMetricDTO>> result,
            final Map<String, ItemLabelingMetricDTO> totalResult, final List<ItemLabelingBucket> dbResult) {
        // map essential performance parameters
        dbResult.forEach(bucket -> {
            Map<OffsetDateTime, ItemLabelingMetricDTO> objectInfo = result.computeIfAbsent(
                    bucket.getId(),
                    key -> DataGenerationUtility
                            .initDateTimeMap(from, to, aggregation, ItemLabelingMetricDTO::new));
            ItemLabelingMetricDTO dateInfo = objectInfo.computeIfAbsent(
                    from.plus(aggregation.multipliedBy(bucket.getBucket())),
                    key -> new ItemLabelingMetricDTO());
            mapDecisions(bucket, dateInfo);
            mapOverturnedDecisions(bucket, dateInfo);
        });

        // calculate derived metrics
        result.forEach((id, lpm) -> {
            ItemLabelingMetricDTO totalInfo = new ItemLabelingMetricDTO();
            lpm.forEach((date, lp) -> {
                calculateDerivedItemLabelingMetrics(lp);
                totalInfo.setGood(totalInfo.getGood() + lp.getGood());
                totalInfo.setBad(totalInfo.getBad() + lp.getBad());
                totalInfo.setWatched(totalInfo.getWatched() + lp.getWatched());
                totalInfo.setOther(totalInfo.getOther() + lp.getOther());
                totalInfo.setGoodOverturned(totalInfo.getGoodOverturned() + lp.getGoodOverturned());
                totalInfo.setBadOverturned(totalInfo.getBadOverturned() + lp.getBadOverturned());
            });
            calculateDerivedItemLabelingMetrics(totalInfo);
            totalResult.put(id, totalInfo);
        });
    }

    private void calculateDerivedItemLabelingMetrics(final ItemLabelingMetricDTO lp) {
        lp.setReviewed(lp.getBad() + lp.getWatched() + lp.getGood());
    }

    private void mapOverturnedDecisions(ItemLabelingBucket bucket, ItemLabelingMetricDTO performance) {
        switch (bucket.getLabel()) {
            case GOOD:
            case WATCH_INCONCLUSIVE:
            case WATCH_NA:
                if (!"Approve".equals(bucket.getMerchantRuleDecision())) {
                    performance.setGoodOverturned(performance.getGoodOverturned() + bucket.getCnt());
                }
                break;
            case BAD:
                if (!"Reject".equals(bucket.getMerchantRuleDecision())) {
                    performance.setBadOverturned(performance.getBadOverturned() + bucket.getCnt());
                }
                break;
            default:
        }
    }

    private void mapDecisions(ItemLabelingBucket bucket, ItemLabelingMetricDTO performance) {
        switch (bucket.getLabel()) {
            case GOOD:
                performance.setGood(performance.getGood() + bucket.getCnt());
                break;
            case WATCH_INCONCLUSIVE:
            case WATCH_NA:
                performance.setWatched(performance.getWatched() + bucket.getCnt());
                break;
            case BAD:
                performance.setBad(performance.getBad() + bucket.getCnt());
                break;
            case ESCALATE:
                performance.setEscalated(performance.getEscalated() + bucket.getCnt());
                break;
            case HOLD:
                performance.setHeld(performance.getHeld() + bucket.getCnt());
                break;
            default:
                performance.setOther(performance.getOther() + bucket.getCnt());
        }
    }

    private void mapBatchDecisions(ItemLabelingBucket bucket, ItemLabelingMetricDTO performance) {
        switch (bucket.getLabel()) {
            case GOOD:
                performance.setGoodInBatch(performance.getGoodInBatch() + bucket.getCnt());
                break;
            case BAD:
                performance.setBadInBatch(performance.getBadInBatch() + bucket.getCnt());
                break;
            default:
                break;
        }
    }

    private void mapRiskScoreDistribution(LabelBucket labelBucket,
                                          RiskScoreOverviewDTO.RiskScoreBucketDTO riskScoreBucketDTO) {
        switch (labelBucket.getLabel()) {
            case GOOD:
                riskScoreBucketDTO.setGood(riskScoreBucketDTO.getGood() + labelBucket.getCount());
                break;
            case WATCH_INCONCLUSIVE:
            case WATCH_NA:
                riskScoreBucketDTO.setWatched(riskScoreBucketDTO.getWatched() + labelBucket.getCount());
                break;
            case BAD:
                riskScoreBucketDTO.setBad(riskScoreBucketDTO.getBad() + labelBucket.getCount());
                break;
            default:
                throw new IllegalArgumentException(String.format("Unexpected label [%s]", labelBucket.getLabel()));
        }
    }
}