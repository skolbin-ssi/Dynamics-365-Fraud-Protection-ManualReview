package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

/**
 * The entity returned by the
 * {@code /knowledgegateway/customersupport/v1.0/explorer/traversal}
 * DFP endpoint. It contains the entity relation parameters.
 * Has different dataset depending in the connected entity types.
 */
@Data
public class Edge {
    private String sourceNode;
    private String sourceNodeIdAttribute;
    private String destinationNode;
    private String destinationNodeIdAttribute;
    private Object edgeIdAttributeList;
    private String id;
    private String name;
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "name", visible = true)
    @JsonSubTypes({
            @JsonSubTypes.Type(value = PaymentInstrumentAddressEdgeData.class, name = "PaymentInstrumentAddress"),
            @JsonSubTypes.Type(value = PurchaseAddressEdgeData.class, name = "PurchaseAddress"),
            @JsonSubTypes.Type(value = PurchaseBankEventEdgeData.class, name = "PurchaseBankEvent"),
            @JsonSubTypes.Type(value = PurchaseDeviceContextEdgeData.class, name = "PurchaseDeviceContext"),
            @JsonSubTypes.Type(value = PurchasePaymentInstrumentEdgeData.class, name = "PurchasePaymentInstrument"),
            @JsonSubTypes.Type(value = PurchasePaymentInstrumentEdgeData.class, name = "PaymentInstrumentPurchase"),
            @JsonSubTypes.Type(value = PurchaseProductEdgeData.class, name = "PurchaseProduct"),
            @JsonSubTypes.Type(value = PurchaseStatusEdgeData.class, name = "PurchaseStatus"),
            @JsonSubTypes.Type(value = PurchaseUserEdgeData.class, name = "PurchaseUser"),
            @JsonSubTypes.Type(value = PurchaseUserEdgeData.class, name = "UserPurchase")
    })
    private EdgeData data;
}
