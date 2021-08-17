// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter;
import com.griddynamics.msd365fp.manualreview.queues.validation.FieldConditionCombination;
import lombok.Data;

import javax.validation.Valid;
import java.util.Set;

@Data
public class ItemSearchQueryDTO {
    private Set<String> ids;
    private Set<String> originalOrderIds;
    private Boolean active;
    private Set<String> queueIds;
    private boolean residual = false;
    private Set<@FieldConditionCombination @Valid ItemFilter> itemFilters;
    private Set<String> lockOwnerIds;
    private Set<String> holdOwnerIds;
    private Set<Label> labels;
    private Set<String> tags;
    private Set<String> labelAuthorIds;
}
