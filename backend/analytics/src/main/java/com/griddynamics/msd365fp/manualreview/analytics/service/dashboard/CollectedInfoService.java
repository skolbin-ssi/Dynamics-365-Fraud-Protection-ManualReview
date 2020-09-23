// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.dto.CollectedAnalystInfoDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.dto.CollectedQueueInfoDTO;
import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedAnalystInfoEntity;
import com.griddynamics.msd365fp.manualreview.analytics.repository.CollectedAnalystInfoRepository;
import com.griddynamics.msd365fp.manualreview.analytics.repository.CollectedQueueInfoRepository;
import com.griddynamics.msd365fp.manualreview.azuregraph.client.AnalystClient;
import com.griddynamics.msd365fp.manualreview.model.Analyst;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class CollectedInfoService {

    private final CollectedAnalystInfoRepository analystInfoRepository;
    private final CollectedQueueInfoRepository queueInfoRepository;
    private final ModelMapper modelMapper;
    private final AnalystClient analystClient;

    @Value("${azure.cosmosdb.default-ttl}")
    private Duration defaultTtl;

    public List<CollectedQueueInfoDTO> getCollectedQueueInfo(@Nullable final Set<String> queueIds) {
        return StreamSupport.stream(queueInfoRepository.findAll().spliterator(), true)
                .filter(q -> CollectionUtils.isEmpty(queueIds) || queueIds.contains(q.getId()))
                .map(q -> modelMapper.map(q, CollectedQueueInfoDTO.class))
                .collect(Collectors.toList());
    }

    public CollectedQueueInfoDTO getCollectedQueueInfo(@NonNull final String queueId) throws NotFoundException {
        return modelMapper.map(
                queueInfoRepository.findById(queueId).orElseThrow(NotFoundException::new),
                CollectedQueueInfoDTO.class);
    }

    public List<CollectedAnalystInfoDTO> getCollectedAnalystInfo(@Nullable final Set<String> analystIds) {
        return StreamSupport.stream(analystInfoRepository.findAll().spliterator(), true)
                .filter(a -> CollectionUtils.isEmpty(analystIds) || analystIds.contains(a.getId()))
                .map(a -> modelMapper.map(a, CollectedAnalystInfoDTO.class))
                .collect(Collectors.toList());
    }

    public CollectedAnalystInfoDTO getCollectedAnalystInfo(@NonNull final String analystId) throws NotFoundException {
        return modelMapper.map(
                analystInfoRepository.findById(analystId).orElseThrow(NotFoundException::new),
                CollectedAnalystInfoDTO.class);
    }

    public boolean collectAnalystInfo() {
        List<Analyst> adAnalysts = analystClient.getAnalystsWithRoles(null);
        Map<String, CollectedAnalystInfoEntity> dbAnalysts =
                StreamSupport.stream(analystInfoRepository.findAll().spliterator(), false)
                        .collect(Collectors.toMap(CollectedAnalystInfoEntity::getId, cai -> cai));
        List<CollectedAnalystInfoEntity> updatedAnalysts = adAnalysts.stream()
                .flatMap(adAnalyst -> {
                    CollectedAnalystInfoEntity ai = dbAnalysts.get(adAnalyst.getId());
                    CollectedAnalystInfoEntity newAnalystInfo = new CollectedAnalystInfoEntity();
                    if (ai != null) {
                        modelMapper.map(ai, newAnalystInfo);
                    }
                    modelMapper.map(adAnalyst, newAnalystInfo);
                    if (newAnalystInfo.equals(ai)) {
                        return Stream.empty();
                    } else {
                        newAnalystInfo.setTtl(defaultTtl.toSeconds());
                        return Stream.of(newAnalystInfo);
                    }
                })
                .collect(Collectors.toList());
        if (!updatedAnalysts.isEmpty()) {
            analystInfoRepository.saveAll(updatedAnalysts);
        }
        return true;
    }

}
