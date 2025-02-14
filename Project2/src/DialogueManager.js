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
      this.updateSpeaker("npc");
      this.typeText(initialText);
    }
  
    // Create a container with a background, a name label, text field, and portrait.
    createDialogueBox() {
        const cam = this.scene.cameras.main;
      
        // Calculate a “centered” box, e.g. 60% of the screen width, 25% of the screen height
        const boxWidth = cam.width * 0.6;
        const boxHeight = cam.height * 0.25;
        const boxX = (cam.width - boxWidth) / 2;   // left edge
        const boxY = (cam.height - boxHeight) / 2; // top edge
      
        // Background rectangle (slightly transparent)
        this.bg = this.scene.add.rectangle(
          0, 0,   // We'll place it in a container, so start at (0,0)
          boxWidth, boxHeight,
          0x000000, 0.8
        ).setOrigin(0.5);
      
        // Portrait image: place on the left side of the box
        // We'll default it to the NPC’s key, but we’ll update in `updateSpeaker()`.
        this.portrait = this.scene.add.image(
          -boxWidth / 2 + 60, // shift left inside the container
          0,                  // vertically centered
          this.npcKey         // or 'player'
        ).setDisplaySize(64, 64);
      
        // Name text: near the top, to the right of the portrait
        this.nameText = this.scene.add.text(
          -boxWidth / 2 + 120, // shift right a bit from portrait
          -boxHeight / 2 + 20, // near the top
          "",
          {
            font: "20px Arial",
            fill: "#ffffff"
          }
        );
      
        // Dialogue text: below the name text
        // Word-wrap it so it fits inside the box
        this.dialogueText = this.scene.add.text(
          -boxWidth / 2 + 120,
          -boxHeight / 2 + 50,
          "",
          {
            font: "16px Arial",
            fill: "#ffffff",
            wordWrap: { width: boxWidth - 160 }
          }
        );
      
        // Create a container to hold everything, and position it in the center
        this.dialogueContainer = this.scene.add.container(
          boxX + boxWidth / 2,  // container center
          boxY + boxHeight / 2, // container center
          [ this.bg, this.portrait, this.nameText, this.dialogueText ]
        );
      
        // Optionally: set a higher depth so it appears above other elements
        this.dialogueContainer.setDepth(9999);
      }
      
  
    // Change the dialogue box to show the correct speaker.
    // For the NPC, we use the dialogue data’s name (if provided) or the npcKey.
    // For the player, we assume the asset key is "player" and the name is "You".
    updateSpeaker(speaker) {
      if (speaker === "npc") {
        const npcName = this.currentDialogue.name || this.npcKey;
        this.nameText.setText(npcName);
        this.portrait.setTexture(this.npcKey);
      } else if (speaker === "player") {
        this.nameText.setText("You");
        this.portrait.setTexture("player");
      }
    }
  
    // Start typing text into the dialogue text field.
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
  
    // Called on each timer event to add one letter.
    typeNextLetter() {
      if (this.textIndex < this.fullText.length) {
        this.currentText += this.fullText[this.textIndex];
        this.dialogueText.setText(this.currentText);
        this.textIndex++;
      } else {
        // Finished typing; stop the timer.
        this.textTimer.remove(false);
        // If the NPC just finished speaking and there are response options,
        // display them so the player can choose a reply.
        if (this.currentDialogue.responses) {
          this.showResponses();
        } else {
          // Otherwise, wait for a click to end the dialogue.
          this.scene.input.once("pointerdown", () => {
            this.endDialogue();
          });
        }
      }
    }
  
    // Display interactive text options for the player's responses.
    showResponses() {
        // Grab the actual dimensions from the background
        const boxWidth = this.bg.displayWidth;
        const boxHeight = this.bg.displayHeight;
      
        // Start near the bottom, a bit above the edge
        const startX = -boxWidth / 2 + 120;
        const startY = boxHeight / 2 - 40;
        const spacing = 30;
      
        this.responseTexts = [];
        this.currentDialogue.responses.forEach((resp, index) => {
          let option = this.scene.add.text(
            startX, 
            startY + index * spacing, 
            resp.text, 
            {
              font: "16px Arial",
              fill: "#ffff00"
            }
          ).setInteractive();
      
          option.on("pointerdown", () => {
            this.clearResponses();
            this.showPlayerResponse(resp.text, resp.next);
          });
      
          this.dialogueContainer.add(option);
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
      // Switch dialogue box to the player.
      this.updateSpeaker("player");
      this.typeText(playerText);
      // After the player's text is complete, wait for a click to continue.
      this.scene.input.once("pointerdown", () => {
        // Switch back to the NPC speaker and display their reply (if any).
        if (this.currentDialogue[nextKey]) {
          this.updateSpeaker("npc");
          this.typeText(this.currentDialogue[nextKey]);
        } else {
          // If there’s no further dialogue, end the conversation.
          this.endDialogue();
        }
      });
    }
  
    // Clean up the dialogue UI and re-enable player controls.
    endDialogue() {
      this.dialogueContainer.destroy();
      if (this.scene.player.body) {
        this.scene.player.body.enable = true;
      }
      this.scene.inDialogue = false;
      // Optionally, if the dialogue node has an endScene flag, trigger a scene transition.
      if (this.currentDialogue.endScene) {
        this.scene.scene.start("NextScene"); // Adjust as needed.
      }
    }
  }
  