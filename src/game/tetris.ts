import * as Phaser from 'phaser';
import { DAS, HEIGHT, WIDTH, grid_height, grid_width } from '../constants';
import { Block, BlockType, init_kickI, init_kickJLTSZ, rotations } from './blocks';
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

    empty_grid: number[][];
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer;
    ghost_layer: Phaser.Tilemaps.TilemapLayer;

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
    lines_cleared: number;
    lines_cleared_text: Phaser.GameObjects.Text;


    preload() {
        this.load.image('tileset', 'assets/tileset2.png');
    }

    render_grid() {
        this.map.putTilesAt(this.game_grid.grid.slice(4, HEIGHT + 3), 0, 0, false, this.layer);
        this.map.putTilesAt(this.empty_grid, 0, 0, false, this.ghost_layer);
        for (let i = 0; i < rotations[this.current_block.type][this.current_block.rotation].length; i++) {
            for (let j = 0; j < rotations[this.current_block.type][this.current_block.rotation][i].length; j++) {
                if (rotations[this.current_block.type][this.current_block.rotation][i][j]) {
                    this.map.putTileAt(this.current_block.type + 1, this.current_block.x + j, this.current_block.y + i - 4, false, this.layer);
                    if (this.current_block.y != this.current_block.ghost_y) {
                        this.map.putTileAt(this.current_block.type + 1, this.current_block.x + j, this.current_block.ghost_y + i - 4, false, this.ghost_layer);
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
            if (this.next_blocks[i] == BlockType.I) {
                const empty_row = [0, 0, 0, 0];
                const full_row = [BlockType.I + 1, BlockType.I + 1, BlockType.I + 1, BlockType.I + 1];
                this.next_queue_grid.push(empty_row);
                this.next_queue_grid.push(full_row);
                this.next_queue_grid.push(empty_row);
                continue
            }
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

    render_next_queue() {
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
        this.lines_cleared = 0;
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
        this.empty_grid = [];
        for (let i = 0; i < grid_height; i++) {
            const empty_row = [];
            for (let j = 0; j < grid_width; j++) {
                empty_row.push(-1);
            }
            this.empty_grid.push(empty_row);
        }

        this.init();
        this.map = this.make.tilemap({ width: grid_width, height: grid_height, tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('tileset');
        const background_layer = this.map.createBlankLayer('Background', tileset, 200, 50);
        this.map.putTilesAt(this.game_grid.grid.slice(4, grid_height + 3), 0, 0, false, background_layer);
        this.layer = this.map.createBlankLayer('Minos', tileset, 200, 50);
        this.ghost_layer = this.map.createBlankLayer('Ghost', tileset, 200, 50);
        this.ghost_layer.alpha = 0.5;
        this.layer.scale = 1.5;
        this.ghost_layer.scale = 1.5;
        this.render_grid();
        init_kickI();
        init_kickJLTSZ();
        const grid_center_x = this.layer.x + (this.layer.width * this.layer.scale) / 2;
        const grid_center_y = this.layer.y + (this.layer.height * this.layer.scale) / 3;
        this.lines_cleared_text = this.add.text(grid_center_x, grid_center_y, '40', { font: '100px Courier', color: '#FFFFFF' });
        this.lines_cleared_text.alpha = 0.5;
        this.lines_cleared_text.depth = 5;
        this.lines_cleared_text.setOrigin(0.5, 0.5);

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
            if (this.soft_drop_key.isDown) {
                this.game_grid.soft_drop(this.current_block);
                this.render_grid();
            }
        });
        this.ccw_key.on('down', () => {
            this.rotated_after = true;
            this.game_grid.rotate_ccw(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
            if (this.soft_drop_key.isDown) {
                this.game_grid.soft_drop(this.current_block);
                this.render_grid();
            }
        });

        // left and right
        this.left_key.on('down', () => {
            this.rotated_after = false;
            this.last_pressed = 0;
            this.das_left = DAS;
            this.game_grid.tap_left(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
            if (this.soft_drop_key.isDown) {
                this.game_grid.soft_drop(this.current_block);
                this.render_grid();
            }
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
            if (this.soft_drop_key.isDown) {
                this.game_grid.soft_drop(this.current_block);
                this.render_grid();
            }
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
                this.set_next_queue();
                this.render_next_queue();
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
            if (this.last_pressed) {
                this.das_right = Math.max(this.das_right, -1);
            } else {
                this.das_left = Math.max(this.das_left, -1);
            }
        });

        // drop
        this.soft_drop_key.on('down', () => {
            this.game_grid.soft_drop(this.current_block);
            this.render_grid();
        });
        this.hard_drop_key.on('down', () => {
            this.game_grid.hard_drop(this.current_block);
            this.lines_cleared += this.game_grid.clear_lines();
            this.current_block = new Block(this.next_blocks.shift());
            this.next_blocks.push(this.bag.next());
            this.game_grid.find_ghost(this.current_block);
            this.render_grid();
            this.used_hold = false;
            this.set_next_queue();
            this.render_next_queue();
            if (this.last_pressed) {
                this.das_right = Math.max(this.das_right, -1);
            } else {
                this.das_left = Math.max(this.das_left, -1);
            }
        });

        // reset
        this.reset_key.on('down', () => {
            this.init();
            this.render_grid();
            this.set_next_queue();
            this.render_next_queue();
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
                    if (this.soft_drop_key.isDown) {
                        this.game_grid.soft_drop(this.current_block);
                        this.render_grid();
                    }
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
                    if (this.soft_drop_key.isDown) {
                        this.game_grid.soft_drop(this.current_block);
                        this.render_grid();
                    }
                }
            }
        }
        this.lines_cleared_text.setText(`${40 - this.lines_cleared}`);
        this.prev_time = curr_time;
    }
}
