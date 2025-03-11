import { BaseScene } from './BaseScene';

export class SceneSelector extends BaseScene {
  constructor() {
    super('SceneSelector');
  }

  preload() {

  }

  create() {
    super.create();
    const { width, height } = this.scale;

    this.add.text(width / 2, height * 0.1, 'Select a Scene', {
      fontSize: '48px',
      color: '#fff',
      strokeThickness: 2
    }).setOrigin(0.5);

    const availableScenes = ['Act1Scene1', 'Act1Scene2', 'Act1Scene3Part1a', 'Act1Scene3', 'Act1Minigame', 'Act1Scene2Minigame', 'Act1Scene3', 'Act1Scene4'];
    let startY = height * 0.25;
    availableScenes.forEach((scene, index) => {
      this.createButton(scene, startY + index * 50, () => this.loadScene(scene));
    });

    this.createButton("Back to Main Menu", height * 0.85, () => this.switchScene('MainMenu'));
  }

  loadScene(sceneKey) {
    this.scene.start(sceneKey, { viewOnly: true });
  }

  createButton(text, y, callback) {
    const button = this.add.text(this.scale.width / 2, y, text, {
      fontSize: "24px",
      fill: "#ffffff",
      backgroundColor: "#333",
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerdown', callback);
    return button;
  }
}
