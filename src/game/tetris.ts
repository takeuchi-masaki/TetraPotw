import * as Phaser from 'phaser';
import { DAS, HEIGHT, WIDTH } from '../constants';
import { Block, BlockType, rotations } from './blocks';
import { Bag } from './bag';
import { Grid } from './grid';

const das_min = -9999;

export default class Tetris extends Phaser.Scene {
    left_key: Phaser.Input.Keyboard.Key;
    right_key: Phaser.Input.Keyboard.Key;
    soft_drop_key: Phaser.Input.Keyboard.Key;
    hard_drop_key: Phaser.Input.Keyboard.Key;
    cw_key: Phaser.Input.Keyboard.Key;
    ccw_key: Phaser.Input.Keyboard.Key;
    hold_key: Phaser.Input.Keyboard.Key;
    reset_key: Phaser.Input.Keyboard.Key;

    game_grid: Grid;
    bag: Bag;
    current_block: Block;

    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer;

    next_blocks: BlockType[];
    next_queue: Phaser.Tilemaps.Tilemap;
    next_queue_grid: number[][];
    next_layer: Phaser.Tilemaps.TilemapLayer;

    hold_block: BlockType;
    hold_map: Phaser.Tilemaps.Tilemap;
    hold_layer: Phaser.Tilemaps.TilemapLayer;
    hold_grid: number[][];

    used_hold: boolean;
    last_pressed: number;
    das_left: number;
    das_right: number;
    prev_time: number;
    rotated_after: boolean;


    preload() {
        this.load.image('tileset', 'assets/tileset2.png');
    }

    render_grid() {
        this.map.putTilesAt(this.game_grid.grid.slice(4, HEIGHT + 3), 0, 0, false, this.layer);
        for (let i = 0; i < rotations[this.current_block.type][this.current_block.rotation].length; i++) {
            for (let j = 0; j < rotations[this.current_block.type][this.current_block.rotation][i].length; j++) {
                if (rotations[this.current_block.type][this.current_block.rotation][i][j]) {
                    this.map.putTileAt(this.current_block.type + 1, this.current_block.x + j, this.current_block.y + i - 4, false, this.layer);
                    if (this.current_block.y != this.current_block.ghost_y) {
                        this.map.putTileAt(1, this.current_block.x + j, this.current_block.ghost_y + i - 4, false, this.layer);
                    }
                }
            }
        }
    };

    set_hold_grid() {
        this.hold_grid = [];
        if (this.hold_block == 0) {
            for (let i = 0; i < 4; i++) {
                const empty_row = [0, 0, 0, 0];
                this.hold_grid.push(empty_row);
            }
        } else {
            if (this.hold_block == BlockType.O) {
                const empty_row = [0, 0, 0, 0];
                this.hold_grid.push(empty_row);
            }
            for (let i = 0; i < rotations[this.hold_block][0].length; i++) {
                this.hold_grid.push(rotations[this.hold_block][0][i]);
                while (this.hold_grid[this.hold_grid.length - 1].length < 4) {
                    this.hold_grid[this.hold_grid.length - 1].push(0);
                }
            }
            if (this.hold_block == BlockType.O) {
                const empty_row = [0, 0, 0, 0];
                this.hold_grid.push(empty_row);
            }
        }
    }

    render_hold() {
        this.hold_map.putTilesAt(this.hold_grid, 0, 0, false, this.hold_layer);
    }

    set_next_queue() {
        this.next_queue_grid = [];
        for (let i = 0; i < 5; i++) {
            if (this.next_blocks[i] == BlockType.O) {
                const empty_row = [0, 0, 0, 0];
                this.next_queue_grid.push(empty_row);
            }
            for (let j = 0; j < rotations[this.next_blocks[i]][0].length; j++) {
                this.next_queue_grid.push(rotations[this.next_blocks[i]][0][j]);
                while (this.next_queue_grid[this.next_queue_grid.length - 1].length < 4) {
                    this.next_queue_grid[this.next_queue_grid.length - 1].push(0);
                }
            }
            if (this.next_blocks[i] == BlockType.O) {
                const empty_row = [0, 0, 0, 0];
                this.next_queue_grid.push(empty_row);
            }
        }
    }

    render_next() {
        this.next_queue.putTilesAt(this.next_queue_grid, 0, 0, false, this.next_layer);
    }

    init() {
        this.game_grid = new Grid();
        this.bag = new Bag();
        this.current_block = new Block(this.bag.next());
        this.next_blocks = [];
        for (let i = 0; i < 5; i++) {
            this.next_blocks.push(this.bag.next());
        }
        this.hold_block = 0;
        this.used_hold = false;
        this.rotated_after = false;
        this.game_grid.find_ghost(this.current_block);
        this.prev_time = -1;
    }

    create() {
        this.left_key = this.input.keyboard.addKey('LEFT');
        this.right_key = this.input.keyboard.addKey('RIGHT');
        this.soft_drop_key = this.input.keyboard.addKey('DOWN');
        this.hard_drop_key = this.input.keyboard.addKey('SPACE');
        this.cw_key = this.input.keyboard.addKey('E');
        this.ccw_key = this.input.keyboard.addKey('W');
        this.hold_key = this.input.keyboard.addKey('Q');
        this.reset_key = this.input.keyboard.addKey('R');

        // game grid
        this.map = this.make.tilemap({
            data: this.game_grid.grid.slice(4, HEIGHT + 3),
            tileWidth: 32,
            tileHeight: 32,
        });
        const tileset = this.map.addTilesetImage('tileset');
        this.layer = this.map.createLayer(0, tileset, 200, 50);
        this.layer.setScale(1.3);
        this.init();
        this.render_grid();

        // next queue
        this.set_next_queue();
        this.next_queue = this.make.tilemap({
            data: this.next_queue_grid,
            tileWidth: 32,
            tileHeight: 32,
        });
        const next_tileset = this.next_queue.addTilesetImage('tileset');
        this.next_layer = this.next_queue.createLayer(0, next_tileset, 800, 50);

        // hold
        this.set_hold_grid();
        this.hold_map = this.make.tilemap({
            data: this.hold_grid,
            tileWidth: 32,
            tileHeight: 32,
        });
        const hold_tileset = this.hold_map.addTilesetImage('tileset');
        this.hold_layer = this.hold_map.createLayer(0, hold_tileset, 50, 50);
        this.render_hold();

        // rotation
        this.cw_key.on('down', () => {
            this.rotated_after = true;
            this.game_grid.rotate_cw(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
        });
        this.ccw_key.on('down', () => {
            this.rotated_after = true;
            this.game_grid.rotate_ccw(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
        });

        // left and right
        this.left_key.on('down', () => {
            this.rotated_after = false;
            this.last_pressed = 0;
            this.das_left = DAS;
            this.game_grid.tap_left(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
        });
        this.left_key.on('up', () => {
            this.das_left = DAS;
        });
        this.right_key.on('down', () => {
            this.rotated_after = false;
            this.last_pressed = 1;
            this.das_right = DAS;
            this.game_grid.tap_right(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
        });
        this.right_key.on('up', () => {
            this.das_right = DAS;
        });

        // hold
        this.hold_key.on('down', () => {
            if (this.used_hold) {
                return;
            }
            if (this.hold_block == 0) {
                this.hold_block = this.current_block.type;
                this.current_block = new Block(this.next_blocks.shift());
                this.next_blocks.push(this.bag.next());
            } else {
                const next_hold_type = this.current_block.type;
                this.current_block = new Block(this.hold_block);
                this.hold_block = next_hold_type;
            }
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
            this.used_hold = true;
            this.set_hold_grid();
            this.render_hold();
        });

        // drop
        this.soft_drop_key.on('down', () => {
            this.game_grid.soft_drop(this.current_block);
            this.render_grid();
        });
        this.hard_drop_key.on('down', () => {
            this.game_grid.hard_drop(this.current_block);
            this.current_block = new Block(this.next_blocks.shift());
            this.next_blocks.push(this.bag.next());
            this.game_grid.clear_lines();
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
            this.used_hold = false;
            this.set_next_queue();
            this.render_next();
        });

        // reset
        this.reset_key.on('down', () => {
            this.init();
            this.render_grid();
            this.set_next_queue();
            this.render_next();
            this.set_hold_grid();
            this.render_hold();
        });
    }

    update(curr_time: number) {
        var delta = 0;
        if (this.prev_time != -1) {
            delta = curr_time - this.prev_time;
        }
        if (this.last_pressed) {
            if (this.right_key.isDown) {
                this.das_right -= delta;
                if (this.das_right < 0
                    && (this.rotated_after || this.das_right > das_min)
                ) {
                    this.rotated_after = false;
                    this.das_right = das_min;
                    this.game_grid.hard_right(this.current_block);
                    this.game_grid.find_ghost(this.current_block);
                    this.render_grid();
                }
            }
        } else {
            if (this.left_key.isDown) {
                this.das_left -= delta;
                if (this.das_left < 0
                    && (this.rotated_after || this.das_left > das_min)
                ) {
                    this.rotated_after = false;
                    this.das_left = das_min;
                    this.game_grid.hard_left(this.current_block);
                    this.game_grid.find_ghost(this.current_block);
                    this.render_grid();
                }
            }
        }
        this.prev_time = curr_time;
    }
}
