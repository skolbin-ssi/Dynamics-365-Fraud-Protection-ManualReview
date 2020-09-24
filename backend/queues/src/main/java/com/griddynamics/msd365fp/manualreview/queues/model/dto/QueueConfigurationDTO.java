// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.griddynamics.msd365fp.manualreview.queues.validation.NullOrNotBlank;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Duration;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.queues.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.queues.model.Constants.SWAGGER_DURATION_FORMAT;

/**
 * the DTO that reflects update parameters for
 * {@link com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue}
 * object. For field description, please, see the original.
 * if some fields are passed as {@code null} the they will not copied to
 * modified object
 */
@Data
public class QueueConfigurationDTO {
    @NullOrNotBlank(message = "name shouldn't be blank if it's provided")
    private String name;

    private Set<String> reviewers;
    private Set<String> supervisors;
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Duration processingDeadline;
}
