const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const groups = parse_data(data.toString('utf8'));
    console.log(groups);
    const score = sum_score(groups);
    console.log(score);
});

function parse_data (dataStr) {
    let groups = {};
    dataStr.trim();

    let group_layer = 1;
    let state = 'outside';
    let num_trash = 0;

    dataStr.split('').forEach((chr) => {
        switch(state) {
            case 'outside':
                switch(chr) {
                    case '{':
                        state = 'group';
                        groups[group_layer] = 'undefined' === typeof groups[group_layer] ? 1 : groups[group_layer] + 1;
                        group_layer++;
                        break;
                }

                break;

            case 'group':
                switch(chr) {
                    case '}':
                        group_layer--;
                        state = group_layer == 1 ? 'outside' : 'group'; 
                        break;
                    case '{':
                        groups[group_layer] = 'undefined' === typeof groups[group_layer] ? 1 : groups[group_layer] + 1;
                        group_layer++;
                        break;
                    case '<':
                        state = 'trash';
                        break;
                }

                break;

            case 'trash':
                switch(chr) {
                    case '!':
                        state = 'ignore_next';
                        break;
                    case '>':
                        state = 'group';
                        break;
                    default:
                        num_trash++;
                        break;
                }

                break;

            case 'ignore_next':
                // do nothing
                state = 'trash'; 
                break;
        }
    });

    console.log('trash chars:', num_trash);

    return groups;
}

function sum_score (groups) {
    let sum = 0;

    Object.keys(groups).forEach((group_layer) => {
       sum += group_layer * 1 * groups[group_layer]; 
    });

    return sum;
}

