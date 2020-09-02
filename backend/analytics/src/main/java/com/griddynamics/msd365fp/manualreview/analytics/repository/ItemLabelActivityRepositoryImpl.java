package com.griddynamics.msd365fp.manualreview.analytics.repository;

import com.griddynamics.msd365fp.manualreview.analytics.model.ItemLabelingBucket;
import com.griddynamics.msd365fp.manualreview.analytics.model.LabelingTimeBucket;
import com.griddynamics.msd365fp.manualreview.cosmos.utilities.ExtendedCosmosContainer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.util.CollectionUtils;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
public class ItemLabelActivityRepositoryImpl implements ItemLabelActivityRepositoryCustomMethods {

    private final ExtendedCosmosContainer itemLabelActivityContainer;

    @Override
    public List<ItemLabelingBucket> getQueuePerformance(@NonNull final OffsetDateTime startDateTime,
                                                        @NonNull final OffsetDateTime endDateTime,
                                                        @NonNull final Duration aggregation,
                                                        final Set<String> analystIds,
                                                        final Set<String> queueIds) {
        return itemLabelActivityContainer.runCrossPartitionQuery(
                String.format(
                        "SELECT VALUE root FROM " +
                                "(SELECT c.label, c.merchantRuleDecision, count(c.label) AS cnt, c.queueId AS id, udf.getTimestampBucket(%1$s,%3$s, c.labeled) AS bucket " +
                                "FROM c where " +
                                "(c.labeled BETWEEN %1$s AND %2$s) " +
                                "%4$s " +
                                "%5$s " +
                                "group by c.queueId, udf.getTimestampBucket(%1$s,%3$s,c.labeled), c.label, c.merchantRuleDecision) " +
                                "AS root",
                        startDateTime.toEpochSecond(),
                        endDateTime.toEpochSecond(),
                        aggregation.getSeconds(),
                        CollectionUtils.isEmpty(analystIds) ? "" :
                                String.format("AND c.analystId IN ('%1$s') ", String.join("','", analystIds)),
                        CollectionUtils.isEmpty(queueIds) ? "" :
                                String.format("AND c.queueId IN ('%1$s') ", String.join("','", queueIds))))
                .map(cip -> itemLabelActivityContainer.castCosmosObjectToClassInstance(cip.toJson(), ItemLabelingBucket.class))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    @Override
    public List<ItemLabelingBucket> getAnalystPerformance(@NonNull final OffsetDateTime startDateTime,
                                                          @NonNull final OffsetDateTime endDateTime,
                                                          @NonNull final Duration aggregation,
                                                          final Set<String> analystIds,
                                                          final Set<String> queueIds) {
        return itemLabelActivityContainer.runCrossPartitionQuery(
                String.format(
                        "SELECT VALUE root FROM " +
                                "(SELECT c.label, c.merchantRuleDecision, count(c.label) AS cnt, c.analystId as id, udf.getTimestampBucket(%1$s,%3$s,c.labeled) AS bucket " +
                                "FROM c where " +
                                "(c.labeled BETWEEN %1$s AND %2$s) " +
                                "%4$s " +
                                "%5$s " +
                                "group by c.analystId, udf.getTimestampBucket(%1$s,%3$s,c.labeled), c.label, c.merchantRuleDecision) " +
                                "AS root",
                        startDateTime.toEpochSecond(),
                        endDateTime.toEpochSecond(),
                        aggregation.getSeconds(),
                        CollectionUtils.isEmpty(analystIds) ? "" :
                                String.format("AND c.analystId IN ('%1$s') ", String.join("','", analystIds)),
                        CollectionUtils.isEmpty(queueIds) ? "" :
                                String.format("AND c.queueId IN ('%1$s') ", String.join("','", queueIds))))
                .map(cip -> itemLabelActivityContainer.castCosmosObjectToClassInstance(cip.toJson(), ItemLabelingBucket.class))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }


    @Override
    public List<ItemLabelingBucket> getTotalPerformance(@NonNull final OffsetDateTime startDateTime,
                                                        @NonNull final OffsetDateTime endDateTime,
                                                        final Set<String> analystIds,
                                                        final Set<String> queueIds) {
        return itemLabelActivityContainer.runCrossPartitionQuery(
                String.format(
                        "SELECT VALUE root FROM " +
                                "(SELECT c.label, c.merchantRuleDecision, count(c.label) AS cnt " +
                                "FROM c where " +
                                "(c.labeled BETWEEN %1$s AND %2$s) " +
                                "%3$s " +
                                "%4$s " +
                                "group by c.label, c.merchantRuleDecision) " +
                                "AS root",
                        startDateTime.toEpochSecond(),
                        endDateTime.toEpochSecond(),
                        CollectionUtils.isEmpty(analystIds) ? "" :
                                String.format("AND c.analystId IN ('%1$s') ", String.join("','", analystIds)),
                        CollectionUtils.isEmpty(queueIds) ? "" :
                                String.format("AND c.queueId IN ('%1$s') ", String.join("','", queueIds))))
                .map(cip -> itemLabelActivityContainer.castCosmosObjectToClassInstance(cip.toJson(), ItemLabelingBucket.class))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabelingTimeBucket> getSpentTime(@NonNull final OffsetDateTime startDateTime,
                                                 @NonNull final OffsetDateTime endDateTime,
                                                 final Set<String> analystIds,
                                                 final Set<String> queueIds) {
        return itemLabelActivityContainer.runCrossPartitionQuery(
                String.format(
                        "SELECT VALUE root FROM " +
                                "(SELECT c.label, sum(c.decisionApplyingDuration) AS totalDuration, count(c.labeled) AS cnt " +
                                "FROM c where " +
                                "(c.labeled BETWEEN %1$s AND %2$s) " +
                                "%3$s " +
                                "%4$s " +
                                "group by c.label) " +
                                "AS root",
                        startDateTime.toEpochSecond(),
                        endDateTime.toEpochSecond(),
                        CollectionUtils.isEmpty(analystIds) ? "" :
                                String.format("AND c.analystId IN ('%1$s') ", String.join("','", analystIds)),
                        CollectionUtils.isEmpty(queueIds) ? "" :
                                String.format("AND c.queueId IN ('%1$s') ", String.join("','", queueIds))))
                .map(cip -> itemLabelActivityContainer.castCosmosObjectToClassInstance(cip.toJson(), LabelingTimeBucket.class))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

}
