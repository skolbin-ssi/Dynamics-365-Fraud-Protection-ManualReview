package com.griddynamics.msd365fp.manualreview.queues.controller;


import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.MapTokenDTO;
import com.griddynamics.msd365fp.manualreview.queues.service.MapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@Tag(name = "maps", description = "The Maps API")
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/maps")
@Secured({ADMIN_MANAGER_ROLE})
public class MapController {

    private final MapService mapService;

    @Operation(summary = "Get token for read-only map access")
    @GetMapping(value = "/token/read", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public MapTokenDTO getReadToken() throws IncorrectConfigurationException {
        return mapService.getReadToken();
    }

}
