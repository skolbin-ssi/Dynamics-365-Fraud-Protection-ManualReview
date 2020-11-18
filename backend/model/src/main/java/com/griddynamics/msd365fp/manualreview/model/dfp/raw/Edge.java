// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

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
    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
            property = "name",
            visible = true,
            defaultImpl = DefaultEdgeData.class)
    @JsonSubTypes({
            @JsonSubTypes.Type(value = PaymentInstrumentAddressEdgeData.class, name = PaymentInstrumentAddressEdgeData.EDGE_DIRECT_NAME),
            @JsonSubTypes.Type(value = PaymentInstrumentAddressEdgeData.class, name = PaymentInstrumentAddressEdgeData.EDGE_REVERSED_NAME),
            @JsonSubTypes.Type(value = PurchaseAddressEdgeData.class, name = PurchaseAddressEdgeData.EDGE_DIRECT_NAME),
            @JsonSubTypes.Type(value = PurchaseAddressEdgeData.class, name = PurchaseAddressEdgeData.EDGE_REVERSED_NAME),
            @JsonSubTypes.Type(value = PurchaseBankEventEdgeData.class, name = PurchaseBankEventEdgeData.EDGE_DIRECT_NAME),
            @JsonSubTypes.Type(value = PurchaseBankEventEdgeData.class, name = PurchaseBankEventEdgeData.EDGE_REVERSED_NAME),
            @JsonSubTypes.Type(value = PurchaseDeviceContextEdgeData.class, name = PurchaseDeviceContextEdgeData.EDGE_DIRECT_NAME),
            @JsonSubTypes.Type(value = PurchaseDeviceContextEdgeData.class, name = PurchaseDeviceContextEdgeData.EDGE_REVERSED_NAME),
            @JsonSubTypes.Type(value = PurchasePaymentInstrumentEdgeData.class, name = PurchasePaymentInstrumentEdgeData.EDGE_DIRECT_NAME),
            @JsonSubTypes.Type(value = PurchasePaymentInstrumentEdgeData.class, name = PurchasePaymentInstrumentEdgeData.EDGE_REVERSED_NAME),
            @JsonSubTypes.Type(value = PurchaseProductEdgeData.class, name = PurchaseProductEdgeData.EDGE_DIRECT_NAME),
            @JsonSubTypes.Type(value = PurchaseProductEdgeData.class, name = PurchaseProductEdgeData.EDGE_REVERSED_NAME),
            @JsonSubTypes.Type(value = PurchaseStatusEdgeData.class, name = PurchaseStatusEdgeData.EDGE_DIRECT_NAME),
            @JsonSubTypes.Type(value = PurchaseStatusEdgeData.class, name = PurchaseStatusEdgeData.EDGE_REVERSED_NAME),
            @JsonSubTypes.Type(value = PurchaseUserEdgeData.class, name = PurchaseUserEdgeData.EDGE_DIRECT_NAME),
            @JsonSubTypes.Type(value = PurchaseUserEdgeData.class, name = PurchaseUserEdgeData.EDGE_REVERSED_NAME)
    })
    private EdgeData data;
}
