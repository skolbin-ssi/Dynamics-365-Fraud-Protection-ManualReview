// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.analytics.model.dto.PurchaseStatusResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DFPResolutionSendResult {
    private PurchaseStatusResponseDTO response;
    private HttpStatus status;
    private String exception;
}
