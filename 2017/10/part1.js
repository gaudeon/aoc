const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const lengths = parse_data(data.toString('utf8'));
    const list_size = 256;
    let list = [];
    for (let i = 0; i < list_size; i++) {
        list.push(i);
    }

    const hashed_list = process_list(list, lengths);
    console.log(hashed_list);
    console.log('answer', hashed_list[0] * hashed_list[1]);
});

function parse_data (dataStr) {
    let lengths = [];

    dataStr.trim();

    dataStr.split(/,\s*/).forEach((length) => {
        lengths.push(length*1);
    });

    return lengths;
}

function process_list(list, lengths) {
    let current_pos = 0;
    let skip_size = 0;
    let hashed_list = list;

    lengths.forEach((length) => {
        if (length <= hashed_list.length) {
            hashed_list = circular_splice(hashed_list, current_pos, length, reverse_slice(hashed_list, current_pos, length));
            current_pos += length + skip_size;
            if (current_pos > hashed_list.length) current_pos -= hashed_list.length;
            skip_size++;
        }
    });
   
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
    for (let i = index; replace.length > 0; i++) {
        let val = replace.shift();
        list[i < list.length ? i : i - list.length] = val;
    }

    return list;
}
