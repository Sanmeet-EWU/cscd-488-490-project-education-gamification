import { BaseScene } from './BaseScene';
import { saveGameData, loadGameData } from "../../firebase/firebase.js";
import { DialogueManager } from '../DialogueManager.js';
export class BaseGameScene extends BaseScene {
    constructor(key = 'BaseGameScene') {
        super(key);
    }

    init(data) {
        this.viewOnly = data?.viewOnly || false;
        if (data.position) {
            this.startingPosition = data.position;
        }
    }

    create() {
        super.create();

        // Ensure the keyboard captures ESC
        this.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.ESC]);

        // Force the game canvas to have focus
        if (this.game.canvas) {
            this.game.canvas.focus();
        }

        // Setup keyboard inputs: WASD for movement, E for interact
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            interact: Phaser.Input.Keyboard.KeyCodes.E,
            pause: Phaser.Input.Keyboard.KeyCodes.ESC
        });

        // Create the player
        this.player = this.physics.add.sprite(
            this.startingPosition ? this.startingPosition.x : 100,
            this.startingPosition ? this.startingPosition.y : 100,
            "player"
        );
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);

        // Create NPCs
        this.npcs = {
            "Witch2": this.add.sprite(500, 300, "witch2").setInteractive(),
            "Witch3": this.add.sprite(700, 300, "witch3").setInteractive()
        };

        Object.keys(this.npcs).forEach(npcKey => {
            this.npcs[npcKey].on("pointerdown", () => {
                this.handleInteraction(npcKey);
            });
        });

        // Flag to indicate whether the game is paused
        this.isPaused = false;
    }

    update(time, delta) {
      super.update();
      
      if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
        this.togglePause();
        return; 
    }
      const speed = 500;
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
  }
  
  

  async saveProgress() {
    if (this.viewOnly) {
        console.log("Save disabled in viewOnly mode.");
        return;
    }

    const saveData = {
        scene: this.scene.key,
        position: { x: this.player.x, y: this.player.y },
        score: this.score || 0,
        inventory: this.inventory || []
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

  togglePause() {
    if (this.ignoreNextESC) return;

    if (this.isPaused) {
        this.isPaused = false;
        this.physics.world.resume();
        this.scene.stop('PauseMenu'); 

        this.ignoreNextESC = true;
        this.time.delayedCall(300, () => { this.ignoreNextESC = false; });
    } else {
        this.isPaused = true;
        this.physics.world.pause();
        this.player.setVelocity(0);
        this.scene.launch('PauseMenu', { gameScene: this });  
    }
}



}
