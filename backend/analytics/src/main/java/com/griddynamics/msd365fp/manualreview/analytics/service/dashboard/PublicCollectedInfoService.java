// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.dto.CollectedAnalystInfoDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.CollectedQueueInfoDTO;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicCollectedInfoService {

    private final PublicCollectedInfoClient collectedInfoClient;
    private final ModelMapper modelMapper;

    public List<CollectedQueueInfoDTO> getCollectedQueueInfo(@Nullable final Set<String> queueIds) {
        return collectedInfoClient.getCollectedQueueInfo(queueIds).stream()
                .map(q -> modelMapper.map(q, CollectedQueueInfoDTO.class))
                .collect(Collectors.toList());
    }

    public CollectedQueueInfoDTO getCollectedQueueInfo(@NonNull final String queueId) throws NotFoundException {
        return modelMapper.map(
                collectedInfoClient.getCollectedQueueInfo(queueId),
                CollectedQueueInfoDTO.class);
    }

    public List<CollectedAnalystInfoDTO> getCollectedAnalystInfo(@Nullable final Set<String> analystIds) {
        return collectedInfoClient.getCollectedAnalystInfo(analystIds).stream()
                .map(a -> modelMapper.map(a, CollectedAnalystInfoDTO.class))
                .collect(Collectors.toList());
    }

    public CollectedAnalystInfoDTO getCollectedAnalystInfo(@NonNull final String analystId) throws NotFoundException {
        return modelMapper.map(
                collectedInfoClient.getCollectedAnalystInfo(analystId),
                CollectedAnalystInfoDTO.class);
    }

}
