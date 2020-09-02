package com.griddynamics.msd365fp.manualreview.queues.model;

import com.griddynamics.msd365fp.manualreview.model.Label;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Set;

@RequiredArgsConstructor
public enum QueueViewType {

    DIRECT(
            true,
            Set.of(
                    Label.values()),
            "i.active=true"),
    REGULAR(
            false,
            Set.of(
                    Label.ACCEPT,
                    Label.REJECT,
                    Label.WATCH_INCONCLUSIVE,
                    Label.WATCH_NA,
                    Label.ESCALATE),
            "i.active=true AND (NOT IS_DEFINED(i.escalation) OR IS_NULL(i.escalation))"),
    ESCALATION(
            false,
            Set.of(
                    Label.ACCEPT,
                    Label.REJECT,
                    Label.WATCH_INCONCLUSIVE,
                    Label.WATCH_NA,
                    Label.HOLD),
            "i.active=true AND IS_DEFINED(i.escalation) AND NOT IS_NULL(i.escalation)");

    /**
     * The type of view.
     * An abstract view:
     * - can't be stored in persisted queue entity
     * - can't be used in locking, holding, and similar activities
     * - doesn't have it's own id and reflect id of queue
     * - suit only as a temporal view for informational purposes
     */
    @Getter
    private final boolean isAbstract;

    /**
     * The list of labels that are available under this view
     */
    @Getter
    private final Set<Label> allowedLabels;

    /**
     * The query string.
     * This condition must be used for any item counting/select query
     * which is performed under current view.
     */
    @Getter
    private final String queryCondition;
}
