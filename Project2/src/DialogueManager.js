export class DialogueManager {
    constructor(scene, dialogueData, playerKey = null) {
        this.scene = scene;
        this.dialogueData = dialogueData;
        this.playerKey = playerKey;

        // UI elements
        this.dialogueContainer = null;
        this.bg = null;
        this.nameText = null;
        this.dialogueText = null;
        this.portrait = null;
        this.responseTexts = [];

        // Typewriter effect
        this.typingSpeed = 30;
        this.fullText = "";
        this.currentText = "";
        this.textIndex = 0;

        // Dialogue tracking
        this.currentDialogue = null;
        this.npcKey = null;
        this.dialogueQueue = [];
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
        this.dialogueQueue = Array.isArray(this.currentDialogue) ? [...this.currentDialogue] : [this.currentDialogue];

        if (this.dialogueQueue.length > 0) {
            this.nextDialogue();
        } else {
            this.endDialogue();
        }
    }

    createDialogueBox() {
        const cam = this.scene.cameras.main;
        const boxWidth = cam.width * 0.5;
        const boxHeight = cam.height * 0.15;
        const boxX = (cam.width - boxWidth) / 2;
        const boxY = cam.height - boxHeight - 20;

        this.bg = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x000000, 0.8).setOrigin(0.5);
        this.portrait = this.scene.add.image(-boxWidth / 2 + 80, 0, "npc").setDisplaySize(96, 96);

        this.nameText = this.scene.add.text(this.portrait.x, this.portrait.y - 75, "???", {
            font: "26px Inknut Antiqua",
            fill: "#ffffff",
            fontWeight: "bold"
        }).setOrigin(0.5);

        this.dialogueText = this.scene.add.text(-boxWidth / 2 + 200, -boxHeight / 2 + 30, "", {
            font: "26px Inknut Antiqua",
            fill: "#ffffff",
            wordWrap: { width: boxWidth - 180 }
        });
        

        this.dialogueContainer = this.scene.add.container(boxX + boxWidth / 2, boxY + boxHeight / 2, [
            this.bg, this.portrait, this.nameText, this.dialogueText
        ]);

        this.dialogueContainer.setDepth(9999);
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
    
        if (dialogueNode.responses) {
            this.showResponses(dialogueNode.responses);
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
    }

    typeNextLetter() {
        if (!this.dialogueText || !this.fullText) {
            return;
        }

        if (this.textIndex < this.fullText.length) {
            this.currentText += this.fullText[this.textIndex];
            this.dialogueText.setText(this.currentText);
            this.textIndex++;
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
        const boxWidth = this.bg.displayWidth;
        const textStartX = this.dialogueText.x;
        const startY = this.dialogueText.y + this.dialogueText.height + 10;
    
        this.responseTexts = [];
    
        responses.forEach((resp, index) => {
            let option = this.scene.add.text(
                textStartX,
                startY + index * 40,
                `${index + 1}. ${resp.text}`,
                {
                    font: "22px Inknut Antiqua",
                    fill: "#ffff00",
                    padding: { x: 10, y: 5 }
                }
            ).setInteractive();
    
            let border = this.scene.add.rectangle(
                option.x + option.width / 2,
                option.y + option.height / 2,
                option.width + 20,
                option.height + 10
            ).setStrokeStyle(2, 0xffff00).setVisible(false);
    
            option.on("pointerover", () => {
                border.setVisible(true);
            });
    
            option.on("pointerout", () => {
                border.setVisible(false);
            });
    
            option.on("pointerdown", () => {
                this.clearResponses();
                border.destroy(); 
    
                if (this.scene.scene.key === "Act1Scene1") {
                    this.nextDialogue();
                } else {
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
    
}
