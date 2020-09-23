// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.controller;

import com.griddynamics.msd365fp.manualreview.model.exception.EmptySourceException;
import com.griddynamics.msd365fp.manualreview.model.exception.NotFoundException;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.UserDTO;
import com.griddynamics.msd365fp.manualreview.queues.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.Collection;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "users", description = "The User API for informational purposes")
@Slf4j
@SecurityRequirement(name = SECURITY_SCHEMA_IMPLICIT)
@Secured({ADMIN_MANAGER_ROLE})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get details about current user if he connected to the system")
    @GetMapping(value = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public UserDTO getCurrentUser() throws NotFoundException {
        return userService.getCurrentUser();
    }

    @Operation(summary = "Get list of users connected to the system")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public Collection<UserDTO> getUsers(@Parameter(description = "Required role, if it's absent then the user list isn't filtered, multiple values could be provided")
                                        @RequestParam(required = false, value = "role") Set<String> roles) {
        return userService.getUsers(roles);
    }

    @Operation(summary = "Get user's photo if he connected to the system")
    @GetMapping(value = "/{id}/photo", produces = {MediaType.IMAGE_JPEG_VALUE})
    @Secured({ADMIN_MANAGER_ROLE, SENIOR_ANALYST_ROLE, ANALYST_ROLE})
    public byte[] getUserPhoto(@Parameter(description = "Id of the required user")
                               @PathVariable String id,
                               @Parameter(hidden = true) final HttpServletResponse response) throws EmptySourceException {
        response.addHeader("Cache-Control",
                CacheControl.maxAge(DEFAULT_CACHE_CONTROL_SECONDS, TimeUnit.SECONDS)
                        .noTransform()
                        .getHeaderValue());
        return userService.getUserPhoto(id);
    }
}
