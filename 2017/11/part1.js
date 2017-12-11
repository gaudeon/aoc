const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const path = parse_data(data.toString('utf8'));
    const hexPath = build_hex_path(path);
    console.log(hexPath[0], hexPath[hexPath.length - 1]);
    console.log(HexDistance(hexPath[0], hexPath[hexPath.length - 1]));
});

function parse_data (dataStr) {
    let path = [];

    dataStr = dataStr.trim();

    dataStr.split(/,/).forEach((dir) => {
        path.push(dir);
    });

    return path;
}

function build_hex_path (path) {
    let hexPath = [];

    hexPath.push(new Hex()); // start at origin

    path.forEach((dir) => {
        let nextHex = HexAdd(hexPath[hexPath.length - 1], HexDirection(dir));
        hexPath.push(nextHex);
    });

    return hexPath;
}

function Hex (x = 0, y = 0, z = 0) {
    if (x + y + z != 0) throw "Invalid Hex Coords";

    this.x = x;
    this.y = y;
    this.z = z;
}

const HEX_DIRECTIONS = {
    'n': new Hex(0, 1, -1),
    's': new Hex(0, -1, 1),
    'ne': new Hex(1, 0, -1),
    'se': new Hex(1, -1, 0),
    'nw': new Hex(-1, 1, 0),
    'sw': new Hex(-1, 0, 1)
};

function HexDirection (dir = 'n') {
    return HEX_DIRECTIONS[dir]; 
}

function HexAdd (h1, h2) {
    return new Hex(h1.x + h2.x, h1.y + h2.y, h1.z + h2.z);
}

function HexDistance (h1, h2) {
    return (Math.abs(h1.x - h2.x) + Math.abs(h1.y - h2.y) + Math.abs(h1.z - h2.z)) / 2;
}
