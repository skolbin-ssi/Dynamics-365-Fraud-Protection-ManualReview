package com.griddynamics.msd365fp.manualreview.queues.model.persistence;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.griddynamics.msd365fp.manualreview.queues.model.DictionaryType;
import com.microsoft.azure.spring.data.cosmosdb.core.mapping.Document;
import com.microsoft.azure.spring.data.cosmosdb.core.mapping.PartitionKey;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;

import java.time.OffsetDateTime;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.DICTIONARIES_CONTAINER_NAME;

@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(exclude = "_etag")
@Document(collection = DICTIONARIES_CONTAINER_NAME)
public class DictionaryEntity {

    @Id
    @PartitionKey
    private String id;
    private DictionaryType type;
    private String value;
    @JsonProperty(value = "_ts")
    private OffsetDateTime created;
    private OffsetDateTime confirmed;
    private long ttl;
    @Version
    @SuppressWarnings("java:S116")
    private String _etag;

}
