import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 468, 32)
      .setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(
      this.scale.width / 2 - 230,
      this.scale.height / 2,
      4, 28,
      0xffffff
    );
    this.load.on('progress', (progress) => {
      bar.width = 4 + (460 * progress);
    });
  }

  preload() {
    this.load.setPath('assets');
    this.load.svg('swordandcrown', 'StartScreen/SwordandCrown.svg', { width: 2000, height: 3400 });
    this.load.svg('raven', 'StartScreen/Raven.svg', { width: 1000, height: 1000 });
    this.load.svg('cloud', 'StartScreen/Cloud.svg', { width: 1500, height: 700 });
    this.load.svg('cloud2', 'StartScreen/Cloud2.svg', { width: 1500, height: 700 });
    this.load.svg('cloud3', 'StartScreen/Cloud3.svg', { width: 1500, height: 700 });
    this.load.svg('cloud4', 'StartScreen/Cloud4.svg', { width: 1500, height: 700 });

    this.load.setPath('assets/audio');
    this.load.audio('testMusic', 'TownTheme.mp3');

    this.load.setPath('assets/ui');
    this.load.image('backButton', 'backButton.png');
    this.load.image('checkedBox', 'checkedBox.png');
    this.load.image('options', 'options.png');
    this.load.image('playButton', 'playButton.png');
    this.load.image('uncheckedBox', 'uncheckedBox.png');
    this.load.image('closeMenuButton', 'closeMenuButton.png');
    this.load.image('settingsMenuButton', 'settingsMenuButton.png');
    this.load.image('toMainMenuButton', 'toMainMenuButton.png');
    this.load.image('saveGameButton', 'saveGameButton.png');
    this.load.image('controlsButton', 'controlsButton.png');

    this.load.on('complete', () => {
      if (this.cache.audio.exists('testMusic')) {
        console.log("testMusic (TownTheme.mp3) loaded successfully");
      } else {
        console.error("testMusic (TownTheme.mp3) failed to load");
      }
    });
    this.load.on('filecomplete-audio-testMusic', () => {
      console.log("Audio file testMusic loaded");
    });
    this.load.on('loaderror', (file) => {
      console.error(`Failed to load file: ${file.key}`, file);
    });
  }

  create() {
    this.scene.start('MainMenu');
  }
}
