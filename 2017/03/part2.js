let SpiralGrid = function (target_port) {
    let obj = {
        port: target_port,
        port_loc: {
            x: -1,
            y: -1
        },
        first_value_larger_than_port: undefined,
        size: 0,
        grid: [1],
        init: function () {
            this.size = this.find_grid_size(this.port);
            this.grid = this.create_grid(this.size);
        },
        calc_grid_row_length: function (size) {
            return 2 * size + 1;
        },
        calc_grid_length: function (size) {
            return this.calc_grid_row_length(size) ** 2;
        },
        calc_layer_length: function (size) {
            return size == 0 ? 1 : this.calc_grid_row_length(size) * 4 - 4;
        },
        calc_grid_center_x: function (size) {
            return size;
        },
        calc_grid_center_y: function (size) {
            return size;
        },
        calc_index_from_coords: function (size, x, y) {
            return y * this.calc_grid_row_length(size) + x;
        },
        calc_taxicab_distance: function (x1, y1, x2, y2) {
            return Math.abs(x1 - x2) + Math.abs(y1 - y2);
        },
        calc_taxicab_distance_to_center: function (x, y, size) {
            let s = size || this.size;
            let cx = this.calc_grid_center_x(s);
            let cy = this.calc_grid_center_y(s);
            return this.calc_taxicab_distance(x, y, cx, cy);
        },
        calc_sum_of_adjacent_numbers: function (grid, size, x, y) {
            let sum = 0;

            // the center starts at a value of 1
            if (this.calc_grid_center_x(size) == x && this.calc_grid_center_y(size) == y) {
                return 1;
            }

            for (let cy = -1; cy <= 1; cy++) {
                for (let cx = -1; cx <= 1; cx++) {
                    if (cy == 0 && cx == 0) continue; // don't add in ourselves

                    let px = x + cx;
                    let py = y + cy;

                    if (px < 0 || px >= this.calc_grid_row_length(size) || py < 0 || py >= this.calc_grid_row_length(size)) continue; // don't add in out of boundarys numbers

                    let index = this.calc_index_from_coords(size, px, py);
                    sum = sum + ('undefined' === typeof grid[index] ? 0 : grid[index]);
                } 
            }

            return sum;
        },
        find_grid_size: function (port) {
            let size = 0;

            while( this.calc_grid_length(size) < port ) {
               size++;
            }

            return size;
        },
        create_grid: function (size) {
            let grid = new Array(this.calc_grid_length(size));

            let x = this.calc_grid_center_x(size);
            let y = this.calc_grid_center_y(size);
            let port = 1; 
            let state = 'start';

            for(let layer = 0; layer <= size; layer++) {
                for(let i = 0; i < this.calc_layer_length(layer); i++) {
                    let index = this.calc_index_from_coords(size, x, y);
                    grid[index] = this.calc_sum_of_adjacent_numbers(grid, size, x, y); // set the calculated sum

                    // if we found are target port, store it's location
                    if (port == this.port) {
                        this.port_loc.x = x;
                        this.port_loc.y = y;
                    }

                    // check to see if we have found the first value larger than our target port
                    if (grid[index] > this.port && 'undefined' === typeof this.first_value_larger_than_port) {
                        this.first_value_larger_than_port = grid[index];
                    }
                   
                    // increment port for next space in spiral grid 
                    port++;

                    // end of our current layer, move out one layer
                    if(i == this.calc_layer_length(layer) - 1) {
                        x++;
                        state = 'start';
                        continue;
                    }

                    switch(state) {
                        case 'start':
                            // start by moving up the right side of the spiral layer
                            state = 'moving_up';
                            y--;
                            break;
                        case 'moving_up':
                            if(y == this.calc_grid_center_y(size) - parseInt(this.calc_grid_row_length(layer) / 2)) {
                                // then move left along the top of the spiral layer, when we reach the top
                                state = 'moving_left';
                                x--;
                            }
                            else {
                                y--;
                            }

                            break;
                        case 'moving_left':
                            if(x == this.calc_grid_center_x(size) - parseInt(this.calc_grid_row_length(layer) / 2)) {
                                // then move down along the left side of the spiral layer, when we reach the left side
                                state = 'moving_down';
                                y++;
                            }
                            else {
                                x--;
                            }
                            break;
                        case 'moving_down':
                            if(y == this.calc_grid_center_y(size) + parseInt(this.calc_grid_row_length(layer) / 2)) {
                                // then move right along the bottom side of the spiral layer, when we reach the bottom side
                                state = 'moving_right';
                                x++;
                            }
                            else {
                                y++;
                            }
                            break;
                        case 'moving_right':
                            // at this point we should be filling out the bottom of the layer until we restart on the next outer layer of the spiral
                            x++;
                            break;
                    } 
                }
            }

            return grid;
        },
        pretty_print_current_grid: function() {
            let pretty_text = '';
            for(let y = 0; y < this.calc_grid_row_length(this.size); y++) {
                let row_text = '';
                for (let x = 0; x < this.calc_grid_row_length(this.size); x++) {
                    let index = this.calc_index_from_coords(this.size, x, y);
                    row_text += '\t\t' + this.grid[index];
                }
                pretty_text += row_text + '\n';
            }
            return pretty_text;
        }
    };

    obj.init();

    return obj;
};

//let theGrid = new SpiralGrid(24);
let theGrid = new SpiralGrid(265149);

console.log('size:', theGrid.size);
console.log('length:', theGrid.grid.length);
console.log('target port:', theGrid.port);
console.log('target port location:', theGrid.port_loc);
console.log('first value larger than target port:', theGrid.first_value_larger_than_port);
console.log('target port distance from center:', theGrid.calc_taxicab_distance_to_center(theGrid.port_loc.x, theGrid.port_loc.y));
//console.log('grid:', theGrid.pretty_print_current_grid());
