package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.griddynamics.msd365fp.manualreview.model.*;
import com.griddynamics.msd365fp.manualreview.model.dfp.MainPurchase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.SortedSet;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ItemDTO {
    @NotNull
    private String id;
    @NotNull
    private OffsetDateTime imported;
    private OffsetDateTime updated;

    @NotNull
    private boolean active;

    private SortedSet<ItemNote> notes;
    private Set<String> tags;

    private MainPurchase purchase;
    private Decision decision;

    private ItemLock lock;
    private ItemEscalation escalation;
    private ItemHold hold;

    private Set<String> reviewers;
}
