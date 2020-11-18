// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

/**
 * The entity returned by the
 * {@code /knowledgegateway/customersupport/v1.0/explorer/traversal}
 * DFP endpoint. It contains the entity parameters.
 * Has different dataset depending in the entity type.
 */
@Data
public class Node {
    private String nodeIdAttribute;
    private String id;
    private String name;
    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
            property = "name",
            visible = true,
            defaultImpl = DefaultNodeData.class)
    @JsonSubTypes({
            @JsonSubTypes.Type(value = AddressNodeData.class, name = AddressNodeData.NODE_NAME),
            @JsonSubTypes.Type(value = BankEventNodeData.class, name = BankEventNodeData.NODE_NAME),
            @JsonSubTypes.Type(value = DeviceContextNodeData.class, name = DeviceContextNodeData.NODE_NAME),
            @JsonSubTypes.Type(value = PaymentInstrumentNodeData.class, name = PaymentInstrumentNodeData.NODE_NAME),
            @JsonSubTypes.Type(value = ProductNodeData.class, name = ProductNodeData.NODE_NAME),
            @JsonSubTypes.Type(value = UserNodeData.class, name = UserNodeData.NODE_NAME),
            @JsonSubTypes.Type(value = PurchaseNodeData.class, name = PurchaseNodeData.NODE_NAME)
    })
    private NodeData data;
}
