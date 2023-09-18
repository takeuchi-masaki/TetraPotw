import * as Phaser from 'phaser';

export default class Test extends Phaser.Scene {
    left_text: Phaser.GameObjects.Text;
    right_text: Phaser.GameObjects.Text;
    left_key: Phaser.Input.Keyboard.Key;
    right_key: Phaser.Input.Keyboard.Key;

    create() {
        this.left_key = this.input.keyboard.addKey('LEFT');
        this.right_key = this.input.keyboard.addKey('RIGHT');

        this.add.text(10, 10, 'Hold down the LEFT or RIGHT Key', { font: '20px Courier', color: '#000000' });

        this.left_text = this.add.text(10, 40, '', { font: '16px Courier', color: '#000000' });
        this.right_text = this.add.text(10, 60, '', { font: '16px Courier', color: '#000000' });
    }

    update() {
        this.left_text.setText(`Left Duration: ${this.left_key.getDuration()}ms`);
        this.right_text.setText(`Right Duration: ${this.right_key.getDuration()}ms`);
    }
}
