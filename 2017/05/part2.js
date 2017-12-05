const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const instructions = parse_instructions(data.toString('utf8'));
    const results = run_instructions(instructions);
    console.log(results);
});

function parse_instructions (data) {
    let parsed = [];

    data.split('\n').forEach((line) => {
        if (line.match(/\d/)) parsed.push(line);
    });

    return parsed;
}

function run_instructions (instructions) {
    let memory = instructions;

    let count_steps = 0;

    let line = 0;

    while(1) {
        if (line >= memory.length) break; // break out if we are beyond the instruction set

        let jump = memory[line] * 1;
        memory[line] = (jump >= 3) ? jump - 1 : jump + 1;

        //console.log('line:', line);
        //console.log('jump:', jump);
        //console.log('next_line:', line + jump);
        //console.log('offest jump:', memory[line]);
        //console.log('--------------');

        line = line + jump; // move to next line

        count_steps++; // increment number of steps
    }

    return {
        steps: count_steps
    };
}
