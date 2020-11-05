// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedAnalystInfoEntity;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedQueueInfoEntity;
import com.griddynamics.msd365fp.manualreview.analytics.repository.CollectedAnalystInfoRepository;
import com.griddynamics.msd365fp.manualreview.analytics.repository.CollectedQueueInfoRepository;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class PublicCollectedInfoClient {

    private final CollectedAnalystInfoRepository analystInfoRepository;
    private final CollectedQueueInfoRepository queueInfoRepository;

    @PostFilter("@dataSecurityService.checkPermissionForCollectedQueueInfoReading(authentication, filterObject)")
    public List<CollectedQueueInfoEntity> getCollectedQueueInfo(@Nullable final Set<String> queueIds) {
        return StreamSupport.stream(queueInfoRepository.findAll().spliterator(), true)
                .filter(q -> CollectionUtils.isEmpty(queueIds) || queueIds.contains(q.getId()))
                .collect(Collectors.toList());
    }

    @PostAuthorize("@dataSecurityService.checkPermissionForCollectedQueueInfoReading(authentication, returnObject)")
    public CollectedQueueInfoEntity getCollectedQueueInfo(@NonNull final String queueId) throws NotFoundException {
        return queueInfoRepository.findById(queueId).orElseThrow(NotFoundException::new);
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForCollectedAnalystInfoReading(authentication)")
    public List<CollectedAnalystInfoEntity> getCollectedAnalystInfo(@Nullable final Set<String> analystIds) {
        return StreamSupport.stream(analystInfoRepository.findAll().spliterator(), true)
                .filter(a -> CollectionUtils.isEmpty(analystIds) || analystIds.contains(a.getId()))
                .collect(Collectors.toList());
    }

    @PreAuthorize("@dataSecurityService.checkPermissionForCollectedAnalystInfoReading(authentication)")
    public CollectedAnalystInfoEntity getCollectedAnalystInfo(@NonNull final String analystId) throws NotFoundException {
        return analystInfoRepository.findById(analystId).orElseThrow(NotFoundException::new);
    }

}
