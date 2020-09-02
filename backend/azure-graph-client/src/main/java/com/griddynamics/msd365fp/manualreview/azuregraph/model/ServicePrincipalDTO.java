package com.griddynamics.msd365fp.manualreview.azuregraph.model;

import lombok.Data;

import java.util.List;

@Data
public class ServicePrincipalDTO {
    private String id;
    private String appId;
    private List<AppRoleDTO> appRoles;
}
