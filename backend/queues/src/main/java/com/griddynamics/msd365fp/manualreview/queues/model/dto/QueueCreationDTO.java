package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter;
import com.griddynamics.msd365fp.manualreview.queues.model.QueueSortSettings;
import com.griddynamics.msd365fp.manualreview.queues.validation.FieldConditionCombination;
import com.griddynamics.msd365fp.manualreview.queues.validation.ValidLabelSet;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.Duration;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.queues.model.Constants.SWAGGER_DURATION_EXAMPLE;
import static com.griddynamics.msd365fp.manualreview.queues.model.Constants.SWAGGER_DURATION_FORMAT;


/**
 * the DTO that reflects creation parameters for
 * {@link com.griddynamics.msd365fp.manualreview.queues.model.persistence.Queue}
 * object. For field description, please, see the original
 */
@Data
public class QueueCreationDTO {
    @NotBlank(message = "queue name shouldn't be blank or missed")
    private String name;

    @Size(min = 2, max = 6, message = "there should be from 2 to 6 labels")
    @NotNull
    @ValidLabelSet
    private Set<Label> allowedLabels;
    private Set<String> reviewers;
    @NotEmpty
    private Set<String> supervisors;
    @Valid
    @NotNull
    private QueueSortSettings sorting;
    @NotEmpty(message = "there should be at least one filter")
    @NotNull
    private Set<@FieldConditionCombination ItemFilter> filters;
    @Schema(type = "string", format = SWAGGER_DURATION_FORMAT, example = SWAGGER_DURATION_EXAMPLE)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Duration processingDeadline;
}
