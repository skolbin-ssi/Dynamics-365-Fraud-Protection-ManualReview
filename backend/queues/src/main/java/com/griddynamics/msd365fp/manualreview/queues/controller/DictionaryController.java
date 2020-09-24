// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.controller;


import com.griddynamics.msd365fp.manualreview.queues.model.DictionaryType;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.DictionaryValueDTO;
import com.griddynamics.msd365fp.manualreview.queues.service.DictionaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@Tag(name = "dictionary", description = "The Dictionary API")
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/dictionary")
@Secured({ADMIN_MANAGER_ROLE})
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @Operation(summary = "Get relevant results for specific type")
    @GetMapping(value = "/{type}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public List<String> getRelevantDictionaryEntities(@PathVariable("type") final String type,
                                                      @RequestParam final String value) {
        return dictionaryService.searchRelevantEntities(DictionaryType.valueOf(type.toUpperCase()), value);
    }

    @Operation(summary = "Creates a dictionary entry for specific type")
    @PostMapping(value = "/{type}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public void createDictionaryEntity(@PathVariable("type") final String type,
                                       @Valid @RequestBody final DictionaryValueDTO valueDto) {
        dictionaryService.createDictionaryEntity(DictionaryType.valueOf(type.toUpperCase()), valueDto);
    }

}
