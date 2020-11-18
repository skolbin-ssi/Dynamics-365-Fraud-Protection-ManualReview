package com.griddynamics.msd365fp.manualreview.model.jackson;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonTokenId;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.datatype.jsr310.deser.InstantDeserializer;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import static com.griddynamics.msd365fp.manualreview.model.Constants.DFP_DATE_TIME_PATTERN;
import static com.griddynamics.msd365fp.manualreview.model.Constants.ISO_OFFSET_DATE_TIME_PATTERN;

public class FlexibleDateFormatDeserializer extends InstantDeserializer<OffsetDateTime> {

    public FlexibleDateFormatDeserializer() {
        super(InstantDeserializer.OFFSET_DATE_TIME, DateTimeFormatter.ofPattern(ISO_OFFSET_DATE_TIME_PATTERN));
    }

    @Override
    public OffsetDateTime deserialize(final JsonParser jp, final DeserializationContext ctxt) throws IOException, JsonProcessingException {
        if (jp.getCurrentTokenId() == JsonTokenId.ID_STRING) {
            try {
                return OffsetDateTime.parse(jp.getText());
            } catch (DateTimeParseException ignored) {
                // ignored
            }
            try {
                return OffsetDateTime.parse(jp.getText(), DateTimeFormatter.ofPattern(DFP_DATE_TIME_PATTERN));
            } catch (DateTimeParseException ignored) {
                // ignored
            }
        }
        return super.deserialize(jp, ctxt);
    }
}
