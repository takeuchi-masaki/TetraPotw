import * as Phaser from 'phaser';
import { DAS, HEIGHT, WIDTH } from '../constants';
import { Block, BlockType, rotations } from './blocks';
import { Bag } from './bag';
import { Grid } from './grid';

const das_min = -9999;

export default class Tetris extends Phaser.Scene {
    left_key: Phaser.Input.Keyboard.Key;
    right_key: Phaser.Input.Keyboard.Key;
    hard_drop_key: Phaser.Input.Keyboard.Key;
    cw_key: Phaser.Input.Keyboard.Key;
    ccw_key: Phaser.Input.Keyboard.Key;
    hold_key: Phaser.Input.Keyboard.Key;
    last_pressed: number;
    das_left: number;
    das_right: number;

    game_grid: Grid;
    bag: Bag;
    current_block: Block;
    hold_block: BlockType;
    next_blocks: BlockType[];
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer;

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
    }

    create() {
        this.left_key = this.input.keyboard.addKey('LEFT');
        this.right_key = this.input.keyboard.addKey('RIGHT');
        this.hard_drop_key = this.input.keyboard.addKey('SPACE');
        this.cw_key = this.input.keyboard.addKey('E');
        this.ccw_key = this.input.keyboard.addKey('W');
        this.hold_key = this.input.keyboard.addKey('Q');

        this.game_grid = new Grid();
        this.bag = new Bag();
        this.current_block = new Block(this.bag.next());
        this.next_blocks = [];
        for (let i = 0; i < 5; i++) {
            this.next_blocks.push(this.bag.next());
        }
        this.hold_block = 0;

        this.map = this.make.tilemap({
            data: this.game_grid.grid.slice(4, HEIGHT + 3),
            tileWidth: 32,
            tileHeight: 32,
        });
        const tileset = this.map.addTilesetImage('tileset');
        this.layer = this.map.createLayer(0, tileset, 0, 0);
        this.layer.setScale(1.5);

        this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);

        this.cw_key.on('down', () => {
            this.game_grid.rotate_cw(this.current_block);
            this.map.putTilesAt(this.game_grid.grid.slice(4, 10), 0, 0, false, this.layer);
            this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);
        });
        this.ccw_key.on('down', () => {
            this.game_grid.rotate_ccw(this.current_block);
            this.map.putTilesAt(this.game_grid.grid.slice(4, 10), 0, 0, false, this.layer);
            this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);
        });
        this.left_key.on('down', () => {
            // this.last_pressed = 0;
            this.game_grid.tap_left(this.current_block);
            this.das_left = DAS;
            this.map.putTilesAt(this.game_grid.grid.slice(4, 10), 0, 0, false, this.layer);
            this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);
        });
        this.left_key.on('up', () => {
            this.das_left = DAS;
        });
        this.right_key.on('down', () => {
            // this.last_pressed = 1;
            this.game_grid.tap_right(this.current_block);
            this.das_right = DAS;
            this.map.putTilesAt(this.game_grid.grid.slice(4, 10), 0, 0, false, this.layer);
            this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);
        });
        this.right_key.on('up', () => {
            this.das_right = DAS;
        });
        // this.hold_key.on('down', () => {
        //     if (this.hold_block == 0) {
        //         this.hold_block = this.current_block.type;
        //         this.current_block = new Block(this.next_blocks.shift());
        //         this.next_blocks.push(this.bag.next());
        //     } else {
        //         const tmp = this.current_block.type;
        //         this.current_block = new Block(this.hold_block);
        //         this.hold_block = tmp;
        //     }
        //     this.map.putTilesAt(this.game_grid.grid.slice(4, 8), 0, 0, false, this.layer);
        //     this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);
        // });
        this.hard_drop_key.on('down', () => {
            this.game_grid.hard_drop(this.current_block);
            this.map.putTilesAt(this.game_grid.grid.slice(4, HEIGHT + 3), 0, 0, false, this.layer);
            this.current_block = new Block(this.next_blocks.shift());
            this.next_blocks.push(this.bag.next());
            this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);
        });
        this.hard_drop_key.on('up', () => {
            // do nothing
        });
    }

    update(delta: number) {
        // if (this.last_pressed) {
        //     this.das_right -= delta;
        //     if (this.das_right < 0
        //         && this.das_right > das_min) {
        //         this.das_right = das_min;
        //         this.game_grid.hard_right(this.current_block);
        //         this.map.putTilesAt(this.game_grid.grid.slice(4, 8), 0, 0, false, this.layer);
        //         this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);
        //     }
        // } else {
        //     this.das_left -= delta;
        //     if (this.das_left < 0
        //         && this.das_left > das_min) {
        //         this.das_left = das_min;
        //         this.game_grid.hard_left(this.current_block);
        //         this.map.putTilesAt(this.game_grid.grid.slice(4, 8), 0, 0, false, this.layer);
        //         this.map.putTilesAt(rotations[this.current_block.type][this.current_block.rotation], this.current_block.x, this.current_block.y, false, this.layer);
        //     }
        // }
    }
}
