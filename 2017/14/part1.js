const fs = require('fs');

const dataFile = './data.txt';

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
    console.log('emoty', empty);
});

function generate_grid(input_key) {
    let grid = [];

    for (let i = 0; i < 128; i++) {
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
