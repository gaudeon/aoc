const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    let registers = parse_data(data.toString('utf8'));
    console.log(registers);
});

function parse_data (dataStr) {
    let registers = {};

    dataStr.split(/\n/).forEach((line) => {
        if (line.match(/\w/)) { // make sure that the line at least has a number on it
            let parsedLine = [];
            let parts = line.split(/\s+/);
            
            let register      = parts[0];
            let isInc         = parts[1] == 'inc' ? true : false;   
            let amount        = parts[2] * 1;
            let cond_register = parts[4]; // part 3 is 'if'
            let cond_op       = parts[5];
            let cond_amount   = parts[6] * 1; 

            let makeChange          = false;
            let cond_register_value = get_register_value(cond_register, registers);
            switch (cond_op) {
                case '>':
                    if (cond_register_value > cond_amount) makeChange = true;
                    break;
                case '<':
                    if (cond_register_value < cond_amount) makeChange = true;
                    break;
                case '>=':
                    if (cond_register_value >= cond_amount) makeChange = true;
                    break;
                case '<=':
                    if (cond_register_value <= cond_amount) makeChange = true;
                    break;
                case '!=':
                    if (cond_register_value != cond_amount) makeChange = true;
                    break;
                case '==':
                    if (cond_register_value == cond_amount) makeChange = true;
                    break;
            }
            
            if (makeChange) {
                let register_value = get_register_value(register, registers);
                register_value = register_value + (isInc ? amount : -amount);
                set_register_value(register, register_value, registers);
            }
        }
    });

    return registers;
}

function get_register_value(register, registers) {
    if ('undefined' === typeof registers[register]) registers[register] = 0;

    return registers[register];
}

function set_register_value(register, value, registers) {
    let old_val = get_register_value(register, registers);

    registers[register] = value * 1;

    return old_val;
}
