import { BaseScene } from './BaseScene';
import { saveGameData, loadGameData } from "../../firebase/firebase.js";
export class BaseGameScene extends BaseScene {
  constructor(key = 'BaseGameScene') {
    super(key);
  }
  init(data) {
    // If loading a save, set the player's position
    if (data.position) {
        this.startingPosition = data.position;
    }
}
  create() {
    // Call BaseScene's create to set up common functionality.
    super.create();

    // Ensure that the keyboard captures ESC so it isn’t handled by the browser.
    this.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.ESC]);

    // Force the game canvas to have focus so that keyboard events (like ESC) are detected.
    if (this.game.canvas) {
      this.game.canvas.focus();
    }

    // Setup keyboard inputs: WASD for movement, E for interact, and ESC for pause.
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    // Create a player sprite with arcade physics.
    this.player = this.physics.add.sprite(
      this.startingPosition ? this.startingPosition.x : 100,
      this.startingPosition ? this.startingPosition.y : 100,
      "player"
  );
  this.player.setCollideWorldBounds(true);

  this.cameras.main.startFollow(this.player);
    // Set the camera to follow the player.
    this.cameras.main.startFollow(this.player);

    // --- Create a Persistent Pause Button in the Top Right ---
    const { width, height } = this.scale;
    const pauseButtonX = width * 0.95;
    const pauseButtonY = height * 0.05;
    this.pauseButton = this.add.image(pauseButtonX, pauseButtonY, 'pauseButton')
      .setInteractive()
      .setScrollFactor(0);
    this.pauseButton.setScale(width / 1920 * 0.8);
    this.pauseButton.on('pointerdown', () => {
      this.togglePause();
    });
    this.pauseButton.on('pointerover', () => {
      this.pauseButton.setScale(width / 1920 * 0.8 * 1.1);
    });
    this.pauseButton.on('pointerout', () => {
      this.pauseButton.setScale(width / 1920 * 0.8);
    });

    // Flag to indicate whether the game is paused.
    this.isPaused = false;
  }

  update(time, delta) {
    if (this.isPaused) {
      return;
    }

    // Handle player movement.
    const speed = 200;
    let vx = 0, vy = 0;
    if (this.keys.left.isDown) {
      vx = -speed;
    } else if (this.keys.right.isDown) {
      vx = speed;
    }
    if (this.keys.up.isDown) {
      vy = -speed;
    } else if (this.keys.down.isDown) {
      vy = speed;
    }
    this.player.setVelocity(vx, vy);

    // Handle interaction.
    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      this.handleInteraction();
    }

    // Toggle pause if ESC is pressed.
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
    }
  }

  handleInteraction() {
    console.log("Interaction triggered!");
    // Additional interaction logic here.
  }
  async saveProgress() {
    const saveData = {
        scene: this.scene.key,  // Save the current scene key
        position: { x: this.player.x, y: this.player.y },  // Save player position
        score: this.score || 0,  // Save score (if exists)
        inventory: this.inventory || [],  // Save inventory (if exists)
    };

    const success = await saveGameData(saveData);
    if (success) {
        console.log("Game saved successfully.");
    } else {
        console.error("Failed to save game.");
    }
}

async loadProgress() {
    const saveData = await loadGameData();
    if (saveData) {
        this.scene.start(saveData.scene, { position: saveData.position });
        console.log("Game loaded successfully:", saveData);
    } else {
        console.error("No saved game found.");
    }
}

  // togglePause() launches or stops the PauseMenu scene.
  togglePause() {
    if (this.ignoreNextESC) return;
    if (this.isPaused) {
      // Unpause the game.
      this.isPaused = false;
      this.physics.world.resume();
      this.scene.stop('PauseMenu');
      this.pauseButton.setVisible(true);
      // Ignore the next ESC for 300ms.
      this.ignoreNextESC = true;
      this.time.delayedCall(300, () => { this.ignoreNextESC = false; });
    } else {
      // Pause the game.
      this.isPaused = true;
      this.physics.world.pause();
      this.player.setVelocity(0);
      this.scene.launch('PauseMenu', { gameScene: this });
      this.pauseButton.setVisible(false);
    }
  }
  
}
