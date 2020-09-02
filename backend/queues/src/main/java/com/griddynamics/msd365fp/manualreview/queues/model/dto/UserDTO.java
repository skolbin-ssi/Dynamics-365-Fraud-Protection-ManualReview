package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class UserDTO {
    @NotNull
    private String id;
    private String displayName;
    private Set<String> roles;

    private String givenName;
    private String jobTitle;
    private String mail;
    private String officeLocation;
    private String surname;
    @NotNull
    private String userPrincipalName;
}
