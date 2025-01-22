import { GameScene } from "./GameScene";

export default class testScene extends GameScene {
    constructor() {
        super("testScene"); // Scene key
    }

    create() {
        // Add the options/pause menu
        this.initializeOptions();

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
            "Where the place?",
            "I come, graymalkin!"
        ];

        this.optionTexts = []; // Store the option text objects
        this.dialogueCompleted = false; 
        this.canProgressDialogue = false; // Dialogue progression is initially disabled



    //  Temporary exit button -----------------------------------------------------------------------
        const closeOut = this.add.text(50, 50, 'X', {// temp X button to close the settings menu
            fontFamily: 'Inknut Antiqua', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'right'
        }).setInteractive().setOrigin(0.5);

        closeOut.on('pointerover', () => {
            closeOut.setColor('#ff0');
        })
        closeOut.on('pointerout', () => {
            closeOut.setColor('#fff');
        })
        closeOut.on('pointerdown', () => {//Return to main menu
            this.scene.start('MainMenu');
        });
    //  End of temporary exit button -----------------------------------------------------------------------
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
        // Do nothing if the dialogue has already been completed
        if (this.dialogueCompleted) {
            return;
        }
    
        // Start the dialogue and show the first line
        this.isDialogueVisible = true;
        this.dialogueBox.setVisible(true);
        this.dialogueText.setVisible(true);
        this.currentDialogueIndex = 0;
        this.dialogueText.setText(this.dialogue[this.currentDialogueIndex]);
    
        // Enable dialogue progression
        this.canProgressDialogue = true;
    }
    
    advanceDialogue() {
        // Prevent progression if not allowed
        if (!this.canProgressDialogue) {
            return;
        }
    
        // Disable further progression until the current step is completed
        this.canProgressDialogue = false;
    
        this.currentDialogueIndex++;
    
        if (this.currentDialogueIndex < this.dialogue.length) {
            // Show the next line of dialogue
            this.dialogueText.setText(this.dialogue[this.currentDialogueIndex]);
    
            // Re-enable progression after a short delay (simulate the time for dialogue display)
            this.time.delayedCall(500, () => {
                this.canProgressDialogue = true;
            });
        } else if (this.currentDialogueIndex === this.dialogue.length) {
            // Show dialogue options
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
        // Display the response for the selected option
        this.dialogueText.setText(response);
    
        // Remove the selected option text
        optionText.destroy();
    
        // Remove the option from the options list
        this.optionTexts = this.optionTexts.filter(text => text !== optionText);
    
        // If no options are left, wait before closing the dialogue
        if (this.optionTexts.length === 0) {
            this.time.delayedCall(2000, () => {
                this.endDialogue();
            });
        }
    }
    
    
     
    
    endDialogue() {
        // Hide dialogue box and text
        this.dialogueBox.setVisible(false);
        this.dialogueText.setVisible(false);
    
        // Destroy any remaining option texts
        this.optionTexts.forEach(optionText => optionText.destroy());
        this.optionTexts = [];
    
        // Reset dialogue flags
        this.isDialogueVisible = false;
        this.canProgressDialogue = false;
        this.dialogueCompleted = true; // Mark the dialogue as completed
    }
    
    
}
