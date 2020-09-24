// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.azuregraph.model;

import lombok.Data;

import java.util.Collection;

@Data
public class UserDTO {

    private Collection<String> businessPhones;
    private String displayName;
    private String givenName;
    private String jobTitle;
    private String mail;
    private String mobilePhone;
    private String officeLocation;
    private String preferredLanguage;
    private String surname;
    private String userPrincipalName;
    private String id;
}
