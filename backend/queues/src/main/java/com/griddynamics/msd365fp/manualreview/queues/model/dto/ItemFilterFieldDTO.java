// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemDataFieldCondition;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemFilterField;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.Set;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ItemFilterFieldDTO {
    private ItemFilterField id;
    private String category;
    private String displayName;
    @NotNull
    private Set<ItemDataFieldCondition> acceptableConditions;
    private String lowerBound;
    private String upperBound;
    private String description;
}
