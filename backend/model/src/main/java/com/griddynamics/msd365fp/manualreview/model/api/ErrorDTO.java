package com.griddynamics.msd365fp.manualreview.model.api;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class ErrorDTO {
    @Schema(required = true, description = "The time of error generation")
    private OffsetDateTime time;
    @Schema(required = true, description = "The common error description")
    private String description;
    @Schema(nullable = true, description = "The details for custom troubleshooting. Could have any format or be not presented")
    private Object details;
}
