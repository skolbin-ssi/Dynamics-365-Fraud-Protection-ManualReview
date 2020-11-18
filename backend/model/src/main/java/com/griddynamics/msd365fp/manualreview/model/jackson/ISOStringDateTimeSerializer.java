package com.griddynamics.msd365fp.manualreview.model.jackson;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

import static com.griddynamics.msd365fp.manualreview.model.Constants.ISO_OFFSET_DATE_TIME_PATTERN;

public class ISOStringDateTimeSerializer extends StdSerializer<OffsetDateTime> {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern(ISO_OFFSET_DATE_TIME_PATTERN);

    protected ISOStringDateTimeSerializer() {
        super(OffsetDateTime.class);
    }

    @Override
    public void serialize(final OffsetDateTime value, final JsonGenerator gen, final SerializerProvider serializers) throws IOException {
        gen.writeString(value == null ? null : value.format(formatter));
    }
}
