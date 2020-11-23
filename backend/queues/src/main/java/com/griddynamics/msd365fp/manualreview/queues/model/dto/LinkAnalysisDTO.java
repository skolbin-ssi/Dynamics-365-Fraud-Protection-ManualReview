// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.griddynamics.msd365fp.manualreview.queues.model.LinkAnalysisField;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LinkAnalysisDTO {
    @NotNull
    private String id;
    private int found;
    private int foundInMR;
    private Set<LinkAnalysisField> analysisFields;
    private List<FieldLinks> fields;

    @Data
    public static class FieldLinks {
        private LinkAnalysisField id;
        private String value;
        private int purchaseCounts;
    }
}
