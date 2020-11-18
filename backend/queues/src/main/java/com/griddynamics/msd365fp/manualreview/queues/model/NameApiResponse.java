package com.griddynamics.msd365fp.manualreview.queues.model;

import lombok.Data;

@Data
public class NameApiResponse {
    private DisposabilityStatus disposable;

    public enum DisposabilityStatus {
        YES,
        NO,
        UNKNOWN
    }
}
