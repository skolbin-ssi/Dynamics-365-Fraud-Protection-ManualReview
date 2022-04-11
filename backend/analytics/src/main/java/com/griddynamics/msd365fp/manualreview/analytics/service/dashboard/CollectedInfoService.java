// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.service.dashboard;

import com.griddynamics.msd365fp.manualreview.analytics.model.persistence.CollectedAnalystInfoEntity;
import com.griddynamics.msd365fp.manualreview.analytics.repository.CollectedAnalystInfoRepository;
import com.griddynamics.msd365fp.manualreview.azuregraph.client.AnalystClient;
import com.griddynamics.msd365fp.manualreview.model.Analyst;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class CollectedInfoService {

    private final CollectedAnalystInfoRepository analystInfoRepository;
    private final ModelMapper modelMapper;
    private final AnalystClient analystClient;

    @Value("${azure.cosmos.default-ttl}")
    private Duration defaultTtl;

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
