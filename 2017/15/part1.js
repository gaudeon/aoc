const Generator = require('./lib/generator.js');
const Judge     = require('./lib/judge.js');

let genA = new Generator(65, 16807);
let genB = new Generator(8921, 48271);

let judge = new Judge(40000000, genA, genB);
//let judge = new Judge(5, genA, genB);

judge.count_matches((matches) => { console.log('matches', matches); });
