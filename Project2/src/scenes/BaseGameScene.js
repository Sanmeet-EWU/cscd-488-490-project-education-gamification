import { BaseScene } from './BaseScene';
import { saveGameData, loadGameData } from "../../firebase/firebase.js";

export class BaseGameScene extends BaseScene {
    constructor(key = 'BaseGameScene') {
        super(key);
    }

    init(data) {
        if (data.position) {
            this.startingPosition = data.position;
        }
    }

    create() {
        super.create();
        this.createDialogueUI();

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

        // ✅ Create the interaction box
        this.createInteractBox();

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
      if (this.isPaused) return;
      super.update();
  
      // ✅ Restore Player Movement
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
  
      // ✅ Ensure Interaction Logic Still Runs
      this.checkForInteraction();
  }
  
    // ✅ Create a reusable interaction box
    createInteractBox() {
        const { width, height } = this.scale;

        this.interactBox = this.add.rectangle(width / 2, height * 0.2, 200, 80, 0x666666, 0.5)
            .setOrigin(0.5)
            .setInteractive();

        this.interactText = this.add.text(width / 2, height * 0.15, "[E] Start Dialogue", {
            fontSize: "18px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 5, y: 5 }
        }).setOrigin(0.5);
        
        this.interactText.setVisible(false);
        this.physics.add.existing(this.interactBox, true);
    }

    // 🔍 Check if Player is Near the Interaction Box
    checkForInteraction() {
        if (!this.interactBox) return;

        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.interactBox.x, this.interactBox.y
        );

        if (distance < 150) {
            this.interactText.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
                this.startDialogue();
            }
        } else {
            this.interactText.setVisible(false);
        }
    }

    // 🗣 Start Dialogue (Can Be Overridden in Child Scenes)
    startDialogue() {
        console.log("Starting Dialogue...");
        this.interactBox.setVisible(false);
        this.interactText.setVisible(false);
        this.toggleDialogue("Witch2"); // Default to Witch2, can be overridden
    }

    toggleDialogue(npcKey) {
        if (!this.dialogueData || !this.dialogueData[npcKey]) return;

        let npcDialogue = this.dialogueData[npcKey];
        this.dialogueBox.setVisible(true);
        this.dialogueText.setVisible(true);
        this.dialogueText.setText(npcDialogue.intro);
        this.optionTexts.forEach(text => text.destroy());
        this.optionTexts = [];

        if (npcDialogue.responses) {
            this.showDialogueOptions(npcDialogue.responses);
        } else {
            this.time.delayedCall(2000, () => {
                this.endDialogue();
            });
        }
    }

    createDialogueUI() {
        const { width, height } = this.scale;

        this.dialogueBox = this.add.rectangle(
            width / 2, height * 0.8, width * 0.9, height * 0.15, 0x000000, 0.8
        ).setOrigin(0.5).setVisible(false);

        this.dialogueText = this.add.text(
            width * 0.1, height * 0.75, '', {
                fontSize: '20px',
                fill: '#ffffff',
                wordWrap: { width: width * 0.8 }
            }
        ).setVisible(false);

        this.optionTexts = [];
    }

    showDialogueOptions(options) {
        options.forEach((option, index) => {
            const optionText = this.add.text(
                this.dialogueBox.x - this.dialogueBox.width / 2 + 20,
                this.dialogueBox.y - this.dialogueBox.height / 2 + 40 + index * 30,
                option.text,
                { fontSize: '18px', fill: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 } }
            ).setInteractive();

            optionText.on('pointerdown', () => {
                this.handleDialogueOption(option);
            });

            this.optionTexts.push(optionText);
        });
    }

    handleDialogueOption(option) {
        this.dialogueText.setText(option.nextDialogue || "...");
        this.optionTexts.forEach(text => text.destroy());
        this.optionTexts = [];

        this.time.delayedCall(2000, () => {
            this.endDialogue();
        });
    }

    endDialogue() {
        this.dialogueBox.setVisible(false);
        this.dialogueText.setVisible(false);
        this.optionTexts.forEach(text => text.destroy());
        this.optionTexts = [];
    }

    async saveProgress() {
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
            this.pauseButton.setVisible(true);
            this.ignoreNextESC = true;
            this.time.delayedCall(300, () => { this.ignoreNextESC = false; });
        } else {
            this.isPaused = true;
            this.physics.world.pause();
            this.player.setVelocity(0);
            this.scene.launch('PauseMenu', { gameScene: this });
            this.pauseButton.setVisible(false);
        }
    }
    handleInteraction(npcKey) {
      console.log(`Interacting with ${npcKey}`);
  
      if (!this.dialogueData || !this.dialogueData[npcKey]) {
          console.warn(`No dialogue found for NPC: ${npcKey}`);
          return;
      }
  
      this.toggleDialogue(npcKey);
  }
  
}
