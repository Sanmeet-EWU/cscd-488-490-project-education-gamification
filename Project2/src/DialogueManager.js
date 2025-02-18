export class DialogueManager {
  constructor(scene, dialogueData) {
      this.scene = scene;
      this.dialogueData = dialogueData;
      // UI elements (created when dialogue starts)
      this.dialogueContainer = null;
      this.bg = null;
      this.nameText = null;
      this.dialogueText = null;
      this.portrait = null;
      this.closeButton = null;

      // Typewriter effect state
      this.textTimer = null;
      this.typingSpeed = 30; // ms per character
      this.fullText = "";
      this.currentText = "";
      this.textIndex = 0;

      // Conversation data
      this.currentDialogue = null;
      this.npcKey = null; // the key of the NPC we’re talking to
      this.responseTexts = [];

      // Player character key (should change dynamically based on the scene)
      this.playerKey = "Witch1"; // Default player character for Act1Scene1
  }

  // Start a dialogue with an NPC (using the npcKey from your JSON)
  startDialogue(npcKey) {
      this.npcKey = npcKey;
      this.currentDialogue = this.dialogueData[npcKey];
      if (!this.currentDialogue) {
          console.warn("No dialogue found for", npcKey);
          return;
      }

      // Mark dialogue as active and disable player movement.
      this.scene.inDialogue = true;
      if (this.scene.player.body) {
          this.scene.player.body.enable = false;
      }

      // Create the dialogue UI elements.
      this.createDialogueBox();

      // Get the initial text (using either "intro" or "text" as your JSON varies)
      const initialText = this.currentDialogue.intro || this.currentDialogue.text;
      // We assume the NPC is speaking first. The dialogue box (portrait and name)
      // will be set accordingly.
      this.updateSpeaker("npc", this.npcKey);
      this.typeText(initialText);
  }

  // Create a container with a background, a name label, text field, and portrait.
  createDialogueBox() {
    const cam = this.scene.cameras.main;
    const boxWidth = cam.width * 0.7;
    const boxHeight = cam.height * 0.3;
    const boxX = (cam.width - boxWidth) / 2;
    const boxY = cam.height - boxHeight - 20;

    this.bg = this.scene.add.rectangle(
        0, 0,
        boxWidth, boxHeight,
        0x000000, 0.8
    ).setOrigin(0.5);

    this.portrait = this.scene.add.image(
        -boxWidth / 2 + 80,
        0,
        this.npcKey
    ).setDisplaySize(96, 96);

    this.nameText = this.scene.add.text(
        -boxWidth / 2 + 160,
        -boxHeight / 2 + 20,
        "",
        {
            font: "24px Arial",
            fill: "#ffffff",
            fontWeight: "bold"
        }
    );

    this.dialogueText = this.scene.add.text(
        -boxWidth / 2 + 160,
        -boxHeight / 2 + 60,
        "",
        {
            font: "20px Arial",
            fill: "#ffffff",
            wordWrap: { width: boxWidth - 180 }
        }
    );

    // Close button (Top-right of dialogue box)
    this.closeButton = this.scene.add.text(
        boxWidth / 2 - 40,
        -boxHeight / 2 + 10,
        "X",
        {
            font: "24px Arial",
            fill: "#ff0000",
            backgroundColor: "#ffffff",
            padding: { x: 5, y: 5 }
        }
    ).setInteractive();

    this.closeButton.on("pointerdown", () => {
        this.endDialogue();
    });

    this.dialogueContainer = this.scene.add.container(
        boxX + boxWidth / 2,
        boxY + boxHeight / 2,
        [this.bg, this.portrait, this.nameText, this.dialogueText, this.closeButton]
    );

    this.dialogueContainer.setDepth(9999);
}


  // Change the dialogue box to show the correct speaker.
  updateSpeaker(speaker, key) {
    if (speaker === "npc") {
        const npcName = this.currentDialogue.name || this.npcKey;
        this.nameText.setText(npcName);

        if (this.scene.textures.exists(this.npcKey)) {
            this.portrait.setTexture(this.npcKey);
        } else {
            console.warn(`Warning: Texture for ${this.npcKey} not found. Defaulting to 'npc'`);
            this.portrait.setTexture("npc");
        }
    } else if (speaker === "player") {
        this.nameText.setText("You");

        if (this.scene.textures.exists(this.playerKey)) {
            this.portrait.setTexture(this.playerKey);
        } else {
            console.warn("Warning: Player texture not found. Defaulting to 'default'");
            this.portrait.setTexture("default");
        }
    }
}


  // Start typing text into the dialogue text field.
  typeText(text) {
    if (!this.dialogueText) {
        console.error("Error: dialogueText is null or undefined. Dialogue box might not be initialized.");
        return;
    }

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


  // Called on each timer event to add one letter.
  typeNextLetter() {
      if (this.textIndex < this.fullText.length) {
          this.currentText += this.fullText[this.textIndex];
          this.dialogueText.setText(this.currentText);
          this.textIndex++;
      } else {
          this.textTimer.remove(false);

          // If the NPC just finished speaking and there are response options, display them.
          if (this.currentDialogue.responses) {
              this.showResponses();
          } else {
              this.scene.input.once("pointerdown", () => {
                  this.endDialogue();
              });
          }
      }
  }

  // Display interactive text options for the player's responses.
  showResponses() {
      const boxWidth = this.bg.displayWidth;
      const startX = -boxWidth / 2 + 160;
      const startY = this.bg.displayHeight / 2 - 80;
      const spacing = 40;

      this.responseTexts = [];
      this.currentDialogue.responses.forEach((resp, index) => {
          let option = this.scene.add.text(
              startX,
              startY + index * spacing,
              `${index + 1}. ${resp.text}`,
              {
                  font: "22px Arial",
                  fill: "#ffff00",
                  backgroundColor: "#333333",
                  padding: { x: 10, y: 5 }
              }
          ).setInteractive();

          let border = this.scene.add.rectangle(
              startX + option.width / 2,
              startY + index * spacing + option.height / 2,
              option.width + 20,
              option.height + 10,
              0xffffff,
              0.2
          ).setStrokeStyle(2, 0xffff00).setVisible(false);

          option.on("pointerover", () => {
              border.setVisible(true);
          });

          option.on("pointerout", () => {
              border.destroy();
          });

          option.on("pointerdown", () => {
              this.clearResponses();
              this.showPlayerResponse(resp.text, resp.next);
          });

          this.dialogueContainer.add([option, border]);
          this.responseTexts.push(option);
      });
  }

  // Remove the response option texts.
  clearResponses() {
      this.responseTexts.forEach((option) => option.destroy());
      this.responseTexts = [];
  }

  // Show the player's chosen reply. After it is typed out, switch back to NPC.
  showPlayerResponse(playerText, nextKey) {
      this.updateSpeaker("player", this.playerKey);
      this.typeText(playerText);

      this.scene.input.once("pointerdown", () => {
          if (this.currentDialogue[nextKey]) {
              this.updateSpeaker("npc");
              this.typeText(this.currentDialogue[nextKey]);
          } else {
              this.endDialogue();
          }
      });
  }

  endDialogue() {
      this.dialogueContainer.destroy();
      if (this.scene.player.body) {
          this.scene.player.body.enable = true;
      }
      this.scene.inDialogue = false;
  }
}
