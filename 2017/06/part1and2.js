const fs = require('fs');

const dataFile = './data.txt';

fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const memoryBanks = parse_data(data.toString('utf8'));
    const redistCount = count_redistributions(memoryBanks);
    console.log('total cycles until looping:', redistCount);
});

function parse_data (dataStr) {
    let memoryBanks = [];

    dataStr.split(/\s+/).forEach((memoryBank) => {
        if (memoryBank.match(/\d/)) {
            memoryBanks.push(memoryBank * 1);
        }
    });

    return memoryBanks;
}

function count_redistributions(memoryBanks) {
    let redistMemory = memoryBanks;
    let distSeen = {};
    let redistCount = 0;

    while (1) {
        const largestBank = find_largest_bank(redistMemory);
        const nextIndex = largestBank.index + 1 == redistMemory.length ? 0 : largestBank.index + 1;

        redistMemory[largestBank.index] = 0; // reset blocks in largest memory bank

        for (let index = nextIndex, blocks = largestBank.value; blocks > 0; index = index + 1 == redistMemory.length ? 0 : index + 1, blocks--) {
            redistMemory[index]++;
        }

        redistCount++; // up the count even if we break out of the loop

        if ('undefined' !== typeof distSeen[redistMemory.join('_')]) {
            console.log('size between original cycle and it\'s repeat:', redistCount - distSeen[redistMemory.join('_')]); 
            break;
        }

        distSeen[redistMemory.join('_')] = redistCount; // set this distribution as being seen
    } 

    return redistCount;
}

function find_largest_bank(redistMemory) {
    let index = -1;
    let highestValue = -1;
   
    redistMemory.forEach((bank, i) => {
        if(bank > highestValue) {
            index = i;
            highestValue = bank;
        }
    }); 

    return { index: index, value: highestValue };
}
