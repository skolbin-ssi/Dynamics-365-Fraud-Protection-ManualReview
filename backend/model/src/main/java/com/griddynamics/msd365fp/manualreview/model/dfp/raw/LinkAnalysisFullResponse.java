// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.HashMap;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LinkAnalysisFullResponse extends HashMap<String, LinkAnalysisFullResponse.FieldLinks> {
    @Data
    public static class FieldLinks {
        private int purchaseCounts;
        private Set<String> purchaseIds;
    }
}
