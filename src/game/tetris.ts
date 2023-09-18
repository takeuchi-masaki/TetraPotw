import * as Phaser from 'phaser';
import { HEIGHT, WIDTH } from '../constants';
import { Block, BlockType } from './blocks';
import { Bag } from './bag';
import Deque from 'collections/deque'
import { Grid } from './grid';

export default class Tetris extends Phaser.Scene {
    left_key: Phaser.Input.Keyboard.Key;
    right_key: Phaser.Input.Keyboard.Key;
    hard_drop_key: Phaser.Input.Keyboard.Key;
    cw_key: Phaser.Input.Keyboard.Key;
    ccw_key: Phaser.Input.Keyboard.Key;
    hold_key: Phaser.Input.Keyboard.Key;

    left_text: Phaser.GameObjects.Text;
    right_text: Phaser.GameObjects.Text;

    grid: Grid;
    bag: Bag;
    current_block: Block;
    hold_block: BlockType;
    next_blocks: Deque<BlockType>;

    create() {
        this.left_key = this.input.keyboard.addKey('LEFT');
        this.right_key = this.input.keyboard.addKey('RIGHT');
        this.hard_drop_key = this.input.keyboard.addKey('C');
        this.cw_key = this.input.keyboard.addKey('E');
        this.ccw_key = this.input.keyboard.addKey('W');
        this.hold_key = this.input.keyboard.addKey('Q');

        this.add.text(10, 10, 'Hold down the LEFT or RIGHT Key', { font: '20px Courier', color: '#000000' });
        this.left_text = this.add.text(10, 35, '', { font: '16px Courier', color: '#000000' });
        this.right_text = this.add.text(10, 55, '', { font: '16px Courier', color: '#000000' });

        const grid: Phaser.GameObjects.Grid = this.add.grid(
            WIDTH / 2 - 100, HEIGHT / 2,
            400, 800, 40, 40,
            0x000000, 1, 0xFFFFFF, 0.5);

        this.grid = new Grid();
        this.bag = new Bag();
        this.current_block = new Block(this.bag.next());
        for (let i = 0; i < 5; i++) {
            this.next_blocks.push(this.bag.next());
        }
        this.hold_block = 0;
    }

    update() {
        this.left_text.setText(`Left Duration: ${this.left_key.getDuration()}ms`);
        this.right_text.setText(`Right Duration: ${this.right_key.getDuration()}ms`);
    }
}
