package com.griddynamics.msd365fp.manualreview.queues.model;

import com.google.common.base.Joiner;
import com.griddynamics.msd365fp.manualreview.cosmos.utilities.ExtendedCosmosContainer;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import lombok.Builder;
import lombok.NoArgsConstructor;
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

        public ItemQueryConstructor itemFilter(ItemFilter itemFilter) {
            boolean arrayInPath = itemFilter.getField().getPath().contains("[]");
            String path;
            String localAlias;
            String array;
            if (arrayInPath) {
                // form "datainarray.field" from "data.in.array[].fiels"
                // and "datainarray" from "data.in.array[]"
                String fieldPath = itemFilter.getField().getPath();
                array = fieldPath.substring(0, fieldPath.indexOf("[]"));
                localAlias = getJoinClauseAliasName(array);
                path = fieldPath.substring(fieldPath.indexOf("[]") + "[]".length());
            } else {
                path = "." + itemFilter.getField().getPath();
                localAlias = alias;
                array = "";
            }
            String condition;
            Iterator<String> valuesIter;
            switch (itemFilter.getCondition()) {
                case IN:
                    condition = String.format(
                            "%s%s IN ('%s')",
                            localAlias,
                            path,
                            Joiner.on("', '").join(itemFilter.getValues())
                    );
                    break;
                case REGEXP:
                    valuesIter = itemFilter.getValues().iterator();
                    condition = String.format(
                            "udf.isMatchRegexp(%s%s, \"%s\")",
                            localAlias,
                            path,
                            valuesIter.next()
                    );
                    break;
                case BETWEEN:
                    valuesIter = itemFilter.getValues().iterator();
                    condition = String.format(
                            "(%1$s%2$s >= %3$s AND %1$s%2$s <= %4$s)",
                            localAlias,
                            path,
                            valuesIter.next(),
                            valuesIter.next()
                    );
                    break;
                case BETWEEN_ALPH:
                    valuesIter = itemFilter.getValues().iterator();
                    condition = String.format(
                            "(%1$s%2$s >= \"%3$s\" AND %1$s%2$s <= \"%4$s\")",
                            localAlias,
                            path,
                            valuesIter.next(),
                            valuesIter.next()
                    );
                    break;
                case BETWEEN_DATE:
                    valuesIter = itemFilter.getValues().iterator();
                    condition = String.format(
                            "(%s%s BETWEEN %s AND %s)",
                            localAlias,
                            path,
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
            if (arrayInPath) {
                List<String> parts = joinParts.computeIfAbsent(array, key -> new LinkedList<>());
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
                    "SELECT %1$s FROM %1$s %3$s WHERE %2$s",
                    alias,
                    Joiner.on(" ").join(queryParts),
                    getJoinClause()
            );
        }

        public String constructCount() {
            return String.format(
                    "SELECT VALUE COUNT(1) FROM %1$s %3$s WHERE %2$s",
                    alias,
                    Joiner.on(" ").join(queryParts),
                    getJoinClause()
            );
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

        private String getJoinClauseAliasName(String field) {
            return field.replaceAll("\\.", "");
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
    }


    @FunctionalInterface
    public interface ItemSelectQueryExecutor {
        PageableCollection<Item> execute(int size, String continuationToken);
    }

    @FunctionalInterface
    public interface ItemCountQueryExecutor {
        Integer execute();
    }
}
