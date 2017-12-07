const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const programs = parse_data(data.toString('utf8'));

    let root = 'hlhomy';

    // find the imbalance
    check_weight(root, 'root', programs);
});

function parse_data(data) {
    let programs = {};

    data.split(/\n/).forEach((line) => {
        if (line.match(/\w/)) {
            let left_right = line.split(/\s+->\s+/);

            let node = {
                name: '',
                parent: undefined,
                weight: 0,
                children: []
            };

            let node_info = /^(\w+)\s+\((\d+)\)/.exec(left_right[0]);

            node.name = node_info[1];
            node.weight = node_info[2] * 1;

            node.children = [];

            if(left_right[1]) {
                node.children = left_right[1].split(/,\s+/);

                node.children.forEach((child) => {
                    if ('undefined' === typeof programs[child]) {
                        programs[child] = {
                            name: child,
                            parent: node.name,
                            weight: 0,
                            children: []
                        };
                    }
                    else {
                        programs[child].parent = node.name;
                    }
                });
            }

            if ('undefined' === typeof programs[node.name]) {
                programs[node.name] = node;
            } else {
                programs[node.name].weight = node.weight;
                programs[node.name].children = node.children; 
            }
        }
    });

    return programs;
}

function check_weight(node, genealogy, programs) {
    if (programs[node].children.length == 0) {
        return programs[node].weight;
    }

    let weight_sum = 0;
    let child_weights = [];
    let first_child_weight = undefined;
    let has_imbalance = false;
    programs[node].children.forEach((child) => {
        let child_weight = check_weight(child, genealogy + '.' + node, programs);
        weight_sum += child_weight;
        child_weights.push({ 'weight_sum': child_weight, 'child': programs[child]});
        if('undefined' === typeof first_child_weight) {
            first_child_weight = child_weight
        }
        else if (child_weight != first_child_weight) {
            has_imbalance = true;
        }
    });

    if (has_imbalance) {
        console.log('---------');
        console.log(genealogy + '.' + node + ' has an imbalance. ', child_weights);
    } 

    return weight_sum + programs[node].weight;
}

