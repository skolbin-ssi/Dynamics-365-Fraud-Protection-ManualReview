// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.SetUtils;
import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.diff.Diff;
import org.javers.core.diff.changetype.PropertyChange;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.ADMIN_MANAGER_ROLE;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.SENIOR_ANALYST_ROLE;
import static org.javers.core.diff.ListCompareAlgorithm.AS_SET;


@Service
@Slf4j
public class DataSecurityService {

    public static final List<String> QUEUE_FIELDS_ALLOWED_TO_UPDATE_FOR_MANAGER = List.of(
            "reviewers",
            "supervisors",
            "name",
            "ttl",
            "active",
            "deleted",
            "processingDeadline");
    public static final List<String> QUEUE_FIELDS_ALLOWED_TO_UPDATE_FOR_SR_ANALYST = List.of(
            "reviewers",
            "supervisors");

    private final Javers javers = JaversBuilder.javers()
            .withListCompareAlgorithm(AS_SET)
            .build();


    public boolean checkPermissionForQueueViewReading(
            @NonNull Authentication authentication,
            @NonNull QueueView queueView) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read a queue view [{}].", actor, queueView.getViewId());
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                roles.contains(SENIOR_ANALYST_ROLE) ||
                userHasAccessToQueueViewAsSupervisor(queueView, actor) ||
                userHasAccessToQueueViewAsReviewer(queueView, actor);
    }

    public boolean checkPermissionForQueueReading(
            @NonNull Authentication authentication,
            @NonNull Queue queue) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read a queue [{}].", actor, queue.getId());
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                roles.contains(SENIOR_ANALYST_ROLE) ||
                userHasAccessToQueue(queue, actor);
    }

    public boolean checkPermissionForQueueCreation(@NonNull Authentication authentication) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.info("User [{}] has attempted to create a queue.", actor);
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) || roles.contains(SENIOR_ANALYST_ROLE);
    }

    public boolean checkPermissionForQueueUpdate(
            @NonNull Authentication authentication,
            @NonNull Queue newVersion,
            @NonNull Queue oldVersion) {
        Diff diff = javers.compare(oldVersion, newVersion);

        boolean containsFieldsProhibitedForManager = diffContainsNonPropertyChange(diff) ||
                diffContainsPropertyChangeIsNotInFieldList(diff, QUEUE_FIELDS_ALLOWED_TO_UPDATE_FOR_MANAGER);

        boolean containsFieldsProhibitedForSrAnalyst = diffContainsNonPropertyChange(diff) ||
                diffContainsPropertyChangeIsNotInFieldList(diff, QUEUE_FIELDS_ALLOWED_TO_UPDATE_FOR_SR_ANALYST);

        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.info("User [{}] has attempted to modify the queue [{}]: [{}]", actor, newVersion.getId(), diff);
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));

        return (roles.contains(ADMIN_MANAGER_ROLE) && !containsFieldsProhibitedForManager) ||
                (roles.contains(SENIOR_ANALYST_ROLE) && !containsFieldsProhibitedForSrAnalyst);
    }


    public boolean checkPermissionForItemReading(
            @NonNull Authentication authentication,
            @NonNull Item item,
            @Nullable QueueView queueView) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read an item [{}] in queue view [{}].",
                actor, item.getId(), queueView == null ? null : queueView.getViewId());
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));

        return (queueView == null || itemBelongsToQueue(item, queueView)) &&
                (item.isActive() || roles.contains(ADMIN_MANAGER_ROLE)) &&
                (userHasAccessToItemAsLockOwner(item, actor) ||
                        roles.contains(ADMIN_MANAGER_ROLE) ||
                        roles.contains(SENIOR_ANALYST_ROLE) ||
                        userHasAccessToQueueViewAsSupervisor(queueView, actor) ||
                        userHasAccessToQueueViewAsReviewer(queueView, actor));
    }

    public boolean checkPermissionForItemUpdate(
            @NonNull Authentication authentication,
            @NonNull Item item) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.info("User [{}] has attempted to modify the [{}] item.", actor, item.getId());
        return userHasAccessToItemAsLockOwner(item, actor);
    }

    public boolean checkPermissionForItemLock(
            @NonNull Authentication authentication,
            @NonNull Item item,
            @NonNull QueueView queueView) {
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.info("User [{}] has attempted to lock the [{}] item.", actor, item.getId());
        return (item.getLock() == null || item.getLock().getOwnerId() == null) &&
                !queueView.getViewType().isAbstract() &&
                (roles.contains(ADMIN_MANAGER_ROLE) ||
                        userHasAccessToQueueViewAsSupervisor(queueView, actor) ||
                        userHasAccessToQueueViewAsReviewer(queueView, actor));
    }

    private boolean itemBelongsToQueue(
            @NonNull final Item item,
            @NonNull final QueueView queueView) {
        return (queueView.isResidual() && CollectionUtils.isEmpty(item.getQueueIds())) ||
                (!queueView.isResidual() && item.getQueueIds().contains(queueView.getQueueId()));
    }

    private boolean userHasAccessToItemAsLockOwner(
            @NonNull final Item item,
            @NonNull final String actor) {
        return item.getLock() != null &&
                actor.equals(item.getLock().getOwnerId());
    }

    private boolean userHasAccessToQueue(
            @NonNull final Queue queue,
            @NonNull final String actor) {
        return SetUtils.union(
                Objects.requireNonNullElse(queue.getSupervisors(), Collections.emptySet()),
                Objects.requireNonNullElse(queue.getReviewers(), Collections.emptySet()))
                .contains(actor);
    }

    private boolean userHasAccessToQueueViewAsSupervisor(
            @Nullable final QueueView queueView,
            @NonNull final String actor) {
        return queueView != null &&
                queueView.getSupervisors() != null &&
                queueView.getSupervisors().contains(actor);
    }

    private boolean userHasAccessToQueueViewAsReviewer(
            @Nullable final QueueView queueView,
            @NonNull final String actor) {
        return queueView != null &&
                queueView.getReviewers() != null &&
                queueView.getReviewers().contains(actor) &&
                QueueViewType.REGULAR.equals(queueView.getViewType());
    }

    private boolean diffContainsNonPropertyChange(
            @NonNull final Diff diff) {
        return diff.getChangesByType(PropertyChange.class).size() < diff.getChanges().size();
    }

    private boolean diffContainsPropertyChangeIsNotInFieldList(
            @NonNull final Diff diff,
            @NonNull final List<String> fieldNameList) {
        return diff.getChangesByType(PropertyChange.class).stream()
                .anyMatch(pc -> !fieldNameList.contains(pc.getPropertyName()));
    }


}
