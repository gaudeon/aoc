class Generator {
    constructor (startValue, factor) {
        this.startValue  = startValue;
        this.factor      = factor;
        this.denominator = 2147483647;
        this.lastValue   = startValue;
    }

    next_value () {
        let nextValue = this.lastValue * this.factor % this.denominator;

        this.lastValue = nextValue;

        return nextValue; 
    };
}

module.exports = Generator;
