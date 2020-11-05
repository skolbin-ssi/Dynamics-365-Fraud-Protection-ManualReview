// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import com.griddynamics.msd365fp.manualreview.queues.validation.ValidDate;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class ItemFilterBetweenDate extends ItemFilter {
    @NotNull
    @Size(min = 2, max = 2, message = "there should be exactly 2 values for BETWEEN_DATE filter")
    private List<@ValidDate String> values;
}
