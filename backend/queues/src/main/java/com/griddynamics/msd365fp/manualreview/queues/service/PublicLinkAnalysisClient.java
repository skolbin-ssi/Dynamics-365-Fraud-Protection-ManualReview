// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.LinkAnalysis;
import com.griddynamics.msd365fp.manualreview.queues.repository.LinkAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.MESSAGE_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicLinkAnalysisClient {

    private final LinkAnalysisRepository linkAnalysisRepository;

    @PreAuthorize("@dataSecurityService.checkPermissionForLinkAnalysisCreation(authentication, #entry)")
    public void saveLinkAnalysisEntry(final LinkAnalysis entry) {
        linkAnalysisRepository.save(entry);
    }

    @PostAuthorize("@dataSecurityService.checkPermissionForLinkAnalysisRead(authentication, returnObject)")
    public LinkAnalysis getLinkAnalysisEntry(String id) throws NotFoundException {
        return linkAnalysisRepository.findById(id).orElseThrow(() -> new NotFoundException(MESSAGE_NOT_FOUND));
    }

}
