// this file contains functions for making the hidden graph

function graphToHiddenGraph(graph) {
    var hiddenGraph = {};
    hiddenGraph.links = graph.links;

    // push the nodes
    hiddenGraph.nodes = graph.nodes;
    // mark each node as not hidden
    hiddenGraph.nodes.forEach(function (elem) {
        elem.isHidden = false;
    });

    // create a hidden nodes for each module
    graph.confluent_modules.forEach(function (elem) {
        hiddenGraph.nodes.push({
            "id": elem.id,
            "isHidden": true
        });
    });

    // push the links between hidden nodes
    hiddenGraph.links = graph.confluent_links;
    // push the links between hidden nodes and cluster nodes
    graph.confluent_modules.forEach(function (elem) {
        var elemNodes = elem.nodes;

        // links from current module to hidden nodes
        elemNodes.forEach(function (e) {
            hiddenGraph.links.push({
                "source": elem.id,
                "target": e
            });
        });

    });

    // set every link as not hidden, we will hide them later
    graph.links.forEach(function (link) {
        hiddenGraph.links.push({
            "source": link.source,
            "target": link.target,
            "isHidden": false
        });
    });

    // hide the links between cluster nodes and cluster nodes linked to them
    hiddenGraph.links.forEach(function (link) {
        var link_source = link.source;
        var link_target = link.target;
        graph.confluent_links.forEach(function (confluent_link) {
            var confluent_link_source = confluent_link.source;
            var confluent_link_target = confluent_link.target;
            var source_list = [];
            var target_list = [];

            if (!isNaN(confluent_link_source) && !isNaN(confluent_link_target)) {
                graph.confluent_modules.forEach(function (confluent_module) {
                    if (confluent_module.id == confluent_link_source) {
                        source_list = source_list.concat(confluent_module.nodes)
                    } else if (confluent_module.id == confluent_link_target) {
                        target_list = target_list.concat(confluent_module.nodes)
                    }
                });
                if (source_list.includes(link_target) && target_list.includes(link_source)) {
                    link.isHidden = true
                }
            }
        });
    });

    // create links between nodes from the same cluster
    graph.confluent_modules.forEach(function (elem) {
        elem.nodes.forEach(function (external_cluster_node) {
            elem.nodes.forEach(function (internal_cluster_node) {
                hiddenGraph.links.push({
                    "source": external_cluster_node,
                    "target": internal_cluster_node,
                    "isCluster": true
                });
            })
        })
    });

    // add links between anchored and real nodes to the graph
    hiddenGraph.nodes.forEach(function (n) {
        if (n.type == "movie") {
            hiddenGraph.links.push({
                "source": "f1",
                "target": n.id,
                "isFixed": true
            });
        }
        else if (n.type == "hero") {
            hiddenGraph.links.push({
                "source": "f2",
                "target": n.id,
                "isFixed": true
            });
        }
    })

    // everything done, yay
    return hiddenGraph;
}
