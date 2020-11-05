// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import com.griddynamics.msd365fp.manualreview.queues.validation.ValidRegexp;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class ItemFilterRegexp extends ItemFilter {
    @NotNull
    @Size(min = 1, max = 1, message = "there should be exactly 1 value for REGEXP filter")
    private List<@ValidRegexp String> values;
}
