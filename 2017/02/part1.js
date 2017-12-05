const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const parsedLines = parse_data(data.toString('utf8'));
    const minMaxLines = find_min_max(parsedLines);
    const sum = sum_min_max(minMaxLines);
    console.log(sum);
});

function parse_data (dataStr) {
    let parsedLines = [];

    dataStr.split(/\n/).forEach((line) => {
        if (line.match(/\d/)) { // make sure that the line at least has a number on it
            let parsedLine = [];
            line.split(/\s+/).forEach((number) => {
                parsedLine.push(number * 1);
            });
            parsedLines.push(parsedLine);
        }
    });

    return parsedLines;
}

function find_min_max (parsedLines) {
    let minMaxLines = [];

    parsedLines.forEach((line) => {
        let min = undefined;
        let max = undefined;

        line.forEach((number) => {
           min = min == undefined || number < min ? number : min; 
           max = max == undefined || number > max ? number : max; 
        }); 

        minMaxLines.push({ min: min, max: max });
    });

    return minMaxLines;
}

function sum_min_max (minMaxLines) {
    let sum = 0;

    minMaxLines.forEach((line) => {
        sum += line.max - line.min;
    });

    return sum;
}
