package com.griddynamics.msd365fp.manualreview.queues.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;
import java.util.Set;

import static com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter.FilterCondition.*;

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
    private FilterField field;
    @NotNull(message = "filtering condition should be presented")
    private FilterCondition condition;
    private List<String> values;

    @SuppressWarnings("unused")
    @AllArgsConstructor
    public enum FilterField implements Serializable {
        IMPORT_DATE("imported", Set.of(IN, BETWEEN_DATE, REGEXP)),
        TOTAL_AMOUNT("purchase.TotalAmountInUSD", Set.of(BETWEEN)),
        USER_COUNTRY("purchase.User.Country", Set.of(IN, REGEXP, BETWEEN_ALPH)),
        PRODUCT_SKU("purchase.ProductList[].Sku", Set.of(IN, BETWEEN_ALPH, REGEXP)),
        SCORE("decision.riskScore", Set.of(BETWEEN));

        @Getter
        private String path;
        @Getter
        private Set<FilterCondition> acceptedConditions;
    }

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
