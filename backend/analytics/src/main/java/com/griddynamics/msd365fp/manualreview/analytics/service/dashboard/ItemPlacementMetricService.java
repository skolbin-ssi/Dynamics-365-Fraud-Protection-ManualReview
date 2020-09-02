package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.ItemLabelingBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.ItemPlacementBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.ItemPlacementMetricDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.ItemPlacementMetricsByQueueDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedQueueInfoEntity;
import com.griddynamics.msd365fp.manualreview.analytics.repository.CollectedQueueInfoRepository;
import com.griddynamics.msd365fp.manualreview.analytics.repository.ItemLabelActivityRepository;
import com.griddynamics.msd365fp.manualreview.analytics.repository.ItemPlacementActivityRepository;
import com.griddynamics.msd365fp.manualreview.analytics.util.DataGenerationUtility;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.OVERALL_PLACEMENT_ID;

@Service
@RequiredArgsConstructor
public class ItemPlacementMetricService {
    private final ItemPlacementActivityRepository placementActivitiesRepository;
    private final ItemLabelActivityRepository labelActivityRepository;
    private final CollectedQueueInfoRepository queueInfoRepository;


    public Collection<ItemPlacementMetricsByQueueDTO> getItemPlacementMetricsByQueues(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> queueIds) {
        Map<String, ItemPlacementMetricsByQueueDTO> queueData =
                getItemPlacementMetrics(from, to, aggregation, queueIds);
        queueData.remove(OVERALL_PLACEMENT_ID);

        // collect response
        return queueData.values();
    }

    public ItemPlacementMetricsByQueueDTO getOverallItemPlacementMetrics(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation) {
        return getItemPlacementMetrics(from, to, aggregation, Set.of(OVERALL_PLACEMENT_ID))
                .computeIfAbsent(OVERALL_PLACEMENT_ID,
                        id -> ItemPlacementMetricsByQueueDTO.builder()
                                .id(id)
                                .data(DataGenerationUtility.initDateTimeMap(from, to, aggregation, ItemPlacementMetricDTO::new))
                                .build());
    }

    private Map<String, ItemPlacementMetricsByQueueDTO> getItemPlacementMetrics(
            @NonNull final OffsetDateTime from,
            @NonNull final OffsetDateTime to,
            @NonNull final Duration aggregation,
            final Set<String> queueIds) {
        Map<String, ItemPlacementMetricsByQueueDTO> queueData = new HashMap<>();

        List<ItemPlacementBucket> dbResult = placementActivitiesRepository.getPlacementMetrics(
                from,
                to,
                aggregation,
                queueIds);

        List<ItemLabelingBucket> dbLabelingResult = labelActivityRepository.getQueuePerformance(
                from,
                to,
                aggregation,
                queueIds,
                null);

        // map essential metrics
        dbResult.forEach(bucket -> {
            ItemPlacementMetricsByQueueDTO qdata = queueData.computeIfAbsent(bucket.getId(), id -> ItemPlacementMetricsByQueueDTO.builder()
                    .data(DataGenerationUtility
                            .initDateTimeMap(from, to, aggregation, ItemPlacementMetricDTO::new))
                    .id(id)
                    .build());
            ItemPlacementMetricDTO qdataMetricEntry = qdata.getData().computeIfAbsent(
                    from.plus(aggregation.multipliedBy(bucket.getBucket())),
                    key -> new ItemPlacementMetricDTO());
            mapPlacementBucketToPlacementDTO(bucket, qdataMetricEntry);
        });
        dbLabelingResult.forEach(bucket -> {
            ItemPlacementMetricsByQueueDTO qdata = queueData.computeIfAbsent(bucket.getId(), id -> ItemPlacementMetricsByQueueDTO.builder()
                    .data(DataGenerationUtility
                            .initDateTimeMap(from, to, aggregation, ItemPlacementMetricDTO::new))
                    .id(id)
                    .build());
            ItemPlacementMetricDTO qdataMetricEntry = qdata.getData().computeIfAbsent(
                    from.plus(aggregation.multipliedBy(bucket.getBucket())),
                    key -> new ItemPlacementMetricDTO());
            mapLabelingBucketToPlacementDTO(bucket, qdataMetricEntry);
        });


        // calculate derived metrics
        queueData.forEach((id, qds) -> {
            ItemPlacementMetricDTO totalInfo = new ItemPlacementMetricDTO();
            qds.getData().forEach((date, ds) -> aggregatePlacementMetrics(totalInfo, ds));
            qds.setTotal(totalInfo);
        });

        // enrich data
        if (!queueData.isEmpty()) {
            Map<String, String> queueNames = StreamSupport.stream(queueInfoRepository.findAllById(queueData.keySet()).spliterator(), false)
                    .collect(Collectors.toMap(CollectedQueueInfoEntity::getId, CollectedQueueInfoEntity::getName));
            queueData.forEach((id, qds) -> qds.setName(queueNames.getOrDefault(id, id)));
        }

        // collect response
        return queueData;
    }

    private void aggregatePlacementMetrics(final ItemPlacementMetricDTO agg, final ItemPlacementMetricDTO source) {
        agg.setReviewed(agg.getReviewed() + source.getReviewed());
        agg.setReceived(agg.getReceived() + source.getReceived());
        agg.setReleased(agg.getReleased() + source.getReleased());
    }

    private void mapPlacementBucketToPlacementDTO(final ItemPlacementBucket bucket, final ItemPlacementMetricDTO qdataBucket) {
        if (bucket.getType() != null) {
            switch (bucket.getType()) {
                case ADDED:
                    qdataBucket.setReceived(qdataBucket.getReceived() + bucket.getCnt());
                    break;
                case RELEASED:
                    qdataBucket.setReleased(qdataBucket.getReleased() + bucket.getCnt());
                    break;
                default:
            }
        }
    }

    private void mapLabelingBucketToPlacementDTO(final ItemLabelingBucket bucket, final ItemPlacementMetricDTO qdataBucket) {
        if (bucket.getLabel() != null && bucket.getLabel().isFormsResolution()) {
            qdataBucket.setReviewed(qdataBucket.getReviewed() + bucket.getCnt());
        }
    }

}
