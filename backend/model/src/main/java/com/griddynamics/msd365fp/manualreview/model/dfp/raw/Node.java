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
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "name", visible = true)
    @JsonSubTypes({
            @JsonSubTypes.Type(value = AddressNodeData.class, name = "Address"),
            @JsonSubTypes.Type(value = BankEventNodeData.class, name = "BankEvent"),
            @JsonSubTypes.Type(value = DeviceContextNodeData.class, name = "DeviceContext"),
            @JsonSubTypes.Type(value = PaymentInstrumentNodeData.class, name = "PaymentInstrument"),
            @JsonSubTypes.Type(value = ProductNodeData.class, name = "Product"),
            @JsonSubTypes.Type(value = UserNodeData.class, name = "User"),
            @JsonSubTypes.Type(value = PurchaseNodeData.class, name = "Purchase")
    })
    private NodeData data;
}
