const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    let config = parse_data(data.toString('utf8'));

    //let delay = 72825;
    let delay = 0;
    let found = false;

    while (!found) {
        let results  = run_simulation(delay, config);

        if (results.layersCaught.length == 0) {
            found = true;
            console.log(`delay ${delay}: found! Severity: ${results.severity}`);
        }
        else {
            console.log(`delay ${delay}: caught! Severity: ${results.severity}`);
            delay++;
        }
    }
});

function parse_data (dataStr) {
    let config = {};
    config.layers = []; 

    dataStr = dataStr.trim();

    dataStr.split(/\n/).forEach((line) => {
        if (line.match(/\d/)) { // make sure that the line at least has a number on it
            let parts = line.split(/:\s*/);
            let index = parts[0] * 1, range = parts[1] * 1;

            if(index > config.layers.length) {
                for (let i = config.layers.length; i < index; i++) {
                    config.layers[i] = new Layer(i, 0);
                }
            }

            config.layers[index] = new Layer(index, range);
        }
    });

    return config;
}

function run_simulation (delay, config) {
    let results = {};
    let layerPos = { x: -1, y: 0 };
    results.layersCaught = [];
    results.severity = 0;

    let picoseconds = config.layers.length;

    for (let tick = 0; tick < picoseconds; tick++) {
        // Move layer
        layerPos.x++;

        // Check if caught in Layer
        if (config.layers[layerPos.x].range > 0) {
            if (config.layers[layerPos.x].hitScanner(layerPos.x + delay)) {
                results.layersCaught.push(layerPos.x);
            }
        }
    }

    results.layersCaught.forEach((layer) => {
        results.severity += layer * config.layers[layer].range;
    });

    return results;
}

function Layer (index, range) {
    this.index = index;
    this.range = range;
   
    this.hitScanner = (delay) => {
        if (delay  % (range + range - 2) == 0) return true;

        return false;
    }; 
}
