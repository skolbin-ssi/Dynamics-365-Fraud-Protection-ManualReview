// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.azuregraph.model;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class RoleAssignmentDTO {
    private OffsetDateTime deletedDateTime;
    private String appRoleId;
    private String principalId;
    private String resourceId;
    private String principalDisplayName;
    private String principalType;
}
