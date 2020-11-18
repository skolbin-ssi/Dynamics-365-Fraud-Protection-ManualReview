// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.CollectionUtils;

import java.util.List;

/**
 * The info returned by the {@code azure.dfp.graph-explorer-url} DFP endpoint.
 * Contains set of entities and their relations.
 *
 * @see Node
 * @see Edge
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExplorerEntity {
    public static final ExplorerEntity EMPTY = new ExplorerEntity(
            null,
            null,
            List.of(),
            List.of());

    private String requestAttributeName;
    private String requestAttributeValue;

    private List<Node> nodes = null;
    private List<Edge> edges = null;

    public boolean isEmpty() {
        return CollectionUtils.isEmpty(nodes) && CollectionUtils.isEmpty(edges);
    }
}
