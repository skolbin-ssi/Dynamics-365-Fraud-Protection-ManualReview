// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import com.griddynamics.msd365fp.manualreview.model.ItemEscalation;
import com.griddynamics.msd365fp.manualreview.model.ItemHold;
import com.griddynamics.msd365fp.manualreview.model.ItemLabel;
import com.griddynamics.msd365fp.manualreview.model.ItemLock;

import java.time.OffsetDateTime;
import java.util.Set;

public interface BasicItemInfo {

    String getId();

    OffsetDateTime getImported();

    OffsetDateTime getEnriched();

    boolean isActive();

    ItemLabel getLabel();

    Set<String> getQueueIds();

    ItemLock getLock();

    ItemEscalation getEscalation();

    ItemHold getHold();
}
