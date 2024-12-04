export default class testScene extends Phaser.Scene {
    constructor() {
        super("testScene"); // Scene key
    }

    create() {
        // Set the background color
        this.cameras.main.setBackgroundColor("#808080");

        // Add a physics-enabled player sprite (box1)
        this.player = this.physics.add.sprite(300, 300, null).setDisplaySize(100, 100).setOrigin(0.5);
        this.player.body.setCollideWorldBounds(true);

        // Add box2 as a static rectangle with physics
        this.box2 = this.add.rectangle(600, 300, 100, 100, 0x666666);
        this.physics.add.existing(this.box2, true); // Static physics body

        // Add a graphics object to visually represent box2
        const graphics = this.add.graphics({ fillStyle: { color: 0x666666 } });
        graphics.fillRect(this.box2.x - 50, this.box2.y - 50, 100, 100); // Draw box2

        // Add the dialogue box (hidden initially)
        this.dialogueBox = this.add.rectangle(512, 700, 800, 100, 0x000000).setAlpha(0.8).setVisible(false);
        this.dialogueText = this.add.text(120, 670, "", {
            fontSize: "20px",
            fill: "#ffffff",
            wordWrap: { width: 760 }
        }).setVisible(false);

        // Add the "Press E to interact" text (hidden initially)
        this.interactText = this.add.text(512, 650, "Press E to interact", {
            fontSize: "18px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setVisible(false);

        // Add WASD input controls
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Add E key for interaction
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Track interaction state
        this.isDialogueVisible = false;
        this.currentDialogueIndex = 0;

        // Define dialogue lines and options
        this.dialogue = [
            "When shall we three meet again In thunder, lightning, or in rain?",
            "When the hurlyburly's done, When the battle's lost and won.",
            "That will be ere the set of sun."
        ];

        this.dialogueOptions = [
            "I’m just passing through.",
            "I’m looking for adventure."
        ];

        this.optionTexts = []; // Store the option text objects
    }

    update() {
        // Check for toggle input or dialogue progression
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            if (this.isDialogueVisible) {
                this.advanceDialogue();
            } else {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.box2.x,
                    this.box2.y
                );

                if (distance < 150) {
                    this.toggleDialogue();
                }
            }
        }

        // Prevent player movement if dialogue is visible
        if (this.isDialogueVisible) {
            this.player.body.setVelocity(0);
            return; // Skip movement logic
        }

        // Reset player velocity
        this.player.body.setVelocity(0);

        const speed = 200;

        // Move the player with WASD keys
        if (this.wasd.left.isDown) {
            this.player.body.setVelocityX(-speed);
        }
        if (this.wasd.right.isDown) {
            this.player.body.setVelocityX(speed);
        }
        if (this.wasd.up.isDown) {
            this.player.body.setVelocityY(-speed);
        }
        if (this.wasd.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        // Show "Press E to interact" text if the player is near box2
        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.box2.x,
            this.box2.y
        );
        if (distance < 150 && !this.isDialogueVisible) {
            this.interactText.setVisible(true);
        } else {
            this.interactText.setVisible(false);
        }
    }

    toggleDialogue() {
        // Start the dialogue and show the first line
        this.isDialogueVisible = true;
        this.dialogueBox.setVisible(true);
        this.dialogueText.setVisible(true);
        this.currentDialogueIndex = 0;
        this.dialogueText.setText(this.dialogue[this.currentDialogueIndex]);
    }

    advanceDialogue() {
        // Progress through the dialogue or show options
        this.currentDialogueIndex++;

        if (this.currentDialogueIndex < this.dialogue.length) {
            // Show the next line of dialogue
            this.dialogueText.setText(this.dialogue[this.currentDialogueIndex]);
        } else if (this.currentDialogueIndex === this.dialogue.length) {
            // Show dialogue options
            this.showDialogueOptions();
        } else {
            // End dialogue and reset
            this.endDialogue();
        }
    }

    showDialogueOptions() {
        this.dialogueText.setText("Choose an option:");

        // Display options
        this.dialogueOptions.forEach((option, index) => {
            const optionText = this.add.text(150, 500 + index * 30, option, {
                fontSize: "18px",
                fill: "#ffffff",
                backgroundColor: "#333333",
                padding: { x: 10, y: 5 }
            }).setInteractive();

            optionText.on("pointerdown", () => {
                this.handleDialogueOption(index);
            });

            this.optionTexts.push(optionText);
        });
    }

    handleDialogueOption(index) {
        // Handle the selected dialogue option
        this.dialogueText.setText(`You chose: "${this.dialogueOptions[index]}"`);
        this.optionTexts.forEach(optionText => optionText.destroy()); // Remove options
        this.optionTexts = [];
        this.currentDialogueIndex++; // Move past options
    }

    endDialogue() {
        // Hide dialogue and reset
        this.isDialogueVisible = false;
        this.dialogueBox.setVisible(false);
        this.dialogueText.setVisible(false);
    }
}
