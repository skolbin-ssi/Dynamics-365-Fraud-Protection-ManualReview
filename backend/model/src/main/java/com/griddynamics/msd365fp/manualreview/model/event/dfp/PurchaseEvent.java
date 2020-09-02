package com.griddynamics.msd365fp.manualreview.model.event.dfp;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.griddynamics.msd365fp.manualreview.model.event.Event;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
public class PurchaseEvent implements Event {
    private String ruleName;
    private String eventType;
    private String correlationId;
    private String eventId;
    private Map<String, String> attributes;
    private String name;
    private String version;
    private Metadata metadata;

    @Override
    public String getId() {
        return this.eventId;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Data
    @Builder
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    @NoArgsConstructor
    public static class Metadata {
        private String tenantId;
        private OffsetDateTime timestamp;
    }
}
