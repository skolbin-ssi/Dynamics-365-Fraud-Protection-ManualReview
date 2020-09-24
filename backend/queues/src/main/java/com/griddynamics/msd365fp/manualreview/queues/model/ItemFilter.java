// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;

@Data
@Slf4j
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "condition", visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = ItemFilterIn.class, name = "IN"),
        @JsonSubTypes.Type(value = ItemFilterBetween.class, name = "BETWEEN"),
        @JsonSubTypes.Type(value = ItemFilterBetweenAlph.class, name = "BETWEEN_ALPH"),
        @JsonSubTypes.Type(value = ItemFilterBetween.class, name = "BETWEEN_DATE"),
        @JsonSubTypes.Type(value = ItemFilterRegexp.class, name = "REGEXP")
})
public abstract class ItemFilter implements Serializable {

    @NotNull(message = "filtering field should be presented")
    private ItemDataField field;
    @NotNull(message = "filtering condition should be presented")
    private FilterCondition condition;
    private List<String> values;

    @SuppressWarnings("unused")
    @AllArgsConstructor
    public enum FilterCondition implements Serializable {
        IN,
        BETWEEN,
        BETWEEN_ALPH,
        BETWEEN_DATE,
        REGEXP
    }
}
