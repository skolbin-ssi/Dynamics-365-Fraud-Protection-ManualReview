package com.griddynamics.msd365fp.manualreview.analytics.model.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class PurchaseStatusResponseDTO {
    private ResultDetails resultDetails;
    @JsonAnySetter
    private Map<String, Object> otherFields = new HashMap<>();

    @Data
    public static class ResultDetails {
        @JsonProperty("Succeeded")
        private boolean succeeded;
        @JsonAnySetter
        private Map<String, Object> otherFields = new HashMap<>();
    }
}
