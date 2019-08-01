// JS file containing code for generating confluent drawings

// global variables
var svg,
    width,
    height,
    simulation;

// custom variables
var length_hidden_link = 400,
    length_link_between_hidden_nodes = 50,
    length_link_between_visible_nodes = 80,
    length_link_between_hidden_visible_nodes = 15;

var link_strength = 0.5,
    node_strength = -1000,
    force_collide = 80;

var force_x_strength = 0.1,
    force_y_strength = 0.1;

var neighborhoods_similarity_percentage_treshold = 0.5;

// create the SVG and the graph structure
function setup_SVG_hidden_graph() {
    svg = d3.select("#hiddenGraph");
    width = +svg.attr("width");
    height = +svg.attr("height");

    // force directed graph
    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) { return d.id; })
            .distance(function (d) {
                // hidden (long) edge
                if (d.isHidden) return length_hidden_link;
                // edge between hidden nodes
                if (d.source.isHidden && d.target.isHidden) return length_link_between_hidden_nodes;
                // edge between visible nodes
                else if (!d.source.isHidden && !d.target.isHidden) return length_link_between_visible_nodes;
                // hidden (short) edge
                else return length_link_between_hidden_visible_nodes;
            })
            .strength(link_strength))
        .force("charge", d3.forceManyBody().strength(node_strength))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(force_collide).radius())
        .force("x", d3.forceX(-100).strength(force_x_strength))
        .force("y", d3.forceY(100).strength(force_y_strength));
}

// generate the graph content
function generate_hidden_graph(graph) {

    graph["confluent_modules"] = [];
    graph["confluent_links"] = [];

    var cluster_movies = {};
    var index_movies = 0;
    var neighborhood_movies = {};

    // pick the nodes with similar neighborhood and that neighborhood
    var movies_list = [];
    graph.nodes.forEach(function (node) {
        if (node.type == "movie") {
            movies_list.push(node);
        }
    });
    var visited_movies = [];
    movies_list.forEach(function (external_movie) {
        var movies_with_similar_neighborhood = [];
        movies_with_similar_neighborhood.push(external_movie);
        var external_neighborhood = get_neighborhood(external_movie);
        visited_movies.push(external_movie);
        movies_list.forEach(function (internal_movie) {
            if (!visited_movies.includes(internal_movie)) {
                var internal_neighborhood = get_neighborhood(internal_movie);
                if (get_intersection(external_neighborhood, internal_neighborhood).length > 0 && get_intersection(internal_neighborhood, external_neighborhood).length > 0) {
                    movies_with_similar_neighborhood.push(internal_movie);
                    cluster_movies[index_movies] = movies_with_similar_neighborhood;
                    neighborhood_movies[index_movies] = get_intersection(external_neighborhood, internal_neighborhood);
                    index_movies++;
                }
            }
        })
    });

    // get object size
    Object.size = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
    var size_cluster_movies = Object.size(cluster_movies);

    // create the cluster modules
    var movies_heroes_cluster = [];
    var index_movies_heroes_cluster = 0;
    var last_cluster_movie_group = {};
    for (var element = 0; element < size_cluster_movies; element++) {
        if (!compare_objects(cluster_movies[element], last_cluster_movie_group)) {
            movies_heroes_cluster.push({ "movies": cluster_movies[element] });
            movies_heroes_cluster.push({ "intersection": neighborhood_movies[element] });
            index_movies_heroes_cluster++;
            last_cluster_movie_group = cluster_movies[element];
        }
    }

    // add confluent nodes and edges to the graph
    var index;
    for (index = 0; index < Object.size(movies_heroes_cluster); index += 2) {
        var movie_ids = [];
        for (var movie_index = 0; movie_index < Object.size(movies_heroes_cluster[index].movies); movie_index++) {
            movie_ids.push(movies_heroes_cluster[index].movies[movie_index].id)
        }
        var confluent_modules_movie = { "id": index, "nodes": movie_ids };
        var hero_ids = [];
        for (var hero_index = 0; hero_index < Object.size(movies_heroes_cluster[index + 1].intersection); hero_index++) {
            hero_ids.push(movies_heroes_cluster[index + 1].intersection[hero_index])
        }
        var confluent_modules_heroes = { "id": index + 1, "nodes": hero_ids };
        var confluent_modules_link = { "source": index, "target": index + 1 };
        graph.confluent_modules.push(confluent_modules_movie);
        graph.confluent_modules.push(confluent_modules_heroes);
        graph.confluent_links.push(confluent_modules_link);
    }

    // compare 2 objects
    function compare_objects(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    // get the node neighborhood
    function get_neighborhood(m) {
        var neighbors = [];
        graph.links.forEach(function (link) {
            if (link.target == m.id) {
                neighbors.push(link.source);
            }
        });
        return neighbors;
    }

    // get the neighborhood intersection
    function get_intersection(list1, list2) {
        var elements_in_common = list1.filter(value => list2.includes(value));
        var percentage_elements_in_common = elements_in_common.length / list1.length;
        if (percentage_elements_in_common >= neighborhoods_similarity_percentage_treshold) {
            return elements_in_common;
        } else {
            return [];
        }
    }

    // set up SVG
    setup_SVG_hidden_graph();
    // get the hidden graph from the module data
    var hiddenGraph = graphToHiddenGraph(graph);
    draw_hidden_graph(hiddenGraph);
}

// draw the hidden graph
function draw_hidden_graph(graph) {
    // create the tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // create the edges
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", "2")
        .style("stroke", "grey")
        .style("stroke-opacity", function (d) {
            if (d.isHidden) return 0;
            else return 1;
        });

    // create the nodes
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", connectedNodes); // selection

    // append images
    var images = node.append("image")
        .attr("class", "circle")
        .attr("xlink:href", function (d) {
            if (!d.isHidden)
                return "img/" + d.id + ".png";
        })
        .attr("x", "-35px")
        .attr("y", "-35px")
        .attr("width", function (d) {
            if (!d.isHidden) return "70px";
            else return "0px";
        })
        .attr("height", function (d) {
            if (!d.isHidden) return "70px";
            else return "0px";
        });

    // make the image grow a little on mouse over
    images
        .on("mouseenter", function () {
            // select element in current context
            d3.select(this)
                .transition()
                .attr("x", "-60px")
                .attr("y", "-60px")
                .attr("height", "120px")
                .attr("width", "120px");
        })
        // set back
        .on("mouseleave", function () {
            d3.select(this)
                .transition()
                .attr("x", "-35px")
                .attr("y", "-35px")
                .attr("height", "70px")
                .attr("width", "70px");
        })

    // tooltips
    node.on('mouseover', function (d) {
        if (!d.isHidden) {
            tooltip.html(d.name + "<hr>" + "<i>" + d.type + "</i>")
            myMouseOver();
        }
    })
        .on('mouseout', function () {
            myMouseOut();
        })
        .on('mousemove', function () {
            myMouseMove();
        })

    // tooltip functions
    function myMouseOver() {
        tooltip
            .style("opacity", 0.7)
            .style('display', 'block');
    }

    function myMouseOut() {
        tooltip.style('display', 'none');
    }

    function myMouseMove() {
        tooltip
            .style('top', (d3.event.layerY + 10) + 'px')
            .style('left', (d3.event.layerX + 10) + 'px');
    }

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }

    // SELECTION
    // toggle stores whether the highlighting is on
    // initial highlight is off
    var toggle = 0;
    // create an array logging what is connected to what
    var linkedByIndex = {};
    // get the ID of a node from his index
    var id_from_index = {};
    for (var i = 0; i < graph.nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    }
    graph.links.forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
        id_from_index[d.source.index] = d.source.id;
        id_from_index[d.target.index] = d.target.id;
    });
    // this function looks up whether a pair are neighbours
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }
    // select nodes and paths to their neighbours
    function connectedNodes() {
        if (toggle == 0) {
            // reduce the opacity of all but the neighbouring nodes
            var clicked_node = d3.select(this).node().__data__;
            node.style("opacity", function (o) {
                return neighboring(clicked_node, o) || neighboring(o, clicked_node) ? 1 : 0.1;
            });

            var marked_links = [];
            var first_hidden_nodes = [];
            // mark every link between the clicked one and real nodes
            // also find the first hidden node(s) linked to the clicked one
            for (var key in linkedByIndex) {
                var index_comma = key.indexOf(",");
                var link_source = key.substr(0, index_comma);
                var link_target = key.substr(index_comma + 1, key.length);
                if (link_source != link_target) {
                    if (link_source == clicked_node.index) {
                        // link between real nodes
                        if (isNaN(id_from_index[link_target])) {
                            marked_links.push({ source: link_source, target: link_target });
                        }
                        // link between real and hidden nodes
                        if (!isNaN(id_from_index[link_target])) {
                            marked_links.push({ source: link_source, target: link_target });
                            first_hidden_nodes.push(link_target);
                        }
                    } else if (link_target == clicked_node.index) {
                        // link between real nodes
                        if (isNaN(id_from_index[link_source])) {
                            marked_links.push({ source: link_source, target: link_target });
                        }
                        // link between real and hidden nodes
                        if (!isNaN(id_from_index[link_source])) {
                            marked_links.push({ source: link_source, target: link_target });
                            first_hidden_nodes.push(link_source);
                        }
                    }
                }
            }
            // mark every link between the first hidden node(s) and the second hidden node(s)
            var second_hidden_nodes = [];
            for (key in linkedByIndex) {
                link_source = key.substr(0, key.indexOf(","));
                link_target = key.substr(key.indexOf(",") + 1, key.length);
                if (link_source != link_target) {
                    if (first_hidden_nodes.includes(link_source) && !isNaN(id_from_index[link_target])) {
                        marked_links.push({ source: link_source, target: link_target });
                        second_hidden_nodes.push(link_target)
                    }
                    if (first_hidden_nodes.includes(link_target) && !isNaN(id_from_index[link_source])) {
                        marked_links.push({ source: link_source, target: link_target });
                        second_hidden_nodes.push(link_source)
                    }
                }
            }
            // mark every link between the second hidden node(s) and the non-hidden node(s)
            for (key in linkedByIndex) {
                link_source = key.substr(0, key.indexOf(","));
                link_target = key.substr(key.indexOf(",") + 1, key.length);
                if (link_source != link_target) {
                    if (second_hidden_nodes.includes(link_source) && isNaN(id_from_index[link_target])) {
                        marked_links.push({ source: link_source, target: link_target });
                    }
                    if (second_hidden_nodes.includes(link_target) && isNaN(id_from_index[link_source])) {
                        marked_links.push({ source: link_source, target: link_target });
                    }
                }
            }
            // set the opacity 1 to the marked nodes, 0.1 to the others
            link.style("opacity", function (current_link) {
                for (var i = 0; i < marked_links.length; i++) {
                    var marked_link = marked_links[i];
                    if (current_link.source.index == marked_link.source && current_link.target.index == marked_link.target) {
                        return 1;
                    }
                }
                return 0.1;
            });
            // the highlight is on
            toggle = 1;
        } else {
            // put them back to opacity = 1
            node.style("opacity", 1);
            link.style("opacity", 1);
            // the highlight is back to off
            toggle = 0;
        }
    }
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
