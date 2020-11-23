// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.controller;

import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.EmptySourceException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConditionException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemDataField;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.*;
import com.griddynamics.msd365fp.manualreview.queues.service.ItemService;
import com.griddynamics.msd365fp.manualreview.queues.service.PublicLinkAnalysisService;
import com.griddynamics.msd365fp.manualreview.queues.service.PublicItemService;
import com.griddynamics.msd365fp.manualreview.queues.service.SearchQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;
import java.util.Collection;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@RestController
@RequestMapping("/api/items")
@Tag(name = "items", description = "The Item API for observing and processing orders.")
@Slf4j
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Secured({ADMIN_MANAGER_ROLE})
public class ItemController {
    public static final String DEFAULT_SORTING_FIELD = "IMPORT_DATE";
    public static final String DEFAULT_SORTING_DIRECTION = "DESC";

    private final PublicItemService publicItemService;
    private final ItemService itemService;
    private final SearchQueryService searchQueryService;
    private final PublicLinkAnalysisService linAnalysisService;

    @Operation(summary = "Get item details by ID")
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public ItemDTO getItem(
            @PathVariable("id") final String id,
            @Parameter(description = "id of the queue which is used for item access")
            @RequestParam(required = false) String queueId) throws NotFoundException {
        return publicItemService.getItem(id, queueId);
    }

    @Operation(summary = "Get locked items for current user")
    @GetMapping(value = "/locked", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public Collection<ItemDTO> getLockedItemsForCurrentUser() throws BusyException {
        return publicItemService.getLockedItemsForCurrentUser();
    }

    @Operation(summary = "Unlock the specified item")
    @DeleteMapping(value = "/{id}/lock", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public ItemDTO unlockItem(
            @PathVariable("id") final String id,
            @Parameter(description = "id of the queue which is used for item access")
            @RequestParam(required = false) String queueId) throws NotFoundException, IncorrectConditionException {
        return publicItemService.unlockItem(id, queueId);
    }

    @Operation(summary = "Set the label and release the item by ID")
    @PatchMapping(value = "/{id}/label", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public void labelItem(
            @PathVariable("id") final String id,
            @Parameter(description = "id of the queue which is used for item access")
            @RequestParam(required = false) String queueId,
            @Valid @RequestBody final LabelDTO label) throws NotFoundException, IncorrectConditionException {
        publicItemService.labelItem(id, queueId, label);
    }

    @Operation(summary = "Set the label and release all items")
    @PatchMapping(value = "/batch/label", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public BatchLabelReportDTO batchLabelItem(
            @Valid @RequestBody final BatchLabelDTO batchLabel) throws NotFoundException, IncorrectConditionException, BusyException {
        return publicItemService.batchLabelItem(batchLabel);
    }

    @Operation(summary = "Add the note to the specified item")
    @PutMapping(value = "/{id}/note", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public void commentItem(
            @PathVariable("id") final String id,
            @Parameter(description = "id of the queue which is used for item access")
            @RequestParam(required = false) String queueId,
            @Valid @RequestBody final NoteDTO note) throws NotFoundException, IncorrectConditionException {
        publicItemService.commentItem(id, queueId, note);
    }

    @Operation(summary = "Add a tag to the specified item")
    @PatchMapping(value = "/{id}/tags", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public void tagItem(
            @PathVariable("id") final String id,
            @Parameter(description = "id of the queue which is used for item access")
            @RequestParam(required = false) String queueId,
            @Valid @RequestBody final TagDTO tag) throws NotFoundException, IncorrectConditionException {
        publicItemService.tagItem(id, queueId, tag);
    }

    @Operation(summary = "Save search query to the database")
    @PostMapping(value = "/search-query",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public String saveSearchQuery(
            @Valid @RequestBody final ItemSearchQueryDTO itemSearchQueryDTO
    ) {
        return searchQueryService.saveSearchQuery(itemSearchQueryDTO);
    }

    @Operation(summary = "Get search query by id")
    @GetMapping(value = "/search-query/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public ItemSearchQueryDTO getSearchQuery(
            @PathVariable("id") final String id
    ) throws NotFoundException {
        return searchQueryService.getSearchQuery(id);
    }

    @Operation(summary = "Execute saved search query and return search results")
    @GetMapping(value = "/search-query/{id}/results",
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public PageableCollection<ItemDTO> applySearchQuery(
            @PathVariable("id") final String id,
            @Parameter(description = "size of a page")
            @RequestParam(required = false, defaultValue = DEFAULT_ITEM_PAGE_SIZE_STR) final Integer size,
            @Parameter(description = "continuation token from previous request")
            @RequestParam(required = false) String continuation,
            @RequestParam(required = false, defaultValue = DEFAULT_SORTING_FIELD) ItemDataField sortingField,
            @RequestParam(required = false, defaultValue = DEFAULT_SORTING_DIRECTION) Sort.Direction sortingOrder
    ) throws NotFoundException, BusyException {
        return itemService.searchForItems(id, size, continuation, sortingField, sortingOrder);
    }

    @Operation(summary = "Initiate link analysis for particular item")
    @PostMapping(value = "/link-analysis",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public LinkAnalysisDTO initLinkAnalysis(
            @Valid @RequestBody final LinkAnalysisCreationDTO linkAnalysisCreationDTO) throws NotFoundException, IncorrectConditionException, BusyException, EmptySourceException {
        return linAnalysisService.createLinkAnalysisEntry(linkAnalysisCreationDTO);
    }

    @Operation(summary = "Initiate link analysis for particular item")
    @GetMapping(value = "/link-analysis/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public LinkAnalysisDTO getLinkAnalysisInfo(@PathVariable("id") String id) throws NotFoundException {
        return linAnalysisService.getLinkAnalysisEntry(id);
    }

    @Operation(summary = "Get items form MR linked to the current item")
    @GetMapping(value = "/link-analysis/{id}/mr-items",
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public PageableCollection<LAItemDTO> getMRLinks(
            @PathVariable("id")
                    String id,
            @Parameter(description = "size of a page")
            @RequestParam(required = false, defaultValue = DEFAULT_ITEM_PAGE_SIZE_STR)
            @Positive
                    Integer size,
            @Parameter(description = "continuation token from previous request")
            @RequestParam(required = false)
                    String continuation) throws NotFoundException, BusyException {
        return linAnalysisService.getMRItems(id, size, continuation);
    }

    @Operation(summary = "Get items form MR linked to the current item")
    @GetMapping(value = "/link-analysis/{id}/dfp-items",
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public PageableCollection<DFPItemDTO> getDFPLinks(
            @PathVariable("id")
                    String id,
            @Parameter(description = "size of a page")
            @RequestParam(required = false, defaultValue = DEFAULT_ITEM_PAGE_SIZE_STR)
            @Positive
                    Integer size,
            @Parameter(description = "continuation token from previous request")
            @RequestParam(required = false)
                    String continuation) throws NotFoundException {
        return linAnalysisService.getDFPItems(id, size, continuation);
    }
}
