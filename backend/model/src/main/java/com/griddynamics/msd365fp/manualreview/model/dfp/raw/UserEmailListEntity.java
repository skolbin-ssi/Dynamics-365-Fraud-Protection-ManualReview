// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEmailListEntity {
    private Map<String, UserEmailList> lists = new HashMap<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserEmailList {
        private String value;
    }

    public String getCommon() {
        return lists != null && lists.get("Common") != null ?
                lists.get("Common").getValue() :
                null;
    }

    public Boolean getCommonRestriction() {
        String common = getCommon();
        if (common != null) {
            if (common.equals("Safe")) return false;
            if (common.equals("Block")) return true;
        }
        return null;
    }
}
