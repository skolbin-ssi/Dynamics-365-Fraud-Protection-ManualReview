// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.List;

@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class ItemFilterIsTrue extends ItemFilter {
    @Size(min = 1, max = 1, message = "there should be exactly one argument for IS_TRUE filter")
    private List<@NotBlank @Pattern(regexp = "true|false", flags = {Pattern.Flag.CASE_INSENSITIVE}) String> values;
}
