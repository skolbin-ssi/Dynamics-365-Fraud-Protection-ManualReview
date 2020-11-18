package com.griddynamics.msd365fp.manualreview.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.griddynamics.msd365fp.manualreview.model.jackson.EpochSecondsDateTimeSerializer;
import com.griddynamics.msd365fp.manualreview.model.jackson.FlexibleDateFormatDeserializer;
import com.griddynamics.msd365fp.manualreview.model.jackson.ISOStringDateTimeSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DisposabilityCheckServiceResponse implements Serializable {
    private Boolean disposable;
    private String resource;
    @JsonDeserialize(using = FlexibleDateFormatDeserializer.class)
    @JsonSerialize(using = ISOStringDateTimeSerializer.class)
    private OffsetDateTime checked;
    private String rawResponse;

    /**
     * Getter for advanced serialization.
     * Json object will contain both representation of DateTime field -
     * timestamp (for SQL queries) and string representation.
     */
    @SuppressWarnings("unused")
    @JsonSerialize(using = EpochSecondsDateTimeSerializer.class)
    public OffsetDateTime getCheckedEpochSeconds() {
        return checked;
    }

}