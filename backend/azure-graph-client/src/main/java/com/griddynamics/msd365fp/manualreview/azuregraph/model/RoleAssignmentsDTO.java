package com.griddynamics.msd365fp.manualreview.azuregraph.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class RoleAssignmentsDTO extends ODataListResponse<RoleAssignmentDTO> {
}
