// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.griddynamics.msd365fp.manualreview.queues.model.LinkAnalysisField;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LinkAnalysisCreationDTO {
    @NotNull
    private String itemId;
    private String queueId;
    private Set<LinkAnalysisField> fields;
}
