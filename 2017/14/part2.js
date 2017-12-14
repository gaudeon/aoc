const fs = require('fs');

const dataFile = './data.txt';

const GRID_WIDTH = 128;

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const input_key = data.toString('utf8').trim();
    
    console.log(input_key);

    const grid = generate_grid(input_key);

    const total = grid.length;
    const used = grid.reduce((result, val, index, ara) => { result += val * 1; return result; }, 0);
    const empty = total - used;
    
    console.log('total', total);
    console.log('used', used);
    console.log('empty', empty);

    console.log(pretty_grid(grid));

    const results = group_grid(grid);

    console.log(results.grid);

    console.log('last group id', results.last_group_id);
});

function group_grid(grid) {
    let results = { groups: [], grid: [], last_group_id: 0};
    let group_id = 1;

    for (let i = 0; i < grid.length; i++) {
        if (grid[i].toString().match(/^(g\d+|0)/)) continue;

        results.groups.push(find_adjacent(i, 'g' + group_id, grid));

        group_id++;
    }

    results.grid = pretty_grid(grid, group_id.toString().length + 1);
    results.last_group_id = group_id - 1;

    return results;
}

function pretty_grid(grid, col_size = 2) {
    let str = '';

    for (i = 0; i < grid.length; i++) {
        str += grid[i].toString().padStart(col_size) + ' ';
        if (i % GRID_WIDTH == 127) str += '\n';
    }

    return str;
}

function find_adjacent(index, group_id, grid, group = []) {
    grid[index] = group_id;

    group.push(index);

    let adj = [];

    let reGroup = new RegExp('^1$');

    if ((index + 1) % GRID_WIDTH > index % GRID_WIDTH && index + 1 <= grid.length && grid[index + 1].toString().match(reGroup)) adj.push(index + 1);

    if ((index - 1) % GRID_WIDTH < index % GRID_WIDTH && index - 1 >= 0 && grid[index - 1].toString().match(reGroup)) adj.push(index - 1);

    if ((index + GRID_WIDTH) < grid.length && grid[index + GRID_WIDTH].toString().match(reGroup)) adj.push(index + GRID_WIDTH);

    if ((index - GRID_WIDTH) > 0 && grid[index - GRID_WIDTH].toString().match(reGroup)) adj.push(index - GRID_WIDTH);

    if (adj.length == 0) return group;

    adj.forEach((a) => { group = find_adjacent(a, group_id, grid, group); });

    return group;
}

function generate_grid(input_key) {
    let grid = [];

    for (let i = 0; i < GRID_WIDTH; i++) {
        let full_key = input_key + '-' + i;

        let knot_hash = generate_knot_hash(full_key);

        let chrs = knot_hash.split('');

        let bin = chrs.reduce((result, val, index, ara) => { let b = parseInt(val,16).toString(2); b = b.padStart(4, '0'); result += b; return result; }, '');

        grid = grid.concat(bin.split(''));
    }

    return grid;    
}

function generate_knot_hash (str) {
    let lengths = [];

    str.split('').forEach((chr) => {
        if (!chr.match(/^[\n]$/)) {
            lengths.push(chr.charCodeAt(0) * 1);
        }
    });

    lengths = lengths.concat(17, 31, 73, 47, 23);

    const hashed_list  = process_lengths(lengths);

    const dense_list   = create_dense_hash(hashed_list);

    return dense_list.map((el) => { return el.toString(16).length == 1 ? '0' + el.toString(16) : el.toString(16); }).join('');
}

function process_lengths(lengths) {
    let current_pos = 0;
    let skip_size = 0;
    let hashed_list = [];
    const list_size = 256;
    let list = [];
    for (let i = 0; i < list_size; i++) {
        list.push(i);
    }

    for (let i = 0; i < 64; i++) {
        lengths.forEach((length) => {
            list = circular_splice(list, current_pos, length, reverse_slice(list, current_pos, length));
            current_pos += length + skip_size;
            if (current_pos > list.length) current_pos = current_pos % list.length;
            skip_size++;
        });

        hashed_list = list;
    }

    return hashed_list; 
}

function reverse_slice (list, index, length) {
    let slice = [];

    for (let i = index; slice.length < length; i++) {
        slice.push(list[i < list.length ? i : i - list.length]);
    }

    return slice.reverse();
}

function circular_splice (list, index, length, replace) {
    let l = Array.from(list);
    let r = Array.from(replace);

    for (let i = index, j = 0; j < r.length; i++, j++) {
        l[(i < l.length) ? i : i - l.length] = r[j];
    }

    return l;
}

function create_dense_hash (list) {
    let dense_list = [];

    for (let i = 0; i * 16 < list.length; i++) {
        let num = 0;

        for (let j = 0; j < 16; j++) {
            num = num ^ list[i * 16 + j];
        }

        dense_list.push(num);
    }

    return dense_list;
}
