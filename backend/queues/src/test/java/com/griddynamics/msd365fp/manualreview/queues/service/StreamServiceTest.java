package com.griddynamics.msd365fp.manualreview.queues.service;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.ExplorerEntity;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.Node;
import com.griddynamics.msd365fp.manualreview.model.event.dfp.PurchaseEvent;
import com.griddynamics.msd365fp.manualreview.queues.config.ModelMapperConfig;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import com.griddynamics.msd365fp.manualreview.queues.repository.QueueRepository;
import com.griddynamics.msd365fp.manualreview.queues.streaming.*;
import lombok.Setter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.platform.commons.util.StringUtils;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.TimeZone;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class StreamServiceTest {

    private final ObjectMapper jsonMapper = new Jackson2ObjectMapperBuilder().build()
            .setTimeZone(TimeZone.getTimeZone("UTC"))
            .setSerializationInclusion(JsonInclude.Include.NON_EMPTY)
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @ParameterizedTest
    @CsvSource({"SamplePurchaseEvent1.json"})
    void getOrderFromDfpParsingTest(String purchaseEventPath) throws IOException {
        InputStream purchaseEventStream = ClassLoader.getSystemResourceAsStream(purchaseEventPath);
        String purchaseEventRaw = new String(purchaseEventStream.readAllBytes());
        CollectionType javaType = jsonMapper.getTypeFactory()
                .constructCollectionType(List.class, PurchaseEvent.class);
        List<PurchaseEvent> events = jsonMapper.readValue(purchaseEventRaw, javaType);
        assertEquals(StringUtils.replaceWhitespaceCharacters(purchaseEventRaw, ""),
                StringUtils.replaceWhitespaceCharacters(jsonMapper.writeValueAsString(events), ""));
    }
}
