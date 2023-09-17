import * as Phaser from 'phaser';

export default class Tetris extends Phaser.Scene
{
    preload ()
    {
        
    }

    create ()
    {

    }

    update ()
    {

    }
}

const config = {
    type: Phaser.AUTO,
    width: 700,
    height: 1080,
    parent: 'game',
    backgroundColor: 0,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: Tetris
};

const game = new Phaser.Game(config);
