import { BaseGameScene } from './BaseGameScene';

export class Act1Scene1 extends BaseGameScene {
  constructor() {
    super('Act1Scene1');
  }

  preload() {
    // Load the SVG background.
    this.load.svg('background', 'assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
  }

  create(data) {
    const { width, height } = this.scale;

    // --- Add a Full-Screen White Background ---
    this.whiteBg = this.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0, 0);

    // --- Add and Configure the SVG Background ---
    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.background.setDisplaySize(width, height);

    // Set physics world and camera bounds.
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    this.scale.on('resize', (gameSize) => {
      const newWidth = gameSize.width;
      const newHeight = gameSize.height;
      this.whiteBg.setSize(newWidth, newHeight);
      this.background.setDisplaySize(newWidth, newHeight);
      this.physics.world.setBounds(0, 0, newWidth, newHeight);
      this.cameras.main.setBounds(0, 0, newWidth, newHeight);
    });

    // Call BaseGameScene's create (sets up pause functionality, player, etc.)
    super.create();
    const startX = data.position ? data.position.x : 100;
    const startY = data.position ? data.position.y : 100;
    // --- Override the Default Player ---
    if (this.player) {
      this.player.destroy();
    }
      this.player = this.physics.add.sprite(startX, startY, null)
      .setDisplaySize(100, 100)
      .setOrigin(0.5);
  this.player.body.setCollideWorldBounds(true);
  this.cameras.main.startFollow(this.player);

    // --- Scene-Specific Elements ---
    this.box2 = this.add.rectangle(600, 300, 100, 100, 0x666666);
    this.physics.add.existing(this.box2, true);
    const graphics = this.add.graphics({ fillStyle: { color: 0x666666 } });
    graphics.fillRect(this.box2.x - 50, this.box2.y - 50, 100, 100);

    this.dialogueBox = this.add.rectangle(512, 700, 800, 100, 0x000000)
      .setAlpha(0.8)
      .setVisible(false);
    this.dialogueText = this.add.text(120, 670, "", {
      fontSize: "20px",
      fill: "#ffffff",
      wordWrap: { width: 760 }
    }).setVisible(false);

    this.interactText = this.add.text(512, 650, "Press E to interact", {
      fontSize: "18px",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setVisible(false);

    // Dialogue setup.
    this.isDialogueVisible = false;
    this.currentDialogueIndex = 0;
    this.dialogue = [
      "When shall we three meet again In thunder, lightning, or in rain?",
      "When the hurlyburly's done, When the battle's lost and won.",
      "That will be ere the set of sun."
    ];
    this.dialogueOptions = [
      "Where the place?",
      "I come, graymalkin!"
    ];
    this.optionTexts = [];
    this.dialogueCompleted = false;
    this.canProgressDialogue = false;
  }

  update(time, delta) {
    // Call BaseGameScene's update to ensure pause toggling is handled.
    super.update(time, delta);

    // Scene-specific update code for movement and dialogue.
    if (this.isDialogueVisible) {
      this.player.body.setVelocity(0);
    } else {
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
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      if (this.isDialogueVisible) {
        this.advanceDialogue();
      } else {
        const distance = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.box2.x, this.box2.y
        );
        if (distance < 150) {
          this.toggleDialogue();
        }
      }
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.box2.x, this.box2.y
    );
    this.interactText.setVisible(distance < 150 && !this.isDialogueVisible);
  }

  // ------------------ Dialogue Methods ------------------

  toggleDialogue() {
    if (this.dialogueCompleted) return;
    this.isDialogueVisible = true;
    this.dialogueBox.setVisible(true);
    this.dialogueText.setVisible(true);
    this.currentDialogueIndex = 0;
    this.dialogueText.setText(this.dialogue[this.currentDialogueIndex]);
    this.canProgressDialogue = true;
  }

  advanceDialogue() {
    if (!this.canProgressDialogue) return;
    this.canProgressDialogue = false;
    this.currentDialogueIndex++;
    if (this.currentDialogueIndex < this.dialogue.length) {
      this.dialogueText.setText(this.dialogue[this.currentDialogueIndex]);
      this.time.delayedCall(500, () => {
        this.canProgressDialogue = true;
      });
    } else if (this.currentDialogueIndex === this.dialogue.length) {
      this.showDialogueOptions();
    }
  }

  showDialogueOptions() {
    this.dialogueText.setText("Choose an option:");
    this.dialogueOptions = [
      { text: "Where the place?", response: "Upon the heath." },
      { text: "I come, graymalkin!", response: "Paddock calls!" }
    ];
    this.dialogueOptions.forEach((option, index) => {
      const optionText = this.add.text(150, 520 + index * 30, option.text, {
        fontSize: "18px",
        fill: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 10, y: 5 }
      }).setInteractive();
      optionText.on("pointerdown", () => {
        this.handleDialogueOption(option.response, optionText);
      });
      this.optionTexts.push(optionText);
    });
  }

  handleDialogueOption(response, optionText) {
    this.dialogueText.setText(response);
    optionText.destroy();
    this.optionTexts = this.optionTexts.filter(text => text !== optionText);
    if (this.optionTexts.length === 0) {
      this.time.delayedCall(2000, () => {
        this.endDialogue();
      });
    }
  }

  endDialogue() {
    this.dialogueBox.setVisible(false);
    this.dialogueText.setVisible(false);
    this.optionTexts.forEach(optionText => optionText.destroy());
    this.optionTexts = [];
    this.isDialogueVisible = false;
    this.canProgressDialogue = false;
    this.dialogueCompleted = true;
  }
}
