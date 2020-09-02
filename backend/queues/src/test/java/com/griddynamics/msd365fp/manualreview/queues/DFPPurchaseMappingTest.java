package com.griddynamics.msd365fp.manualreview.queues;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.ExplorerEntity;
import com.griddynamics.msd365fp.manualreview.model.dfp.raw.Node;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Item;
import lombok.Setter;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;
import java.util.TimeZone;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class DFPPurchaseMappingTest {

    @Setter(onMethod = @__({@Autowired, @Qualifier("dfpModelMapper")}))
    private ModelMapper dfpModelMapper;
    private final ObjectMapper jsonMapper = new Jackson2ObjectMapperBuilder().build()
            .setTimeZone(TimeZone.getTimeZone("UTC"))
            .setSerializationInclusion(JsonInclude.Include.NON_EMPTY)
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);


    @ParameterizedTest
    @CsvSource({"SampleGraphExplorerEntity1.json,SampleInternalItem1.json",
            "SampleGraphExplorerEntity2.json,SampleInternalItem2.json",
            "SampleGraphExplorerEntity3.json,SampleInternalItem3.json",
            "SampleGraphExplorerEntity4.json,SampleInternalItem4.json"})
    void testMappingOnMSSample(String inputFileName, String outputFileName) throws IOException {
        ExplorerEntity entity = jsonMapper.readValue(
                ClassLoader.getSystemResourceAsStream(inputFileName),
                ExplorerEntity.class);

        Item item = Item.builder()
                .id(entity.getNodes().stream()
                        .filter(n -> "Purchase".equals(n.getName()))
                        .map(Node::getId)
                        .findFirst()
                        .get())
                .build();
        dfpModelMapper.map(entity, item);
        //to standardize all time zones conversions
        item = jsonMapper.readValue(jsonMapper.writeValueAsString(item), Item.class);
        Item expectedItem = jsonMapper.readValue(
                ClassLoader.getSystemResourceAsStream(outputFileName),
                Item.class);
        assertEquals(expectedItem, item);
    }

}
