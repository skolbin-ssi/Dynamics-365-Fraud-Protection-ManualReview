// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.Digits;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DIGITS_MAX_VALID_FRACTION;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DIGITS_MAX_VALID_INTEGER;

@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class ItemFilterComparison extends ItemFilter {
    @NotNull
    @Size(min = 1, max = 1, message = "there should be exactly 1 value for comparison filter")
    private List<@Digits(integer = DIGITS_MAX_VALID_INTEGER,
            fraction = DIGITS_MAX_VALID_FRACTION,
            message = "values for comparison filter should be numbers") String> values;
}
