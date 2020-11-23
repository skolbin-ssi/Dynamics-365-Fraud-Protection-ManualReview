// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.HashSet;

public class BatchLabelReportDTO extends HashSet<BatchLabelReportDTO.LabelResult> {

    public BatchLabelReportDTO(final Collection<? extends LabelResult> c) {
        super(c);
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class LabelResult {
        private String itemId;
        private boolean success;
        private String reason;
    }
}
