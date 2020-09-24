// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.Set;

@Data
public class CollectedAnalystInfoDTO {
    @NotBlank
    private String id;
    private String displayName;
    private Set<String> roles;
    private String mail;
    @NotBlank
    private String userPrincipalName;
}
