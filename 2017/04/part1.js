const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const parsedLines = parse_data(data.toString('utf8'));
    const sortedLines = sort_lines_by_validity(parsedLines);
    console.log('total lines', parsedLines.length);
    console.log('invalid lines', sortedLines.invalid.length);
    console.log('valid lines', sortedLines.valid.length);
});

function parse_data (dataStr) {
    let parsedLines = [];

    dataStr.split(/\n/).forEach((line) => {
        if (line.match(/\w/)) { // make sure that the line at least has a word character on it
            let parsedLine = [];
            line.split(/\s+/).forEach((word) => {
                parsedLine.push(word);
            });
            parsedLines.push(parsedLine);
        }
    });

    return parsedLines;
}

function sort_lines_by_validity (parsedLines) {
    let sortedLines = {
        valid: [],
        invalid: []
    };

    parsedLines.forEach((line) => {
        let isValid = true;

        for(let i = 0; i < line.length; i++) {
            for(let j = i + 1; j < line.length; j++) {
                if (line[i] == line[j]) {
                    isValid = false;
                    break;
                }
            }
            if (!isValid) break;
        }

        if(isValid) {
            sortedLines.valid.push(line);
        }
        else {
            sortedLines.invalid.push(line);
        }
    });

    return sortedLines;
}
