export class DialogueManager {
    constructor(scene, dialogueData, portraitMap, isLinearDialogue = false, playerKey = null) {
        this.scene = scene;
        this.dialogueData = dialogueData;
        this.portraitMap = portraitMap || {};
        this.isLinearDialogue = isLinearDialogue;
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
        this.onComplete = null;

        this._originalResponses = null;

        this.isActive = false;
        this.resizeListener = (gameSize) => {
            if (this.isActive && this.dialogueContainer) {
                this.adjustBoxSize(gameSize.width, gameSize.height);
            }
        };
    }

    startDialogue(npcKey, onComplete = null) {
        this.npcKey = npcKey;
        this.onComplete = onComplete;
        this.currentDialogue = this.dialogueData[npcKey];

        if (!this.currentDialogue) return;

        this.scene.inDialogue = true;
        if (this.scene.player?.body) this.scene.player.body.enable = false;

        this.createDialogueBox();
        this.isActive = true;
        this.scene.scale.on('resize', this.resizeListener);

        this.dialogueQueue = Array.isArray(this.currentDialogue) ? [...this.currentDialogue] : [this.currentDialogue];

        this.scene.time.delayedCall(100, () => this.adjustBoxHeight(), [], this);

        if (this.dialogueQueue.length > 0) {
            this.nextDialogue();
        } else {
            this.endDialogue();
        }
    }

    createDialogueBox() {
        const cam = this.scene.cameras.main;
        this.boxWidth = cam.width * 0.6;
        this.boxHeight = cam.height * 0.15;
        this.boxX = (cam.width - this.boxWidth) / 2;
        const containerY = cam.height - 20 - this.boxHeight / 2;

        this.bg = this.scene.add.rectangle(0, 0, this.boxWidth, this.boxHeight, 0x000000, 0.8).setOrigin(0.5);
        this.portrait = this.scene.add.image(-this.boxWidth / 2 + 20, -this.boxHeight / 2 + 20, null)
            .setOrigin(0, 0)
            .setDisplaySize(60, 60);

        const dynamicNameFontSize = Math.round(cam.height * 0.015);
        const dynamicDialogueFontSize = Math.round(cam.height * 0.025);

        this.nameText = this.scene.add.text(
            this.portrait.x + 30,
            this.portrait.y + 60 + 10,
            "???",
            {
                font: `${dynamicNameFontSize}px Inknut Antiqua`,
                fill: "#ffffff",
                fontWeight: "bold",
                wordWrap: { width: 60, useAdvancedWrap: true }
            }
        ).setOrigin(0.5, 0);

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

        this.dialogueContainer = this.scene.add.container(
            this.boxX + this.boxWidth / 2,
            containerY,
            [this.bg, this.portrait, this.nameText, this.dialogueText]
        ).setDepth(9999);
    }

    nextDialogue() {
        if (this.dialogueQueue.length === 0) {
            this.endDialogue();
            if (this.onComplete) this.onComplete();
            return;
        }

        let dialogueNode = this.dialogueQueue.shift();

        if (dialogueNode.endScene) {
            this.endDialogue();
            if (this.onComplete) this.onComplete();
            return;
        }

        this.updateSpeaker(dialogueNode.speaker);
        this.typeText(dialogueNode.text);

        this._originalResponses = null;

        let responses = dialogueNode.responses ? [...dialogueNode.responses] : [];
        if (dialogueNode.translation && dialogueNode.translation.trim() !== "") {
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
            this.portrait.setTexture(null);
            return;
        }

        this.nameText.setText(speaker);
        let texKey = this.portraitMap[speaker] || "npc";
        if (this.scene.textures.exists(texKey)) {
            this.portrait.setTexture(texKey);
        }
        this.portrait.setDisplaySize(60, 60);
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
        if (!this.dialogueText || !this.fullText) return;

        if (this.textIndex < this.fullText.length) {
            this.currentText += this.fullText[this.textIndex];
            this.dialogueText.setText(this.currentText);
            this.textIndex++;
            this.scene.time.delayedCall(50, () => this.adjustBoxHeight(), [], this);
        } else if (this.textTimer) {
            this.textTimer.remove(false);
        }
    }

    endDialogue() {
        this.scene.scale.off('resize', this.resizeListener);
        this.scene.time.removeAllEvents();
        if (this.dialogueContainer) {
            this.dialogueContainer.destroy();
            this.dialogueContainer = null;
            this.bg = null;
        }
        if (this.scene.player?.body) this.scene.player.body.enable = true;
        this.scene.inDialogue = false;
        this.isActive = false;
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

            option.on("pointerout", () => border.setVisible(false));

            option.on("pointerdown", () => {
                border.destroy();
                if (resp.translation) {
                    const originalText = resp.originalText || this.fullText;
                    if (this.dialogueText.text === originalText) {
                        this.dialogueText.setText(resp.translation);
                        option.setText("[Show original]");
                    } else {
                        this.dialogueText.setText(originalText);
                        option.setText("[Translate to modern english]");
                    }
                } else if (this.isLinearDialogue) {
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
                if (this.onComplete) this.onComplete();
            }
        });
    }

    clearResponses() {
        if (this.responseTexts) {
            this.responseTexts.forEach(option => {
                option.destroy();
                if (option.border) option.border.destroy();
            });
        }
        this.responseTexts = [];
    }

    adjustBoxHeight() {
        if (!this.dialogueContainer || !this.bg) return;
        const textHeight = this.dialogueText.height + 40;
        const cam = this.scene.cameras.main;
        const baseBoxHeight = cam.height * 0.15;
        const maxBoxHeight = cam.height * 0.4;

        this.boxWidth = cam.width * 0.6;
        const newHeight = Math.max(baseBoxHeight, Math.min(baseBoxHeight + textHeight, maxBoxHeight));

        this.bg.setSize(this.boxWidth, newHeight);
        this.boxHeight = newHeight;

        const containerY = cam.height - 20 - this.boxHeight / 2;
        this.boxX = (cam.width - this.boxWidth) / 2;
        this.dialogueContainer.setPosition(this.boxX + this.boxWidth / 2, containerY);

        this.adjustPortraitAndName();
        this.adjustResponsePositions();
    }

    adjustPortraitAndName() {
        if (!this.dialogueContainer) return;
        this.portrait.setPosition(-this.boxWidth / 2 + 20, -this.boxHeight / 2 + 20);
        this.nameText.setPosition(-this.boxWidth / 2 + 20 + 30, -this.boxHeight / 2 + 20 + 60 + 10);
        this.dialogueText.setPosition(-this.boxWidth / 2 + 160, -this.boxHeight / 2 + 20);
    }

    adjustResponsePositions() {
        if (!this.dialogueContainer) return;
        const startY = this.dialogueText.y + this.dialogueText.height + 20;
        this.responseTexts.forEach((option, index) => {
            option.setPosition(this.dialogueText.x, startY + index * 40);
        });
    }

    adjustBoxSize(width, height) {
        if (!this.dialogueContainer) return;
        this.boxWidth = width * 0.6;
        this.boxX = (width - this.boxWidth) / 2;
        const containerY = height - 20 - this.boxHeight / 2;
        if (this.bg) this.bg.setSize(this.boxWidth, this.boxHeight);
        this.dialogueContainer.setPosition(this.boxX + this.boxWidth / 2, containerY);
        this.dialogueText.setWordWrapWidth(this.boxWidth - 200);
        this.adjustPortraitAndName();
        this.adjustResponsePositions();
    }

    destroy() {
        this.scene.scale.off('resize', this.resizeListener);
        this.scene.time.removeAllEvents();
        if (this.dialogueContainer) {
            this.dialogueContainer.destroy();
            this.dialogueContainer = null;
            this.bg = null;
        }
        this.isActive = false;
        this.scene.inDialogue = false;
    }
}