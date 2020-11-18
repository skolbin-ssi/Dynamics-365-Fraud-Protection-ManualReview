// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedQueueInfoEntity;
import com.griddynamics.msd365fp.manualreview.dfpauth.util.UserPrincipalUtility;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.ADMIN_MANAGER_ROLE;
import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.SENIOR_ANALYST_ROLE;


@Service
@Slf4j
public class DataSecurityService {


    public boolean checkPermissionForAnalystPerformanceReading(@NonNull Authentication authentication, @NonNull Set<String> analystIds) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read performance. Analysts: [{}].", actor, analystIds);
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                (analystIds.size() == 1 && analystIds.contains(actor));
    }

    public boolean checkPermissionForQueuePerformanceReading(@NonNull Authentication authentication, @NonNull Set<String> analystIds) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read performance. Analysts: [{}].", actor, analystIds);
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                (roles.contains(SENIOR_ANALYST_ROLE) && CollectionUtils.isEmpty(analystIds)) ||
                (analystIds.size() == 1 && analystIds.contains(actor));
    }

    public boolean checkPermissionForDemandSupplyInfoReading(@NonNull Authentication authentication) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read demand/supplay info.", actor);
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                roles.contains(SENIOR_ANALYST_ROLE);
    }

    public boolean checkPermissionForCollectedAnalystInfoReading(@NonNull Authentication authentication) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read collected analyst info.", actor);
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                roles.contains(SENIOR_ANALYST_ROLE);
    }

    public boolean checkPermissionForCollectedQueueInfoReading(@NonNull Authentication authentication, @Nullable CollectedQueueInfoEntity queueInfo) {
        String actor = UserPrincipalUtility.extractUserId(authentication);
        log.debug("User [{}] has attempted to read collected analyst info.", actor);
        List<String> roles = Objects.requireNonNull(UserPrincipalUtility.extractUserRoles(authentication));
        return roles.contains(ADMIN_MANAGER_ROLE) ||
                roles.contains(SENIOR_ANALYST_ROLE) ||
                (queueInfo != null && analystWasAssignedToQueue(actor, queueInfo));
    }

    private boolean analystWasAssignedToQueue(@NonNull String actor, @NonNull CollectedQueueInfoEntity queueInfo) {
        return (queueInfo.getAllTimeReviewers() != null && queueInfo.getAllTimeReviewers().contains(actor)) ||
                (queueInfo.getAllTimeSupervisors() != null && queueInfo.getAllTimeSupervisors().contains(actor)) ||
                (queueInfo.getReviewers() != null && queueInfo.getReviewers().contains(actor)) ||
                (queueInfo.getSupervisors() != null && queueInfo.getSupervisors().contains(actor));
    }

}
