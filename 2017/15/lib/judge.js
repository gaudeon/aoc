const cluster = require ('cluster');
const numCPUs = require('os').cpus().length;

class Judge {
    constructor (iterations, ...generators) {
        if (generators.length > numCPUs) {
            throw "Not enough CPUs to support generators provided";
        }

        this.generators = generators;
        this.iterations = iterations;
    }

    count_matches (callback) {
        callback = "function" === typeof callback ? callback : function () {};

        if (cluster.isMaster) {
            let matches = 0;

            cluster.on('online', (worker) => {
                worker.send('start');
            });

            // Fork workers.
            for (let i = 0; i < this.generators.length; i++) {
                cluster.fork({ generator: i });
            }

            let trackBin = {};

            for (const id in cluster.workers) {
                cluster.workers[id].on('message', (msg) => {
                    trackBin[msg.iteration] = trackBin[msg.iteration] || {};
                    trackBin[msg.iteration].count = trackBin[msg.iteration].count || 0;
                    trackBin[msg.iteration].count++;
                    trackBin[msg.iteration].bin = trackBin[msg.iteration].bin || {};
                    trackBin[msg.iteration].bin[msg.bin] = trackBin[msg.iteration].bin[msg.bin] + 1 || 1;
                    
                    if (trackBin[msg.iteration].count === this.generators.length) {
                        if (Object.keys(trackBin[msg.iteration].bin).length === 1) {
                            matches++;
                        }

                        delete trackBin[msg.iteration];

                        if (msg.iteration === this.iterations - 1) {
                            callback(matches);
                        }
                    }
                });
            }
        }
        else {
            process.on('message', (msg) => {
                for (let i = 0; i < this.iterations; i++) {
                    console.log('step', i);
                    process.send({ id: process.env.generator, iteration: i, bin: this.generators[process.env.generator].next_value().toString(2).substr(-16) });
                }

                process.exit(0);
            });
        }
    }
}

module.exports = Judge;
