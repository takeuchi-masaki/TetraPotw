import * as Phaser from 'phaser';
import { HEIGHT, WIDTH } from './constants';
import Tetris from './game/tetris';
// import Settings from './scenes/settings';
// import Test from './scenes/test';

const config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent: 'game',
    backgroundColor: '#FFFFFF',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: Tetris
};

const game = new Phaser.Game(config);
