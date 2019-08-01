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


    // everything done, yay
    return hiddenGraph;
}
