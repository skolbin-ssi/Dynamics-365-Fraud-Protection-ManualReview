// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import com.google.common.base.Joiner;
import com.griddynamics.msd365fp.manualreview.cosmos.utilities.ExtendedCosmosContainer;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.lang.Nullable;
import org.springframework.util.CollectionUtils;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.TOP_ELEMENT_IN_CONTAINER_CONTINUATION;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.TOP_ELEMENT_IN_CONTAINER_PAGE_SIZE;
import static lombok.AccessLevel.PRIVATE;

@Slf4j
@Builder(builderMethodName = "constructor", buildMethodName = "construct", builderClassName = "ItemQueryConstructor")
@NoArgsConstructor(access = PRIVATE)
public class ItemQuery {

    public static ItemQueryConstructor constructor(String alias) {
        return new ItemQueryConstructor().alias(alias);
    }

    public static class ItemQueryConstructor {

        private String alias;
        private final List<String> queryParts = new ArrayList<>();

        private final Map<String, List<String>> joinParts = new TreeMap<>();

        ItemQueryConstructor alias(String alias) {
            this.alias = alias;
            return this;
        }

        public ItemQueryConstructor all(Collection<ItemFilter> itemFilters) {
            if (itemFilters.isEmpty()) {
                queryParts.add("true");
                return this;
            }
            Iterator<ItemFilter> itemFilterIterator = itemFilters.iterator();
            itemFilter(itemFilterIterator.next());
            while (itemFilterIterator.hasNext()) {
                and();
                itemFilter(itemFilterIterator.next());
            }
            return this;
        }

        public ItemQueryConstructor id(String id) {
            queryParts.add(String.format(
                    "%s.id='%s'",
                    alias,
                    id)
            );
            return this;
        }

        public ItemQueryConstructor queueId(String queueId) {
            String condition = String.format(
                    "ARRAY_CONTAINS(%s.queueIds, \"%s\")",
                    alias,
                    queueId
            );
            queryParts.add(condition);
            return this;
        }

        public ItemQueryConstructor customQueryCondition(String condition) {
            queryParts.add(condition);
            return this;
        }

        public ItemQueryConstructor not() {
            queryParts.add("NOT");
            return this;
        }

        public ItemQueryConstructor and() {
            queryParts.add("AND");
            return this;
        }

        public ItemQueryConstructor or() {
            queryParts.add("OR");
            return this;
        }

        public ItemQueryConstructor filterFieldIsDefined(ItemDataField field) {
            FieldDecomposition decomposition = decomposeField(field);
            String condition = String.format(
                    "IS_DEFINED(%s%s)",
                    decomposition.getLocalAlias(),
                    decomposition.getPath());
            if (decomposition.getArray() != null) {
                List<String> parts = joinParts.computeIfAbsent(decomposition.getArray(), key -> new LinkedList<>());
                if (!parts.isEmpty()) parts.add("AND");
                parts.add(condition);
                queryParts.add("true");
            } else {
                queryParts.add(condition);
            }
            return this;
        }

        public ItemQueryConstructor itemFilter(ItemFilter itemFilter) {
            FieldDecomposition decomposition = decomposeField(itemFilter.getField());
            String condition;
            Iterator<String> valuesIter;
            switch (itemFilter.getCondition()) {
                case IN:
                    condition = String.format(
                            "%s%s IN ('%s')",
                            decomposition.getLocalAlias(),
                            decomposition.getPath(),
                            Joiner.on("', '").join(itemFilter.getValues())
                    );
                    break;
                case REGEXP:
                    valuesIter = itemFilter.getValues().iterator();
                    condition = String.format(
                            "udf.isMatchRegexp(%s%s, \"%s\")",
                            decomposition.getLocalAlias(),
                            decomposition.getPath(),
                            valuesIter.next()
                    );
                    break;
                case BETWEEN:
                    valuesIter = itemFilter.getValues().iterator();
                    condition = String.format(
                            "(%1$s%2$s >= %3$s AND %1$s%2$s <= %4$s)",
                            decomposition.getLocalAlias(),
                            decomposition.getPath(),
                            valuesIter.next(),
                            valuesIter.next()
                    );
                    break;
                case BETWEEN_ALPH:
                    valuesIter = itemFilter.getValues().iterator();
                    condition = String.format(
                            "(%1$s%2$s >= \"%3$s\" AND %1$s%2$s <= \"%4$s\")",
                            decomposition.getLocalAlias(),
                            decomposition.getPath(),
                            valuesIter.next(),
                            valuesIter.next()
                    );
                    break;
                case BETWEEN_DATE:
                    valuesIter = itemFilter.getValues().iterator();
                    condition = String.format(
                            "(%s%s BETWEEN %s AND %s)",
                            decomposition.getLocalAlias(),
                            decomposition.getPath(),
                            valuesIter.next(),
                            valuesIter.next()
                    );
                    break;
                default:
                    throw new RuntimeException(
                            String.format("Could not build query due to unexpected FilterCondition: %s",
                                    itemFilter.getCondition())
                    );
            }
            if (decomposition.getArray() != null) {
                List<String> parts = joinParts.computeIfAbsent(decomposition.getArray(), key -> new LinkedList<>());
                if (!parts.isEmpty()) parts.add("AND");
                parts.add(condition);
                queryParts.add("true");
            } else {
                queryParts.add(condition);
            }
            return this;
        }

        public ItemQueryConstructor order(Sort.Order order) {
            queryParts.add(String.format(
                    "ORDER BY %s.%s %s",
                    alias,
                    order.getProperty(),
                    order.getDirection())
            );
            return this;
        }

        public ItemQueryConstructor active(boolean active) {
            queryParts.add(String.format(
                    "%s.active=%s",
                    alias,
                    active)
            );
            return this;
        }

        public ItemQueryConstructor importedBefore(OffsetDateTime time) {
            if (time != null) {
                queryParts.add(String.format(
                        "%s.imported<%s",
                        alias,
                        time.toEpochSecond()));
            } else {
                queryParts.add("true");
            }
            return this;
        }

        public ItemQueryConstructor lockedInQueue(String queue) {
            queryParts.add(String.format(
                    "%s.lock.queueId='%s'",
                    alias,
                    queue));
            return this;
        }

        public ItemQueryConstructor escalatedInQueue(String queue) {
            queryParts.add(String.format(
                    "%s.escalation.queueId='%s'",
                    alias,
                    queue));
            return this;
        }

        public ItemQueryConstructor heldInQueue(String queue) {
            queryParts.add(String.format(
                    "%s.hold.queueId='%s'",
                    alias,
                    queue));
            return this;
        }

        public ItemQueryConstructor lockedBefore(OffsetDateTime time) {
            if (time != null) {
                queryParts.add(String.format(
                        "%s.lock.locked<%s",
                        alias,
                        time.toEpochSecond()));
            } else {
                queryParts.add("true");
            }
            return this;
        }

        public ItemQueryConstructor updatedAfter(OffsetDateTime time) {
            if (time != null) {
                queryParts.add(String.format(
                        "%s._ts>=%s",
                        alias,
                        time.toEpochSecond())
                );
            } else {
                queryParts.add("true");
            }
            return this;
        }


        public ItemQueryConstructor enrichedAfter(OffsetDateTime time) {
            if (time != null) {
                queryParts.add(String.format(
                        "%s.enriched>=%s",
                        alias,
                        time.toEpochSecond())
                );
            } else {
                queryParts.add("true");
            }
            return this;
        }

        //TODO: delete it
        public ItemQueryConstructor includeLocked(boolean includeLocked) {
            if (!includeLocked) {
                queryParts.add(String.format(
                        "IS_NULL(%s.lock.ownerId)",
                        alias)
                );
            } else {
                queryParts.add("true");
            }
            return this;
        }

        @SuppressWarnings("java:S5411")
        public ItemQueryConstructor locked(@Nullable Boolean locked) {
            if (locked != null) {
                if (locked) {
                    queryParts.add(String.format(
                            "!IS_NULL(%s.lock.ownerId)",
                            alias));
                } else {
                    queryParts.add(String.format(
                            "(IS_NULL(%1$s.lock.ownerId) OR NOT IS_DEFINED(%1$s.lock.ownerId))",
                            alias)
                    );
                }
            } else {
                queryParts.add("true");
            }
            return this;
        }

        @SuppressWarnings("java:S5411")
        public ItemQueryConstructor held(@Nullable Boolean held) {
            if (held != null) {
                if (held) {
                    queryParts.add(String.format(
                            "!IS_NULL(%s.hold.ownerId)",
                            alias));
                } else {
                    queryParts.add(String.format(
                            "(IS_NULL(%1$s.hold.ownerId) OR NOT IS_DEFINED(%1$s.hold.ownerId))",
                            alias)
                    );
                }
            } else {
                queryParts.add("true");
            }
            return this;
        }

        public ItemQueryConstructor queueIdsAreEmpty() {
            queryParts.add(String.format(
                    "(IS_NULL(%1$s.queueIds) OR %1$s.queueIds = [])",
                    alias));
            return this;
        }

        //TODO: rework
        public ItemQueryConstructor notEscalation() {
            queryParts.add(String.format(
                    "(NOT IS_DEFINED(%1$s.escalation.queueId) OR IS_NULL(%1$s.escalation.queueId)) ",
                    alias));
            return this;
        }

        public String constructSelect() {
            return String.format(
                    "SELECT %1$s FROM %1$s %2$s WHERE %3$s",
                    alias,
                    getJoinClause(),
                    Joiner.on(" ").join(queryParts));
        }

        public String constructCount() {
            return String.format(
                    "SELECT VALUE COUNT(1) FROM %1$s %2$s WHERE %3$s",
                    alias,
                    getJoinClause(),
                    Joiner.on(" ").join(queryParts));
        }

        public String constructSample(ItemDataField field) {
            FieldDecomposition decomposition = decomposeField(field);
            return String.format(
                    "SELECT VALUE root FROM (SELECT DISTINCT %1$s%2$s as val FROM %3$s %4$s WHERE %5$s) AS root",
                    decomposition.getLocalAlias(),
                    decomposition.getPath(),
                    alias,
                    getJoinClause(),
                    Joiner.on(" ").join(queryParts));
        }

        private String getJoinClause() {
            return CollectionUtils.isEmpty(joinParts) ? "" :
                    joinParts.entrySet().stream()
                            .map(entry -> String.format(
                                    "JOIN (SELECT VALUE %1$s FROM %1$s IN %2$s.%3$s WHERE %4$s) %1$s",
                                    getJoinClauseAliasName(entry.getKey()),
                                    alias,
                                    entry.getKey(),
                                    Joiner.on(" ").join(entry.getValue())))
                            .collect(Collectors.joining(" "));
        }

        public ItemSelectQueryExecutor constructSelectExecutor(ExtendedCosmosContainer itemsContainer) {
            return (size, continuationToken) -> {
                String query = constructSelect();
                ExtendedCosmosContainer.Page res;
                try {
                    res = itemsContainer.runCrossPartitionPageableQuery(
                            query, size, continuationToken);
                } catch (Exception e) {
                    log.error("Constructed query execution ended with error. Query: [{}]", query);
                    throw e;
                }
                List<Item> queriedItems = res.getContent()
                        .map(cip -> itemsContainer.castCosmosObjectToClassInstance(cip.get(alias), Item.class))
                        .flatMap(Optional::stream)
                        .collect(Collectors.toList());
                return new PageableCollection<>(queriedItems, res.getContinuationToken());
            };
        }

        public ItemCountQueryExecutor constructCountExecutor(ExtendedCosmosContainer itemsContainer) {
            return () -> {
                String query = constructCount();
                ExtendedCosmosContainer.Page res;
                try {
                    res = itemsContainer.runCrossPartitionPageableQuery(query,
                            TOP_ELEMENT_IN_CONTAINER_PAGE_SIZE, TOP_ELEMENT_IN_CONTAINER_CONTINUATION);
                } catch (Exception e) {
                    log.error("Constructed query execution ended with error. Query: [{}]", query);
                    throw e;
                }
                Optional<Integer> optionalCount = res.getContent()
                        .map(cip -> (int) cip.get("_aggregate"))
                        .findFirst();
                return optionalCount.orElse(0);
            };
        }


        public FilterSampleQueryExecutor constructSampleExecutor(ExtendedCosmosContainer itemsContainer, ItemDataField field) {
            return () -> {
                String query = constructSample(field);
                try {
                    return itemsContainer.runCrossPartitionQuery(query)
                            .map(cip -> cip.getString("val"))
                            .collect(Collectors.toSet());
                } catch (Exception e) {
                    log.error("Constructed query execution ended with error. Query: [{}]", query);
                    throw e;
                }
            };
        }

        private FieldDecomposition decomposeField(ItemDataField field) {
            boolean arrayInPath = field.getPath().contains("[]");
            FieldDecomposition result = new FieldDecomposition();

            if (arrayInPath) {
                // form "datainarray.field" from "data.in.array[].fiels"
                // and "datainarray" from "data.in.array[]"
                String fieldPath = field.getPath();
                result.setArray(fieldPath.substring(0, fieldPath.indexOf("[]")));
                result.setLocalAlias(getJoinClauseAliasName(result.getArray()));
                result.setPath(fieldPath.substring(fieldPath.indexOf("[]") + "[]".length()));
            } else {
                result.setPath("." + field.getPath());
                result.setLocalAlias(alias);
                result.setArray(null);
            }
            return result;
        }

        private String getJoinClauseAliasName(String field) {
            return field.replaceAll("\\.", "");
        }

        @Getter
        @Setter
        private static class FieldDecomposition {
            private String path;
            private String localAlias;
            private String array;
        }

    }


    @FunctionalInterface
    public interface ItemSelectQueryExecutor {
        PageableCollection<Item> execute(int size, String continuationToken);
    }

    @FunctionalInterface
    public interface ItemCountQueryExecutor {
        Integer execute();
    }

    @FunctionalInterface
    public interface FilterSampleQueryExecutor {
        Set<String> execute();
    }
}
