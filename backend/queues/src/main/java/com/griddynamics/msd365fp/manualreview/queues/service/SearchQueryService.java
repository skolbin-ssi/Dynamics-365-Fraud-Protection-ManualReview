// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.ItemSearchQueryDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.SearchQuery;
import com.griddynamics.msd365fp.manualreview.queues.repository.SearchQueryRepository;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchQueryService {
    private final SearchQueryRepository searchQueryRepository;
    private final ModelMapper modelMapper;

    @Value("${mr.search-query.ttl}")
    private Duration searchQueryTtl;


    @Retry(name = "cosmosOptimisticUpdate")
    public String saveSearchQuery(
            final ItemSearchQueryDTO itemSearchQueryDTO) {
        SearchQuery searchQuery = modelMapper.map(itemSearchQueryDTO, SearchQuery.class);
        String searchQueryId = UUID.randomUUID().toString();
        searchQuery.setId(searchQueryId);
        searchQuery.setTtl(searchQueryTtl.toSeconds());
        searchQueryRepository.save(searchQuery);

        return searchQueryId;
    }

    public ItemSearchQueryDTO getSearchQuery(final String id) throws NotFoundException {
        return searchQueryRepository.findById(id)
                .map(searchQuery -> modelMapper.map(searchQuery, ItemSearchQueryDTO.class))
                .orElseThrow(() -> new NotFoundException(String.format("Search Query not found for id [%s]", id)));
    }
}
