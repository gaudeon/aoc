const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    let firewall = parse_data(data.toString('utf8'));
    let results  = run_simulation(firewall);
    console.log(results);
});

function parse_data (dataStr) {
    let firewall = [];

    dataStr = dataStr.trim();

    dataStr.split(/\n/).forEach((line) => {
        if (line.match(/\d/)) { // make sure that the line at least has a number on it
            let parts = line.split(/:\s*/);
            let index = parts[0] * 1, range = parts[1] * 1;

            if(index > firewall.length) {
                for (let i = firewall.length; i < index; i++) {
                    firewall[i] = [];
                }
            }

            firewall[index] = [];
            firewall[index].length = range;
        }
    });

    return firewall;
}

function run_simulation (firewall) {
    let results = {};
    let layerPos = { x: -1, y: 0 };
    results.layersCaught = [];
    results.severity = 0;

    firewall = init_firewall(firewall);

    let picoseconds = firewall.length;

    for (let tick = 0; tick < picoseconds; tick++) {
        // Move layer
        layerPos.x++;

        // Check if caught
        if (firewall[layerPos.x].length > 0) {
            if (firewall[layerPos.x][layerPos.y] != 0) {
                results.layersCaught.push(layerPos.x);
            }
        }

        // Move Scanners
        for (let layer = 0; layer < firewall.length; layer++) { 
            if (firewall[layer].length > 0) {
                let currentScannerPos = firewall[layer].findIndex((el) => { return el != 0; });

                let dir = firewall[layer][currentScannerPos];

                if (currentScannerPos == 0 && dir == -1) dir = 1;
                if (currentScannerPos == firewall[layer].length - 1 && dir == 1) dir = -1;

                if ((dir == 1 && currentScannerPos < firewall[layer].length - 1) || (dir == -1 && currentScannerPos > 0)) 
                    firewall[layer][currentScannerPos + dir] = dir;

                firewall[layer][currentScannerPos] = 0;
            }
        }
    }

    results.layersCaught.forEach((layer) => {
        results.severity += layer * firewall[layer].length;
    });

    return results;
}

function init_firewall (firewall) {
    firewall.forEach((layer) => {
        if (layer.length == 0) return;

        layer.fill(0);
        layer[0] = 1;
    });
     
    return firewall;
}
