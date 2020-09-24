// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import org.springframework.data.domain.Sort;

import java.io.Serializable;

@Data
public class QueueSortSettings implements Serializable {

    Sort.Direction order = Sort.Direction.ASC;
    SortingField field = SortingField.IMPORT_DATE;
    private boolean locked = false;

    @SuppressWarnings("unused")
    @AllArgsConstructor
    public enum SortingField implements Serializable {
        IMPORT_DATE("imported"),
        SCORE("decision.riskScore");

        @Getter
        private final String path;
    }

}
