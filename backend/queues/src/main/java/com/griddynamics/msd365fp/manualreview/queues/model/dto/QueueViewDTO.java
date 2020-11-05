// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueSortSettings;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewSettings;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueViewType;
import com.griddynamics.msd365fp.manualreview.queues.validation.FieldConditionCombination;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.queues.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.queues.model.Constants.SWAGGER_DURATION_FORMAT;


/**
 * the DTO that reflects
 * {@link com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue}
 * object. For field description, please, see the original
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QueueViewDTO {
    @NotBlank
    private String queueId;
    @NotBlank
    private String viewId;
    @NotBlank
    private String name;
    @NotNull
    private OffsetDateTime created;
    private OffsetDateTime updated;
    @NotNull
    private Integer size;

    @NotNull
    private QueueViewType viewType;
    @NotNull
    private Set<Label> allowedLabels;
    private Set<QueueViewSettings> views;
    private Set<String> reviewers;
    @NotEmpty
    private Set<String> supervisors;
    @NotNull
    private QueueSortSettings sorting;
    private Set<@FieldConditionCombination @Valid ItemFilter> filters;
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Duration processingDeadline;
    @NotNull
    private boolean residual;
    private boolean active;
}
