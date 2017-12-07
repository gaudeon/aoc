const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const programs = parse_data(data.toString('utf8'));

    // find program without parents
    Object.keys(programs).forEach((program) => {
        if('undefined' === typeof programs[program].parent) {
            console.log(program);
        }
    });
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

