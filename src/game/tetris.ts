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
    hold_block: BlockType;
    next_blocks: Block[];
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer;
    next_queue: Phaser.Tilemaps.Tilemap;
    next_queue_grid: number[][];

    used_hold: boolean;
    last_pressed: number;
    das_left: number;
    das_right: number;
    prev_time: number;


    preload() {
        this.load.image('tileset', 'assets/tileset2.png');
    }

    render_all() {
        this.map.putTilesAt(this.game_grid.grid.slice(4, HEIGHT + 3), 0, 0, false, this.layer);
        for (let i = 0; i < rotations[this.current_block.type][this.current_block.rotation].length; i++) {
            for (let j = 0; j < rotations[this.current_block.type][this.current_block.rotation][i].length; j++) {
                if (rotations[this.current_block.type][this.current_block.rotation][i][j]) {
                    this.map.putTileAt(this.current_block.type + 1, this.current_block.x + j, this.current_block.y + i - 4, false, this.layer);
                    this.map.putTileAt(1, this.current_block.x + j, this.current_block.ghost_y + i - 4, false, this.layer);
                }
            }
        }
    };

    init() {
        this.game_grid = new Grid();
        this.bag = new Bag();
        this.current_block = new Block(this.bag.next());
        this.next_blocks = [];
        for (let i = 0; i < 5; i++) {
            this.next_blocks.push(new Block(this.bag.next()));
        }
        this.hold_block = 0;
        this.used_hold = false;
        this.game_grid.find_ghost(this.current_block);
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

        this.map = this.make.tilemap({
            data: this.game_grid.grid.slice(4, HEIGHT + 3),
            tileWidth: 32,
            tileHeight: 32,
        });
        const tileset = this.map.addTilesetImage('tileset');
        this.layer = this.map.createLayer(0, tileset, 50, 50);
        this.layer.setScale(1.3);
        this.init();
        this.render_all();

        // rotation
        this.cw_key.on('down', () => {
            this.game_grid.rotate_cw(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_all();
        });
        this.ccw_key.on('down', () => {
            this.game_grid.rotate_ccw(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_all();
        });

        // left and right
        this.left_key.on('down', () => {
            this.last_pressed = 0;
            this.das_left = DAS;
            this.game_grid.tap_left(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_all();
        });
        this.left_key.on('up', () => {
            this.das_left = DAS;
        });
        this.right_key.on('down', () => {
            this.last_pressed = 1;
            this.das_right = DAS;
            this.game_grid.tap_right(this.current_block);
            this.game_grid.find_ghost(this.current_block);
            this.render_all();
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
                this.current_block = this.next_blocks.shift();
                this.next_blocks.push(new Block(this.bag.next()));
            } else {
                const next_hold_type = this.current_block.type;
                this.current_block = new Block(this.hold_block);
                this.hold_block = next_hold_type;
            }
            this.game_grid.find_ghost(this.current_block);
            this.render_all();
            this.used_hold = true;
        });

        // drop
        this.soft_drop_key.on('down', () => {
            this.game_grid.soft_drop(this.current_block);
            this.render_all();
        });
        this.hard_drop_key.on('down', () => {
            this.game_grid.hard_drop(this.current_block);
            this.current_block = this.next_blocks.shift();
            this.next_blocks.push(new Block(this.bag.next()));
            this.game_grid.find_ghost(this.current_block);
            this.render_all();
            this.used_hold = false;
        });

        // reset
        this.reset_key.on('down', () => {
            this.init();
            this.render_all();
        });
    }

    update(curr_time: number) {
        const delta = curr_time - this.prev_time;
        if (this.last_pressed) {
            if (this.right_key.isDown) {
                this.das_right -= delta;
                if (this.das_right < 0
                    && this.das_right > das_min) {
                    this.das_right = das_min;
                    this.game_grid.hard_right(this.current_block);
                    this.game_grid.find_ghost(this.current_block);
                    this.render_all();
                }
            }
        } else {
            if (this.left_key.isDown) {
                this.das_left -= delta;
                if (this.das_left < 0
                    && this.das_left > das_min) {
                    this.das_left = das_min;
                    this.game_grid.hard_left(this.current_block);
                    this.game_grid.find_ghost(this.current_block);
                    this.render_all();
                }
            }
        }
        this.prev_time = curr_time;
    }
}
