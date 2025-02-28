import { Scene } from 'phaser';

export class BaseScene extends Scene {
  constructor(key) {
    super(key);
    this.sceneKey = key;
  }

  create() {
    this.scale.on('resize', this.handleResize, this);
    this.events.on('shutdown', () => this.scale.off('resize', this.handleResize, this));
  }

  switchScene(targetScene) {
    if (!this.scene.get(targetScene)) {
      console.error(`Scene "${targetScene}" does not exist!`);
      return;
    }
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop(this.scene.key);
      this.scene.start(targetScene);
    });
  }

  handleResize(gameSize) {
    if (!this.scene.isActive(this.sceneKey)) return;
    const newWidth = gameSize.width;
    const newHeight = gameSize.height;
    if (this.cameras?.main) {
      this.cameras.main.setSize(newWidth, newHeight);
    }
    if (this.repositionUI) {
      this.repositionUI({ width: newWidth, height: newHeight });
    }
  }

  fitToScreen(image, scaleFactor) {
    if (!image?.texture || image.width === 0 || image.height === 0) return;
    let baseScale = Math.min(this.scale.width, this.scale.height) * scaleFactor / 1000;
    image.setScale(baseScale);
  }

  createButton(text, positionFactor, callback) {
    const button = this.add.text(
      this.scale.width * 0.5,
      this.scale.height * positionFactor,
      text,
      {
        fontFamily: 'Inknut Antiqua',
        fontSize: `${Math.floor(this.scale.height * 0.05)}px`,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
      }
    ).setOrigin(0.5).setInteractive();

    button.on('pointerover', () => button.setColor('#ff0'));
    button.on('pointerout', () => button.setColor('#fff'));
    button.on('pointerdown', callback);
    return button;
  }

  repositionUI({ width, height }) {
    console.warn(`${this.sceneKey} has not implemented repositionUI`);
  }
}
