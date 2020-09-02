package com.griddynamics.msd365fp.manualreview.analytics.model.persistence;

import com.griddynamics.msd365fp.manualreview.model.TaskStatus;
import com.microsoft.azure.spring.data.cosmosdb.core.mapping.Document;
import com.microsoft.azure.spring.data.cosmosdb.core.mapping.PartitionKey;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;

import java.time.OffsetDateTime;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.TASK_CONTAINER_NAME;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@EqualsAndHashCode(exclude = "_etag")
@Document(collection = TASK_CONTAINER_NAME)
public class Task {
    @Id
    @PartitionKey
    private String id;
    private TaskStatus status;
    private OffsetDateTime previousRun;
    private String failedStatusMessage;

    @Version
    @SuppressWarnings("java:S116")
    String _etag;
}
