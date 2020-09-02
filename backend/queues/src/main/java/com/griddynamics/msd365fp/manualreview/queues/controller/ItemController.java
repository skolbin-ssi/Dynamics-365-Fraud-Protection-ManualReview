package com.griddynamics.msd365fp.manualreview.queues.controller;

import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConditionException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.ItemDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.LabelDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.NoteDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.TagDTO;
import com.griddynamics.msd365fp.manualreview.queues.service.PublicItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collection;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@RestController
@RequestMapping("/api/items")
@Tag(name = "items", description = "The Item API for observing and processing orders.")
@Slf4j
@RequiredArgsConstructor
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Secured({ADMIN_MANAGER_ROLE})
public class ItemController {

    private final PublicItemService itemService;

    @Operation(summary = "Get item details by ID")
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public ItemDTO getItem(
            @PathVariable("id") final String id,
            @Parameter(description = "id of the queue which is used for item access")
            @RequestParam(required = false) String queueId) throws NotFoundException {
        return itemService.getItem(id, queueId);
    }

    @Operation(summary = "Get locked items for current user")
    @GetMapping(value = "/locked", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public Collection<ItemDTO> getLockedItemsForCurrentUser() throws BusyException {
        return itemService.getLockedItemsForCurrentUser();
    }

    @Operation(summary = "Unlock the specified item")
    @DeleteMapping(value = "/{id}/lock", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public ItemDTO unlockItem(
            @PathVariable("id") final String id) throws NotFoundException, IncorrectConditionException {
        return itemService.unlockItem(id);
    }

    @Operation(summary = "Set the label and release the item by ID")
    @PatchMapping(value = "/{id}/label", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public void labelItem(
            @PathVariable("id") final String id,
            @Valid @RequestBody final LabelDTO label) throws NotFoundException, IncorrectConditionException {
        itemService.labelItem(id, label);
    }

    @Operation(summary = "Add the note to the specified item")
    @PutMapping(value = "/{id}/note", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public void commentItem(
            @PathVariable("id") final String id,
            @Valid @RequestBody final NoteDTO note) throws NotFoundException {
        itemService.commentItem(id, note);
    }

    @Operation(summary = "Add a tag to the specified item")
    @PatchMapping(value = "/{id}/tags", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public void tagItem(
            @PathVariable("id") final String id,
            @Valid @RequestBody final TagDTO tag) throws NotFoundException {
        itemService.tagItem(id, tag);
    }
}
