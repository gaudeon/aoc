const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const parsedLines = parse_data(data.toString('utf8'));
    const evenlyDivisibleLines = find_evenly_divisible(parsedLines);
    const sum = sum_evenly_divisible(evenlyDivisibleLines);
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

function find_evenly_divisible (parsedLines) {
    let evenlyDivisibleLines = [];

    parsedLines.forEach((line) => {
        let found = undefined;

        const set_found = (n,d) => { found = { numerator: n, denominator: d}; };

        let sorted = line.sort((a, b) => {
            if (a < b) return 1;

            if (a > b) {
                if (a % b == 0) set_found(a, b);

                return -1;
            }

            return 0;
        }); 

        if (found == undefined) {
            for (let i = 0; i < line.length; i++) {
                for (let j = i + 1; j < line.length; j++) {
                    if (line[i] % line[j] == 0) {
                        set_found(line[i], line[j]);
                        break;
                    }
                }
                if (found != undefined) break;
            }
        }

        evenlyDivisibleLines.push(found);
    });

    return evenlyDivisibleLines;
}

function sum_evenly_divisible (evenlyDivisbleLines) {
    let sum = 0;

    evenlyDivisbleLines.forEach((line) => {
        sum += line.numerator / line.denominator;
    });

    return sum;
}
