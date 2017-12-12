const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const nodes = parse_data(data.toString('utf8'));
    const nodesConnected = find_nodes_connected(0, {}, nodes);
    console.log(Object.keys(nodesConnected).length);
});

function parse_data (dataStr) {
    let nodes = {};

    dataStr = dataStr.trim();

    dataStr.split(/\n/).forEach((line) => {
        if (line.match(/\d/)) { // make sure that the line at least has a number on it
            let parts = line.split(/\s+\<\-\>\s+/);
            let src_node = parts[0];
            let connections = parts[1].split(/,\s*/);

            if ('object' !== typeof nodes[src_node]) {
                nodes[src_node] = new Node(src_node);
            }

            connections.forEach((node) => {
                if ('object' !== typeof nodes[node]) {
                    nodes[node] = new Node(node);
                }

                nodes[src_node].connect(nodes[node]);
            });
        }
    });

    return nodes;
}

function find_nodes_connected(id = 0, connected = {}, nodes = {}) {
    let node = nodes[id];

    connected[id] = node;

    if (node.connections.length == 0) return connected;

    Object.keys(node.connections).forEach((ch) => {
        if ('object' === typeof connected[ch]) return;

        Object.assign(connected, find_nodes_connected(ch, connected, nodes));
    });

    return connected;
}

function Node (id) {
    this.id = id;
    this.connections = {};

    this.connect = function (node) {
        if ('object' !== typeof node) return;
        if (!node.id) return;

        this.connections[node.id] = node;
        node.connections[this.id] = node;
    };
}
