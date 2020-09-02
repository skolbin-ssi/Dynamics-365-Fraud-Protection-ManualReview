package com.griddynamics.msd365fp.manualreview.analytics.controller;

import com.griddynamics.msd365fp.manualreview.analytics.model.dto.ResolutionDTO;
import com.griddynamics.msd365fp.manualreview.analytics.service.ResolutionService;
import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.*;

@RestController
@RequestMapping("/api/resolutions")
@Tag(name = "resolution", description = "The Resolution API is used for external client usage.")
@Slf4j
@RequiredArgsConstructor
@Secured({ADMIN_MANAGER_ROLE})
public class ResolutionController {

    private final ResolutionService resolutionService;

    @Operation(summary = "Get resolution details by ID")
    @Secured({ADMIN_MANAGER_ROLE, RESOLUTION_VIEWER_APPROLE})
    @SecurityRequirement(name = SECURITY_SCHEMA_CLIENTCRED)
    @SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResolutionDTO getResolution(@PathVariable final String id) throws NotFoundException {
        return resolutionService.getResolution(id);
    }

    @Operation(summary = "Get resolutions which were made during certain time range")
    @Secured({ADMIN_MANAGER_ROLE, RESOLUTION_VIEWER_APPROLE})
    @SecurityRequirement(name = SECURITY_SCHEMA_CLIENTCRED)
    @SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public PageableCollection<ResolutionDTO> getResolutions(
            @Parameter(description = FROM_PARAM_DESCRIPTION, example = FROM_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime startTime,
            @Parameter(description = TO_PARAM_DESCRIPTION, example = TO_PARAM_EXAMPLE)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @RequestParam
                    OffsetDateTime endTime,
            @Parameter(description = "size of a page")
            @RequestParam(required = false, defaultValue = DEFAULT_PAGE_REQUEST_SIZE_STR)
                    Integer maxPageSize,
            @Parameter(description = "continuation token from previous request")
            @RequestParam(required = false)
                    String continuationToken)
            throws BusyException {
        return resolutionService.getResolutions(startTime, endTime, continuationToken, maxPageSize);
    }

    @Operation(summary = "Force resending of the resolution with specified ID to the DFP Purchase API")
    @Secured({ADMIN_MANAGER_ROLE})
    @SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
    @PostMapping(value = "/{id}/send", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResolutionDTO resendResolution(@PathVariable final String id) throws NotFoundException {
        return resolutionService.resendResolution(id);
    }


}
