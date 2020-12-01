package com.griddynamics.msd365fp.manualreview.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DisposabilityCheck {
    private Boolean disposable;
    private List<DisposabilityCheckServiceResponse> disposabilityResponses;
}