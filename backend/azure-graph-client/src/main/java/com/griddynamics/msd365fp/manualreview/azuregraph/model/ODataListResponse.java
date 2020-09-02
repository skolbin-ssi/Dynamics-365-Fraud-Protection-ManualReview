package com.griddynamics.msd365fp.manualreview.azuregraph.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Collections;
import java.util.List;

/**
 * The wrapper for OData responses that returns list data.
 * The class is useful for OData response pagination processing
 * where the {@code odata.nextLink} response field will contain the
 * link to a next data page.
 * The wrapper should be extended by model classes that describe
 * multi-item responses.
 *
 * @see <a href="https://docs.microsoft.com/en-us/graph/paging">OData pagination in Azure Graph API</a>
 * @param <T> reflect target items' class in the list response
 */
@Data
public abstract class ODataListResponse<T> {
    @JsonProperty("@odata.nextLink")
    private String nextLink;
    private List<T> value = Collections.emptyList();
}
