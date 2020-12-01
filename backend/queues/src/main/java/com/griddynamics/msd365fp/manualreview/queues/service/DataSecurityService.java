// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import com.griddynamics.msd365fp.manualreview.queues.model.BasicItemInfo;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueView;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.LinkAnalysis;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue;
import lombok.extern.slf4j.Slf4j;
import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.diff.Diff;
import org.javers.core.diff.changetype.PropertyChange;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Collection;
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
                userAssignedToQueueViewAsSupervisor(queueView, actor) ||
                userAssignedToQueueViewAsReviewer(queueView, actor);
    }

    public boolean checkPermissionForQueueReading(
            @NonNull Authentication authentication,
            @NonNull Queue queue) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read a queue [{}].", actor, queue.getId());
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                roles.contains(SENIOR_ANALYST_ROLE) ||
                userAssignedToQueueAsSupervisor(queue, actor) ||
                userAssignedToQueueAsReviewer(queue, actor);
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
            @NonNull BasicItemInfo item,
            @Nullable QueueView queueView) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read an item [{}] in queue view [{}].",
                actor, item.getId(), queueView == null ? null : queueView.getViewId());
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));

        return roles.contains(ADMIN_MANAGER_ROLE) ||
                roles.contains(SENIOR_ANALYST_ROLE) ||
                userHasAccessToItemAsLockOwner(item, actor) ||
                userHasAccessToItemInQueueView(item, actor, queueView);
    }

    public boolean checkPermissionForItemReading(
            @NonNull Authentication authentication,
            @NonNull BasicItemInfo item,
            @Nullable Collection<Queue> queues) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read an item [{}].",
                actor, item.getId());
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));

        return roles.contains(ADMIN_MANAGER_ROLE) ||
                roles.contains(SENIOR_ANALYST_ROLE) ||
                userHasAccessToItemAsLockOwner(item, actor) ||
                (queues != null && queues.stream().anyMatch(queue -> userHasAccessToItemInQueue(item, actor, queue)));
    }

    public boolean checkPermissionForItemUpdate(
            @NonNull Authentication authentication,
            @NonNull BasicItemInfo item) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.info("User [{}] has attempted to modify the [{}] item.", actor, item.getId());
        return userHasAccessToItemAsLockOwner(item, actor);
    }

    public boolean checkPermissionForItemUpdateWithoutLock(
            @NonNull Authentication authentication,
            @NonNull BasicItemInfo item,
            @Nullable Collection<Queue> queues) {
        return checkPermissionRestrictionForItemUpdateWithoutLock(authentication, item, queues) == null;
    }

    public String checkPermissionRestrictionForItemUpdateWithoutLock(
            @NonNull Authentication authentication,
            @NonNull BasicItemInfo item,
            @Nullable Collection<Queue> queues) {
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.info("User [{}] has attempted to label item [{}] in batch.", actor, item.getId());

        if (roles.contains(ADMIN_MANAGER_ROLE)) {
            return null;
        }
        if (item.getLock().getOwnerId() != null && !userHasAccessToItemAsLockOwner(item, actor)) {
            return "Item locked by another analyst.";
        }
        if (itemIsEscalated(item)) {
            return "Item is escalated.";
        }
        if (roles.contains(SENIOR_ANALYST_ROLE)) {
            return null;
        }
        if (!item.isActive()) {
            return "Item is inactive.";
        }
        if (queues == null) {
            return "Item cannot be updated without queue.";
        } else if (queues.stream()
                .filter(q -> userHasAccessToItemInQueue(item, actor, q))
                .findAny()
                .isEmpty()) {
            return "Item is unavailable for current user.";
        }
        return null;
    }

    public boolean checkPermissionForItemLock(
            @NonNull Authentication authentication,
            @NonNull BasicItemInfo item,
            @NonNull QueueView queueView) {
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.info("User [{}] has attempted to lock the [{}] item.", actor, item.getId());
        return (item.getLock() == null || item.getLock().getOwnerId() == null) &&
                !queueView.getViewType().isAbstract() &&
                (roles.contains(ADMIN_MANAGER_ROLE) ||
                        userAssignedToQueueViewAsSupervisor(queueView, actor) ||
                        userAssignedToQueueViewAsReviewer(queueView, actor));
    }

    public boolean checkPermissionForLinkAnalysisCreation(
            @NonNull Authentication authentication,
            @NonNull LinkAnalysis entry) {
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.info("User [{}] attempt to create [{}] link analysis entry.", actor, entry.getId());
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                (actor != null && actor.equals(entry.getOwnerId()));
    }

    public boolean checkPermissionForLinkAnalysisRead(
            @NonNull Authentication authentication,
            @NonNull LinkAnalysis entry) {
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] attempt to fread [{}] link analysis entry.", actor, entry.getId());
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                (actor != null && actor.equals(entry.getOwnerId()));
    }

    private boolean itemBelongsToQueue(
            @NonNull final BasicItemInfo item,
            @Nullable final Queue queue) {
        return queue != null && item.isActive() &&
                ((queue.isResidual() && CollectionUtils.isEmpty(item.getQueueIds())) ||
                        (!queue.isResidual() && item.getQueueIds().contains(queue.getId())));
    }

    private boolean userHasAccessToItemAsLockOwner(
            @NonNull final BasicItemInfo item,
            @Nullable final String actor) {
        return actor != null &&
                item.getLock() != null &&
                actor.equals(item.getLock().getOwnerId());
    }

    private boolean userHasAccessToItemInQueueView(
            @NonNull final BasicItemInfo item,
            @Nullable final String actor,
            @Nullable final QueueView queueView) {
        return queueView != null && itemBelongsToQueue(item, queueView.getQueue())
                && (userAssignedToQueueViewAsSupervisor(queueView, actor) ||
                (!itemIsEscalated(item) && userAssignedToQueueViewAsReviewer(queueView, actor)));
    }

    private boolean userHasAccessToItemInQueue(
            @NonNull final BasicItemInfo item,
            @Nullable final String actor,
            @Nullable final Queue queue) {
        return itemBelongsToQueue(item, queue)
                && (userAssignedToQueueAsSupervisor(queue, actor) ||
                (!itemIsEscalated(item) && userAssignedToQueueAsReviewer(queue, actor)));
    }

    private boolean itemIsEscalated(
            @NonNull final BasicItemInfo item) {
        return item.getEscalation() != null;
    }

    private boolean userAssignedToQueueViewAsSupervisor(
            @Nullable final QueueView queueView,
            @Nullable final String actor) {
        return queueView != null &&
                userAssignedToQueueAsSupervisor(queueView.getQueue(), actor);
    }

    private boolean userAssignedToQueueAsSupervisor(
            @Nullable final Queue queue,
            @Nullable final String actor) {
        return actor != null &&
                queue != null &&
                queue.getSupervisors() != null &&
                queue.getSupervisors().contains(actor);
    }

    private boolean userAssignedToQueueViewAsReviewer(
            @Nullable final QueueView queueView,
            @Nullable final String actor) {
        return queueView != null &&
                userAssignedToQueueAsReviewer(queueView.getQueue(), actor) &&
                QueueViewType.REGULAR.equals(queueView.getViewType());
    }

    private boolean userAssignedToQueueAsReviewer(
            @Nullable final Queue queue,
            @Nullable final String actor) {
        return actor != null &&
                queue != null &&
                queue.getReviewers() != null &&
                queue.getReviewers().contains(actor);
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
