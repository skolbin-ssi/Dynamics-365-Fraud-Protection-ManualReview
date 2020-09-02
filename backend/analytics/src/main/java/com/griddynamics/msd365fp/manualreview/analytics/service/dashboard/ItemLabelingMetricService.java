package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.ItemLabelingBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LabelingTimeBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LockTimeBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.*;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedAnalystInfoEntity;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedQueueInfoEntity;
import com.griddynamics.msd365fp.manualreview.analytics.repository.CollectedAnalystInfoRepository;
import com.griddynamics.msd365fp.manualreview.analytics.repository.CollectedQueueInfoRepository;
import com.griddynamics.msd365fp.manualreview.analytics.repository.ItemLabelActivityRepository;
import com.griddynamics.msd365fp.manualreview.analytics.repository.ItemLockActivityRepository;
import com.griddynamics.msd365fp.manualreview.analytics.util.DataGenerationUtility;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class ItemLabelingMetricService {
    private final ItemLabelActivityRepository labelActivityRepository;
    private final ItemLockActivityRepository lockActivitiesRepository;
    private final CollectedAnalystInfoRepository analystInfoRepository;
    private final CollectedQueueInfoRepository queueInfoRepository;

    public ItemLabelingTimeMetricDTO getItemLabelingTimeTotalMetrics(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            final Set<String> analystIds,
            final Set<String> queueIds) {
        ItemLabelingTimeMetricDTO totalResult = new ItemLabelingTimeMetricDTO();

        List<LockTimeBucket> dbLockTimeResults = lockActivitiesRepository.getSpentTime(
                from,
                to,
                analystIds,
                queueIds);
        dbLockTimeResults.forEach(bucket -> mapLockingTimeMetrics(totalResult, bucket));

        List<LabelingTimeBucket> dbLabelTimeResults = labelActivityRepository.getSpentTime(
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

        List<ItemLabelingBucket> dbResult = labelActivityRepository.getTotalPerformance(
                from,
                to,
                analystIds,
                queueIds);
        dbResult.forEach(bucket -> {
            mapDecisions(bucket, totalResult);
            mapOverturnedDecisions(bucket, totalResult);
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

        List<ItemLabelingBucket> dbResult = labelActivityRepository.getQueuePerformance(
                from,
                to,
                aggregation,
                analystIds,
                queueIds);
        aggergateDBResultsToLabelingMetricMaps(from, to, aggregation, result, totalResult, dbResult);

        if (!result.isEmpty()) {
            Map<String, String> queueNames = StreamSupport.stream(queueInfoRepository.findAllById(result.keySet()).spliterator(), false)
                    .collect(Collectors.toMap(CollectedQueueInfoEntity::getId, CollectedQueueInfoEntity::getName));
            result.forEach((id, data) -> dto.add(ItemLabelingMetricsByQueueDTO.builder()
                    .id(id)
                    .name(queueNames.getOrDefault(id, id))
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

        List<ItemLabelingBucket> dbResult = labelActivityRepository.getAnalystPerformance(
                from,
                to,
                aggregation,
                analystIds,
                queueIds);
        aggergateDBResultsToLabelingMetricMaps(from, to, aggregation, result, totalResult, dbResult);

        if (!result.isEmpty()) {
            Map<String, String> analystNames = StreamSupport.stream(analystInfoRepository.findAllById(result.keySet()).spliterator(), false)
                    .collect(Collectors.toMap(CollectedAnalystInfoEntity::getId, en -> en.getDisplayName() == null ? en.getId() : en.getDisplayName()));
            result.forEach((id, data) -> dto.add(ItemLabelingMetricsByAnalystDTO.builder()
                    .id(id)
                    .displayName(analystNames.getOrDefault(id, id))
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
                totalInfo.setApproved(totalInfo.getApproved() + lp.getApproved());
                totalInfo.setRejected(totalInfo.getRejected() + lp.getRejected());
                totalInfo.setWatched(totalInfo.getWatched() + lp.getWatched());
                totalInfo.setOther(totalInfo.getOther() + lp.getOther());
                totalInfo.setApproveOverturned(totalInfo.getApproveOverturned() + lp.getApproveOverturned());
                totalInfo.setRejectOverturned(totalInfo.getRejectOverturned() + lp.getRejectOverturned());
            });
            calculateDerivedItemLabelingMetrics(totalInfo);
            totalResult.put(id, totalInfo);
        });
    }

    private void calculateDerivedItemLabelingMetrics(final ItemLabelingMetricDTO lp) {
        lp.setReviewed(lp.getRejected() + lp.getWatched() + lp.getApproved());
    }

    private void mapOverturnedDecisions(ItemLabelingBucket bucket, ItemLabelingMetricDTO performance) {
        switch (bucket.getLabel()) {
            case ACCEPT:
            case WATCH_INCONCLUSIVE:
            case WATCH_NA:
                if (!"Approve".equals(bucket.getMerchantRuleDecision())) {
                    performance.setApproveOverturned(performance.getApproveOverturned() + bucket.getCnt());
                }
                break;
            case REJECT:
                if (!"Reject".equals(bucket.getMerchantRuleDecision())) {
                    performance.setRejectOverturned(performance.getRejectOverturned() + bucket.getCnt());
                }
                break;
            default:
        }
    }

    private void mapDecisions(ItemLabelingBucket bucket, ItemLabelingMetricDTO performance) {
        switch (bucket.getLabel()) {
            case ACCEPT:
                performance.setApproved(performance.getApproved() + bucket.getCnt());
                break;
            case WATCH_INCONCLUSIVE:
            case WATCH_NA:
                performance.setWatched(performance.getWatched() + bucket.getCnt());
                break;
            case REJECT:
                performance.setRejected(performance.getRejected() + bucket.getCnt());
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

}