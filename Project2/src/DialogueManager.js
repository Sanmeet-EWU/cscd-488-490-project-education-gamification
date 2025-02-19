export class DialogueManager {
    constructor(scene, dialogueData, playerKey = null) {
        this.scene = scene;
        this.dialogueData = dialogueData;
        this.playerKey = playerKey;

        this.dialogueContainer = null;
        this.bg = null;
        this.nameText = null;
        this.dialogueText = null;
        this.portrait = null;
        this.responseTexts = [];

        this.typingSpeed = 30;
        this.fullText = "";
        this.currentText = "";
        this.textIndex = 0;

        this.currentDialogue = null;
        this.npcKey = null;
        this.dialogueQueue = [];

        // For storing original responses when showing a translation
        this._originalResponses = null;
    }

    startDialogue(npcKey) {
        this.npcKey = npcKey;
        this.currentDialogue = this.dialogueData[npcKey];

        if (!this.currentDialogue) {
            return;
        }

        this.scene.inDialogue = true;
        if (this.scene.player?.body) {
            this.scene.player.body.enable = false;
        }

        this.createDialogueBox();
        this.dialogueQueue = Array.isArray(this.currentDialogue)
            ? [...this.currentDialogue]
            : [this.currentDialogue];

        // Adjust height shortly after creating the box (to allow text measurements)
        this.scene.time.delayedCall(100, () => this.adjustBoxHeight(), [], this);

        if (this.dialogueQueue.length > 0) {
            this.nextDialogue();
        } else {
            this.endDialogue();
        }

        // Listen for resize events to reposition/resize the dialogue box
        this.scene.scale.on('resize', (gameSize) => {
            this.adjustBoxSize(gameSize.width, gameSize.height);
        });
    }

    createDialogueBox() {
        const cam = this.scene.cameras.main;
        this.boxWidth = cam.width * 0.6;
        this.boxHeight = cam.height * 0.15;
        this.boxX = (cam.width - this.boxWidth) / 2;
        // Calculate container Y so that the bottom of the dialogue box remains fixed at 20px from the bottom.
        const containerY = cam.height - 20 - this.boxHeight / 2;
    
        // Create background rectangle (centered in container)
        this.bg = this.scene.add.rectangle(0, 0, this.boxWidth, this.boxHeight, 0x000000, 0.8)
            .setOrigin(0.5);
    
        // Position portrait in the top left of the dialogue box.
        this.portrait = this.scene.add.image(-this.boxWidth / 2 + 20, -this.boxHeight / 2 + 20, "npc")
            .setDisplaySize(80, 80)
            .setOrigin(0, 0); // anchor top-left
    
        // Recalculate dynamic font sizes using the camera's height.
        const dynamicNameFontSize = Math.round(cam.height * 0.015);
        const dynamicDialogueFontSize = Math.round(cam.height * 0.025);
    
        // Name text centered under the portrait.
        this.nameText = this.scene.add.text(
            -this.boxWidth / 2 + 20 + 40,
            -this.boxHeight / 2 + 20 + 80 + 10,
            "???",
            {
                font: `${dynamicNameFontSize}px Inknut Antiqua`,
                fill: "#ffffff",
                fontWeight: "bold",
                wordWrap: { width: 80, useAdvancedWrap: true } // adjust width as needed
            }
        ).setOrigin(0.5, 0);
    
        // Dialogue text positioned to the right of the portrait.
        this.dialogueText = this.scene.add.text(
            -this.boxWidth / 2 + 160,
            -this.boxHeight / 2 + 20,
            "",
            {
                font: `${dynamicDialogueFontSize}px Inknut Antiqua`,
                fill: "#ffffff",
                wordWrap: { width: this.boxWidth - 200, useAdvancedWrap: true }
            }
        );
    
        // Create container with the background and texts.
        this.dialogueContainer = this.scene.add.container(
            this.boxX + this.boxWidth / 2,
            containerY,
            [this.bg, this.portrait, this.nameText, this.dialogueText]
        );
        this.dialogueContainer.setDepth(9999);
    
        // Also listen for resize events (in case createDialogueBox is called again)
        this.scene.scale.on('resize', (gameSize) => {
            this.adjustBoxSize(gameSize.width, gameSize.height);
        });
    }
    
    nextDialogue() {
        if (this.dialogueQueue.length === 0) {
            this.endDialogue();
            return;
        }
    
        let dialogueNode = this.dialogueQueue.shift();
    
        if (dialogueNode.endScene) {
            this.endDialogue();
            return;
        }
    
        this.updateSpeaker(dialogueNode.speaker);
        this.typeText(dialogueNode.text);
    
        // Clear any previous stored original responses.
        this._originalResponses = null;
    
        // If a translation exists and isn’t empty, add a translation option.
        let responses = dialogueNode.responses ? [...dialogueNode.responses] : [];
        if (dialogueNode.translation && dialogueNode.translation.trim() !== "") {
            // Prepend the translation option. Also store the original text.
            responses.unshift({
                text: "[Translate to modern english]",
                translation: dialogueNode.translation,
                originalText: dialogueNode.text
            });
        }
    
        if (responses.length > 0) {
            this.showResponses(responses);
        }
    }
    
    updateSpeaker(speaker) {
        if (!speaker) {
            this.nameText.setText("???");
            return;
        }
    
        this.nameText.setText(speaker);
    
        if (this.scene.textures.exists(speaker)) {
            this.portrait.setTexture(speaker);
        } else {
            this.portrait.setTexture("npc");
        }
    }
    
    typeText(text) {
        this.fullText = text;
        this.currentText = "";
        this.textIndex = 0;
        this.dialogueText.setText("");
    
        if (this.textTimer) {
            this.textTimer.remove(false);
        }
    
        this.textTimer = this.scene.time.addEvent({
            delay: this.typingSpeed,
            callback: this.typeNextLetter,
            callbackScope: this,
            loop: true
        });
    
        this.scene.time.delayedCall(200, () => this.adjustBoxHeight(), [], this);
    }
    
    typeNextLetter() {
        if (!this.dialogueText || !this.fullText) {
            return;
        }
    
        if (this.textIndex < this.fullText.length) {
            this.currentText += this.fullText[this.textIndex];
            this.dialogueText.setText(this.currentText);
            this.textIndex++;
    
            this.scene.time.delayedCall(50, () => this.adjustBoxHeight(), [], this);
        } else {
            if (this.textTimer) {
                this.textTimer.remove(false);
            }
        }
    }
    
    endDialogue() {
        this.dialogueContainer.destroy();
        if (this.scene.player?.body) {
            this.scene.player.body.enable = true;
        }
        this.scene.inDialogue = false;
    }
    
    showResponses(responses) {
        const textStartX = this.dialogueText.x;
        const startY = this.dialogueText.y + this.dialogueText.height + 20;
    
        this.clearResponses();
        this.responseTexts = [];
    
        responses.forEach((resp, index) => {
            let option = this.scene.add.text(
                textStartX,
                startY + index * 40,
                resp.text,
                {
                    font: "22px Inknut Antiqua",
                    fill: "#ffff00",
                    padding: { x: 10, y: 5 }
                }
            ).setInteractive();
    
            let border = this.scene.add.rectangle(
                0, 0,
                option.width + 20,
                option.height + 10
            ).setStrokeStyle(2, 0xffff00).setVisible(false);
    
            option.on("pointerover", () => {
                border.setPosition(option.x + option.width / 2, option.y + option.height / 2);
                border.setVisible(true);
            });
    
            option.on("pointerout", () => {
                border.setVisible(false);
            });
    
            option.on("pointerdown", () => {
                border.destroy();
                if (resp.translation) {
                    // Toggle between the original and translated text.
                    const originalText = resp.originalText || this.fullText;
                    if (this.dialogueText.text === originalText) {
                        this.dialogueText.setText(resp.translation);
                        option.setText("[Show original]");
                    } else {
                        this.dialogueText.setText(originalText);
                        option.setText("[Translate to modern english]");
                    }
                    // Do not clear responses—allow repeated toggling.
                } else if (this.scene.scene.key === "Act1Scene1") {
                    this.clearResponses();
                    this.nextDialogue();
                } else {
                    this.clearResponses();
                    this.showPlayerResponse(resp.text, resp.next);
                }
            });
    
            this.dialogueContainer.add([option, border]);
            this.responseTexts.push(option);
        });
    }
    
    
    showPlayerResponse(playerText, nextKey) {
        this.updateSpeaker("player");
        this.typeText(playerText);
    
        this.scene.input.once("pointerdown", () => {
            if (this.dialogueData[nextKey]) {
                this.updateSpeaker(this.dialogueData[nextKey].speaker);
                this.typeText(this.dialogueData[nextKey].text);
            } else {
                this.endDialogue();
            }
        });
    }
    
    clearResponses() {
        if (this.responseTexts) {
            this.responseTexts.forEach(option => {
                option.destroy();
                if (option.border) {
                    option.border.destroy();
                }
            });
        }
        this.responseTexts = [];
    }
    
    adjustBoxHeight() {
        const textHeight = this.dialogueText.height + 40;
        const cam = this.scene.cameras.main;
        const baseBoxHeight = cam.height * 0.15;
        const maxBoxHeight = cam.height * 0.4;
    
        this.boxWidth = cam.width * 0.6;
        // New height: grows with text but is clamped
        const newHeight = Math.max(baseBoxHeight, Math.min(baseBoxHeight + textHeight, maxBoxHeight));
    
        this.bg.setSize(this.boxWidth, newHeight);
        this.boxHeight = newHeight;
    
        // Recalculate container Y to keep the bottom fixed.
        const containerY = cam.height - 20 - this.boxHeight / 2;
        this.boxX = (cam.width - this.boxWidth) / 2;
        this.dialogueContainer.setPosition(this.boxX + this.boxWidth / 2, containerY);
    
        this.adjustPortraitAndName();
        this.adjustResponsePositions();
    }
    
    adjustPortraitAndName() {
        // Position the portrait at the top left of the dialogue box background.
        this.portrait.setPosition(-this.boxWidth / 2 + 20, -this.boxHeight / 2 + 20);
    
        // Center the name directly under the portrait.
        this.nameText.setPosition(-this.boxWidth / 2 + 20 + 40, -this.boxHeight / 2 + 20 + 80 + 10);
    
        // Dialogue text remains to the right.
        this.dialogueText.setPosition(-this.boxWidth / 2 + 160, -this.boxHeight / 2 + 20);
    }
    
    adjustResponsePositions() {
        // Position response options below the dialogue text.
        const startY = this.dialogueText.y + this.dialogueText.height + 20;
        this.responseTexts.forEach((option, index) => {
            option.setPosition(this.dialogueText.x, startY + index * 40);
        });
    }
    
    adjustBoxSize(width, height) {
        this.boxWidth = width * 0.6;
        this.boxX = (width - this.boxWidth) / 2;
        // Use the current boxHeight to recalc container Y so the bottom stays fixed.
        const containerY = height - 20 - this.boxHeight / 2;
        this.bg.setSize(this.boxWidth, this.boxHeight);
        this.dialogueContainer.setPosition(this.boxX + this.boxWidth / 2, containerY);
    
        // Adjust dialogue text wrapping based on the new box width.
        this.dialogueText.setWordWrapWidth(this.boxWidth - 200);
        this.adjustPortraitAndName();
        this.adjustResponsePositions();
    }
}
