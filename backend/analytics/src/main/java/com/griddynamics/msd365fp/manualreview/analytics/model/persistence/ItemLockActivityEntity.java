package com.griddynamics.msd365fp.manualreview.analytics.model.persistence;

import com.griddynamics.msd365fp.manualreview.model.Label;
import com.griddynamics.msd365fp.manualreview.model.event.type.LockActionType;
import com.microsoft.azure.spring.data.cosmosdb.core.mapping.Document;
import com.microsoft.azure.spring.data.cosmosdb.core.mapping.PartitionKey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.OffsetDateTime;

import static com.griddynamics.msd365fp.manualreview.analytics.config.Constants.ITEM_LOCK_ACTIVITY_CONTAINER_NAME;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Document(collection = ITEM_LOCK_ACTIVITY_CONTAINER_NAME)
public class ItemLockActivityEntity implements ActivityEntity {
    @Id
    @PartitionKey
    // ID should have the PurchaseId-[locked,released] format
    private String id;
    private String queueId;
    private String queueViewId;
    private String ownerId;
    private OffsetDateTime locked;
    private OffsetDateTime released;
    private LockActionType actionType;

    @Builder.Default
    private long ttl = -1;
}
