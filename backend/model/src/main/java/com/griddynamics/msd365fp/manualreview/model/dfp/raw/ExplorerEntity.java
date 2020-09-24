// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.dfp.raw;

import lombok.Data;
import org.springframework.lang.NonNull;
import org.springframework.util.CollectionUtils;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

/**
 * The info returned by the {@code azure.dfp.graph-explorer-url} DFP endpoint.
 * Contains set of entities and their relations.
 *
 * @see Node
 * @see Edge
 */
@Data
public class ExplorerEntity {
    private List<Node> nodes = null;
    private List<Edge> edges = null;

    public void extend(@NonNull ExplorerEntity entity) {
        if (!CollectionUtils.isEmpty(entity.getNodes())) {
            this.nodes = Objects.requireNonNullElseGet(this.nodes, LinkedList::new);
            this.nodes.addAll(entity.getNodes());
        }
        if (!CollectionUtils.isEmpty(entity.getEdges())) {
            this.edges = Objects.requireNonNullElseGet(this.edges, LinkedList::new);
            this.edges.addAll(entity.getEdges());
        }
    }
}
