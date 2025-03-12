import { BaseScene } from './BaseScene';

export class SceneSelector extends BaseScene {
  constructor() {
    super('SceneSelector');
  }

  preload() {
    // No assets needed here
  }

  create() {
    super.create();
    const { width, height } = this.scale;

    this.add.text(width / 2, height * 0.05, 'Select a Scene', {
      fontSize: '48px',
      color: '#fff',
      strokeThickness: 2
    }).setOrigin(0.5);

    const availableScenes = [
      'Act1Scene1','Act1Scene2','Act1Scene3Part1a','Act1Scene3Part1b','Act1Scene3','Act1Scene4',
      'Act1Scene5','Act1Scene6','Act1Scene7','Act2Scene1','Act2Scene2','Act2Scene3',
      'Act2Scene4','Act3Scene1','Act3Scene2','Act3Scene3','Act3Scene4','Act4Scene1',
      'Act4Scene2','Act4Scene3','Act5Scene1','Act5Scene2','Act5Scene3','Act5Scene4',
      'Act5Scene5','Act5Scene6','Act5Scene7','Act5Scene8Part1','Act5Scene8Part2','Act1Minigame','Act1Scene2Minigame'
    ];

    // We'll place them in 2 columns
    const half = Math.ceil(availableScenes.length / 2);
    const leftColumnX = width * 0.33;
    const rightColumnX = width * 0.66;
    const startY = height * 0.15;
    const spacing = 40;

    availableScenes.forEach((scene, index) => {
      // Decide if it's in the first half or the second half
      const inLeftColumn = (index < half);
      const x = inLeftColumn ? leftColumnX : rightColumnX;
      // Row index is either index (for left) or index - half (for right)
      const rowIndex = inLeftColumn ? index : index - half;
      const y = startY + rowIndex * spacing;

      this.createButton(scene, x, y, () => this.loadScene(scene));
    });

    // Add "Back to Main Menu" button at bottom
    this.createButton("Back to Main Menu", width / 2, height * 0.9, () => this.switchScene('MainMenu'));
  }

  loadScene(sceneKey) {
    this.scene.start(sceneKey, { viewOnly: true });
  }

  createButton(text, x, y, callback) {
    const button = this.add.text(x, y, text, {
      fontSize: "20px",
      fill: "#ffffff",
      backgroundColor: "#333",
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerdown', callback);
    return button;
  }
}
