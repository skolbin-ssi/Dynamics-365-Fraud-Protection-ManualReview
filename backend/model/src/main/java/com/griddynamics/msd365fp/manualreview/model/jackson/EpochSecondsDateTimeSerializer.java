package com.griddynamics.msd365fp.manualreview.model.jackson;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.time.OffsetDateTime;

public class EpochSecondsDateTimeSerializer extends StdSerializer<OffsetDateTime> {

    protected EpochSecondsDateTimeSerializer() {
        super(OffsetDateTime.class);
    }

    @Override
    public void serialize(final OffsetDateTime value, final JsonGenerator gen, final SerializerProvider serializers) throws IOException {
        if (value != null) {
            gen.writeNumber(value.toEpochSecond());
        }
    }
}
