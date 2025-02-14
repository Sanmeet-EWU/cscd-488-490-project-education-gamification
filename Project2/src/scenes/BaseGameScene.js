import { BaseScene } from './BaseScene';
import { saveGameData, loadGameData } from "../../firebase/firebase.js";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
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

        // Create the interaction box
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
      if (this.isPaused || this.isDialogueVisible) return; // Prevents movement while dialogue is open
      super.update();
      
      if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
        this.togglePause();
        return;  // ✅ Prevents movement/pause conflicts
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
      this.checkForInteraction();
  }
  
  
    // Create a reusable interaction box
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

    // Check if Player is Near the Interaction Box
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

    // Start Dialogue (Can Be Overridden in Child Scenes)
    startDialogue() {
      if (this.isDialogueVisible) return; // Prevents multiple "E" presses from restarting the dialogue
      this.interactBox.setVisible(false);
      this.interactText.setVisible(false);
      this.isDialogueVisible = true; // Now the game knows dialogue is open
  }
  
  toggleDialogue(npcKey) {
    if (!this.dialogueData || !this.dialogueData[npcKey]) {
        console.warn(`No dialogue found for NPC: ${npcKey}`);
        return;
    }

    let npcDialogue = this.dialogueData[npcKey];
    console.log(`Loaded dialogue for ${npcKey}:`, npcDialogue);

    this.dialogueBox.setVisible(true);
    this.dialogueBox.start(npcDialogue.intro, 50);

    if (npcDialogue.responses && Array.isArray(npcDialogue.responses)) {
        console.log(`Showing responses for ${npcKey}:`, npcDialogue.responses);
        this.showDialogueOptions(npcDialogue.responses);
    } else {
        console.warn(`No valid responses for NPC: ${npcKey}`);
    }
}


  

createDialogueUI() {
  const { width, height } = this.scale;

  this.dialogueBox = this.rexUI.add.textBox({
      x: width / 2,
      y: height * 0.75,
      width: width * 0.8,
      height: 150,

      background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, 0x4e342e)
          .setDepth(10),

      text: this.rexUI.add.BBCodeText(0, 0, '', {
          fixedWidth: width * 0.75,
          fixedHeight: 120,
          fontSize: '20px',
          wrap: {
              mode: 'word',
              width: width * 0.75
          }
      }).setDepth(10),

      action: this.rexUI.add.aioSpinner({
          width: 30, height: 30,
          duration: 1000,
          animationMode: 'ball'
      }).setVisible(false),

      space: { left: 20, right: 20, top: 20, bottom: 20, text: 10 }
  })
  .setOrigin(0.5)
  .setDepth(10)
  .layout();

  this.dialogueBox.setVisible(false);

  // Ensure `this.optionTexts` is initialized
  this.optionTexts = [];
}


showDialogueOptions(options) {
  if (!options || !Array.isArray(options)) {
      console.warn("No dialogue options available.", options);
      return;
  }

  // Ensure `this.optionTexts` is initialized before calling `.forEach()`
  if (!this.optionTexts) {
      this.optionTexts = [];
  }

  this.optionTexts.forEach(text => text.destroy());
  this.optionTexts = [];

  options.forEach((option, index) => {
      console.log("Creating option:", option.text);

      const optionText = this.add.text(
          this.dialogueBox.x - this.dialogueBox.width / 2 + 20,
          this.dialogueBox.y + 50 + index * 30,
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
  this.dialogueBox.start(option.nextDialogue || "...", 50);

  this.optionTexts.forEach(text => text.destroy());
  this.optionTexts = [];

  if (!option.nextDialogue) {
      this.time.delayedCall(2000, () => {
          this.endDialogue();
      });
  }
}

  
endDialogue() {
  this.dialogueBox.setVisible(false);
  this.isDialogueVisible = false; // Re-enable movement
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

        this.ignoreNextESC = true;
        this.time.delayedCall(300, () => { this.ignoreNextESC = false; });
    } else {
        this.isPaused = true;
        this.physics.world.pause();
        this.player.setVelocity(0);
        this.scene.launch('PauseMenu', { gameScene: this });  
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
