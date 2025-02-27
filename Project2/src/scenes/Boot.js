import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('pauseButton', 'assets/ui/options.png');
    }

    create() {
        this.scene.start('Preloader');
    }
}