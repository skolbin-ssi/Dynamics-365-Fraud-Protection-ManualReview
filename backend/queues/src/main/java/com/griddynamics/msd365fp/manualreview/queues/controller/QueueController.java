package com.griddynamics.msd365fp.manualreview.queues.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.exception.*;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.*;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.service.PublicItemService;
import com.griddynamics.msd365fp.manualreview.queues.service.PublicQueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;
import static com.griddynamics.msd365fp.manualreview.queues.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.queues.model.Constants.SWAGGER_DURATION_FORMAT;

@Tag(name = "queues", description = "The Queue API for CRUD and processing")
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/queues")
@Secured({ADMIN_MANAGER_ROLE})
public class QueueController {

    private final PublicQueueService queueService;
    private final PublicItemService itemService;

    @Operation(summary = "Get queue view details by ID")
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public QueueViewDTO getQueue(
            @PathVariable("id") final String id) throws NotFoundException {
        return queueService.getQueue(id);
    }

    @Operation(summary = "Get list of queue views")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public Collection<QueueViewDTO> getQueues(
            @Parameter(description = "the parameter which specifies the view type")
            @RequestParam(required = false, defaultValue = DEFAULT_QUEUE_VIEW_PARAMETER_STR) final QueueViewType viewType) throws BusyException {
        return queueService.getQueues(viewType);
    }

    @Operation(summary = "Get list of items from the specified queue")
    @GetMapping(value = "/{id}/items", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public PageableCollection<ItemDTO> getItemList(
            @PathVariable("id") final String id,
            @Parameter(description = "size of a page")
            @RequestParam(required = false, defaultValue = DEFAULT_ITEM_PAGE_SIZE_STR) final Integer size,
            @Parameter(description = "continuation token from previous request")
            @RequestParam(required = false) String continuation) throws NotFoundException, BusyException {
        return itemService.getQueueItemList(id, size, continuation);
    }

    @Operation(summary = "Get particular item details")
    @GetMapping(value = "/{queueId}/items/{itemId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public ItemDTO getItem(
            @PathVariable("queueId") final String queueId,
            @PathVariable("itemId") final String itemId) throws NotFoundException {
        return itemService.getItem(itemId, queueId);
    }

    @Operation(summary = "Create a new queue")
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public List<QueueViewDTO> createQueue(
            @Valid @RequestBody final QueueCreationDTO parameters) throws IncorrectConfigurationException {
        return queueService.createQueue(parameters);
    }

    @Operation(summary = "Update a queue by ID")
    @PatchMapping(value = "/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public List<QueueViewDTO> updateQueue(
            @PathVariable("id") final String id,
            @Valid @RequestBody final QueueConfigurationDTO parameters)
            throws NotFoundException, IncorrectConfigurationException {
        return queueService.updateQueue(id, parameters);
    }

    @Operation(summary = "Delete a queue by ID")
    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE})
    public List<QueueViewDTO> deleteQueue(
            @PathVariable("id") final String id) throws NotFoundException, IncorrectConditionException, IncorrectConfigurationException {
        return queueService.deleteQueue(id);
    }

    @Operation(summary = "Lock the top item from the specified queue")
    @PostMapping(value = "/{id}/top/lock", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public ItemDTO lockTopQueueItem(
            @PathVariable("id") final String id)
            throws EmptySourceException, IncorrectConditionException, NotFoundException, BusyException {
        return itemService.lockFirstFreeQueueItem(id);
    }

    @Operation(summary = "Lock the specified item from the specified queue")
    @PostMapping(value = "/{queueId}/items/{itemId}/lock", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public ItemDTO lockQueueItem(
            @PathVariable("queueId") final String queueId, @PathVariable("itemId") final String itemId)
            throws IncorrectConditionException, NotFoundException, BusyException {
        return itemService.lockQueueItem(queueId, itemId);
    }

    @Operation(summary = "Get map of queue overviews for Overview dashboard")
    @GetMapping(value = "/overview", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public Map<String, QueueOverviewDTO> getQueueOverviews(
            @Parameter(description = "the response will contain amount of items which timeout is nearer this duration")
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @JsonFormat(shape = JsonFormat.Shape.STRING)
            @RequestParam(required = false)
                    Duration timeToTimeout,
            @Parameter(description = "the response will contain amount of  items which SLA is nearer this duration")
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @JsonFormat(shape = JsonFormat.Shape.STRING)
            @RequestParam(required = false)
                    Duration timeToSla) throws BusyException {
        return queueService.getQueueOverviews(timeToTimeout, timeToSla);
    }

    @Operation(summary = "Get list of items by queue for Overview Dashboard")
    @GetMapping(value = "/{queueViewId}/overview", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE})
    public PageableCollection<Item> getItemsForOverviewByQueue(
            @Parameter(description = "size of a page")
            @RequestParam(required = false, defaultValue = DEFAULT_QUEUE_PAGE_SIZE_STR)
                    int size,
            @Parameter(description = "continuation token from previous request")
            @RequestParam(required = false)
                    String continuation,
            @PathVariable("queueViewId")
                    String queueViewId,
            @Parameter(description = "the response will contain all items which timeout is nearer this duration")
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @JsonFormat(shape = JsonFormat.Shape.STRING)
            @RequestParam(required = false)
                    Duration timeToTimeout,
            @Parameter(description = "the response will contain all items which SLA is nearer this duration")
            @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
            @JsonFormat(shape = JsonFormat.Shape.STRING)
            @RequestParam(required = false)
                    Duration timeToSla)
            throws NotFoundException, BusyException {
        return queueService.getItemsForOverviewByQueueView(queueViewId,
                timeToTimeout,
                timeToSla,
                size,
                continuation);
    }
}
