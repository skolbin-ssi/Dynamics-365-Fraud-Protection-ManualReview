package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * The entity connection data returned by the
 * {@code /knowledgegateway/customersupport/v1.0/explorer/traversal}
 * DFP endpoint.
 *
 * The {@code additionalParams} suits for new version of model to carry
 * the data wasn't declared before.
 */
@Data
public abstract class NodeData {

    private Map<String, String> additionalParams = new HashMap<>();

    @JsonAnySetter
    public void setAdditionalParam(String name, String value) {
        additionalParams.put(name, value);
    }

}
