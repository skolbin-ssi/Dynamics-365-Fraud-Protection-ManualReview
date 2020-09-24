// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model.persistence;

import com.microsoft.azure.spring.data.cosmosdb.core.mapping.Document;
import com.microsoft.azure.spring.data.cosmosdb.core.mapping.PartitionKey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.COLLECTED_QUEUE_INFO_CONTAINER_NAME;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Document(collection = COLLECTED_QUEUE_INFO_CONTAINER_NAME)
public class CollectedQueueInfoEntity {
    @Id
    @PartitionKey
    // The QueueId should be used as the ID
    private String id;
    private String name;
    private boolean active;
    private OffsetDateTime updated;
    @Builder.Default
    private Set<String> reviewers = Collections.emptySet();
    @Builder.Default
    private Set<String> supervisors = Collections.emptySet();
    private boolean residual;
    private Duration processingDeadline;

    @Builder.Default
    private long ttl = -1;

}
