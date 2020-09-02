package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.griddynamics.msd365fp.manualreview.model.event.type.ItemPlacementType;
import lombok.Data;

@Data
public class ItemPlacementBucket {
    private ItemPlacementType type;
    private int cnt;
    private String id;
    private int bucket;
}
