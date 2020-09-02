package com.griddynamics.msd365fp.manualreview.model.event.internal;

import com.griddynamics.msd365fp.manualreview.model.ItemEscalation;
import com.griddynamics.msd365fp.manualreview.model.ItemHold;
import com.griddynamics.msd365fp.manualreview.model.ItemLabel;
import com.griddynamics.msd365fp.manualreview.model.ItemNote;
import com.griddynamics.msd365fp.manualreview.model.event.Event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemResolutionEvent implements Event {
    private String id;
    private OffsetDateTime imported;
    private ItemLabel label;
    private ItemEscalation escalation;
    private ItemHold hold;
    private Set<ItemNote> notes;
    private Set<String> tags;
}
