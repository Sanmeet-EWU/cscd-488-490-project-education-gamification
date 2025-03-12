export class DialogueManager {
  constructor(scene, dialogueData, portraitMap, isLinearDialogue = true, playerKey = null) {
    this.scene = scene;
    this.dialogueData = dialogueData;
    this.portraitMap = portraitMap || {};
    this.isLinearDialogue = isLinearDialogue;
    this.playerKey = playerKey;
  
    // Core dialogue UI objects
    this.dialogueContainer = null;
    this.bg = null;
    this.nameText = null;
    this.dialogueText = null;
    this.portrait = null;
  
    // Response containers for options (to manage layering)
    this.responseContainers = [];
  
    // Typing effect
    this.typingSpeed = 30;
    this.fullText = "";
    this.currentText = "";
    this.textIndex = 0;
    this.textTimer = null;
    this.typeTextCallback = null; // Callback to call when typing is finished
  
    // Dialogue flow
    this.currentDialogue = null;
    this.currentDialogueIndex = 0;
    this.npcKey = null;
    this.dialogueQueue = [];
    this.onComplete = null;
    this.isActive = false;
    this.isPaused = false;
  
    // Track completed dialogues to prevent restarting
    this.completedDialogues = new Set();
  
    // NPC indicators
    this.interactableNpcs = new Map();
    this.indicators = new Map();
  
    // Identify the first speaker in the scene's JSON
    this.findFirstSpeaker();
  
    // Handle resizing
    this.resizeListener = (gameSize) => {
      if (this.isActive && this.dialogueContainer) {
        this.adjustBoxSize(gameSize.width, gameSize.height);
      }
    };
  }

  findFirstSpeaker() {
    const sceneKey = Object.keys(this.dialogueData)[0];
    if (!sceneKey) return;
    const sceneDialogue = this.dialogueData[sceneKey];
    if (Array.isArray(sceneDialogue) && sceneDialogue.length > 0) {
      this.firstSpeaker = sceneDialogue[0].speaker;
      if (this.firstSpeaker === this.playerKey) {
        for (let i = 1; i < sceneDialogue.length; i++) {
          if (sceneDialogue[i].speaker !== this.playerKey) {
            this.firstSpeaker = sceneDialogue[i].speaker;
            break;
          }
        }
      }
      console.log("First speaker in dialogue:", this.firstSpeaker);
    }
  }

  registerNPC(npcKey, npcSprite, nameTag = null) {
    this.interactableNpcs.set(npcKey, {
      sprite: npcSprite,
      nameTag,
      hasIndicator: false
    });
    if (npcKey === this.firstSpeaker) {
      this.createIndicator(npcKey);
    }
    return true;
  }

  createIndicator(npcKey) {
    const npcData = this.interactableNpcs.get(npcKey);
    if (!npcData || !npcData.sprite) return;
    this.removeIndicator(npcKey);
    const npc = npcData.sprite;
    const nameTag = npcData.nameTag;
    const yPos = nameTag ? nameTag.y - 25 : npc.y - (npc.height * 1.5) - 25;
    const bg = this.scene.add.circle(npc.x, yPos, 12, 0x000000, 0.7).setDepth(99);
    const indicator = this.scene.add.text(npc.x, yPos, "!", {
      fontSize: "20px",
      fontStyle: "bold",
      fill: "#ffff00",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    const tween = this.scene.tweens.add({
      targets: [indicator, bg],
      y: yPos - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    this.indicators.set(npcKey, { text: indicator, background: bg, tween });
    npcData.hasIndicator = true;
    this.interactableNpcs.set(npcKey, npcData);
  }

  removeIndicator(npcKey) {
    const indicator = this.indicators.get(npcKey);
    if (!indicator) return;
    if (indicator.text) indicator.text.destroy();
    if (indicator.background) indicator.background.destroy();
    if (indicator.tween?.isPlaying) indicator.tween.stop();
    this.indicators.delete(npcKey);
    const npcData = this.interactableNpcs.get(npcKey);
    if (npcData) {
      npcData.hasIndicator = false;
      this.interactableNpcs.set(npcKey, npcData);
    }
  }

  updateIndicators() {
    this.interactableNpcs.forEach((npcData, npcKey) => {
      const indicator = this.indicators.get(npcKey);
      if (!indicator || !npcData.sprite) return;
      const npc = npcData.sprite;
      indicator.text.x = npc.x;
      indicator.background.x = npc.x;
    });
  }

  removeAllIndicators() {
    this.indicators.forEach((_, npcKey) => {
      this.removeIndicator(npcKey);
    });
  }

  pauseDialogue() {
    console.log(`Pausing dialogue at index ${this.currentDialogueIndex}`);
    this.isPaused = true;
    this.scene.scale.off("resize", this.resizeListener);
    if (this.dialogueContainer) {
      this.dialogueContainer.destroy();
      this.dialogueContainer = null;
      this.bg = null;
    }
    if (this.scene.player?.body) {
      this.scene.player.body.enable = true;
    }
    this.scene.inDialogue = false;
    this.isActive = false;
    this.addIndicatorForNextSpeaker();
  }

  addIndicatorForNextSpeaker() {
    const sceneKey = Object.keys(this.dialogueData)[0];
    const sceneDialogue = this.dialogueData[sceneKey];
    if (sceneDialogue && this.currentDialogueIndex < sceneDialogue.length) {
      const nextSpeaker = sceneDialogue[this.currentDialogueIndex].speaker;
      if (nextSpeaker !== this.playerKey) {
        this.interactableNpcs.forEach((npcData, npcKey) => {
          if (npcKey === nextSpeaker) {
            this.createIndicator(npcKey);
          }
        });
      }
    }
  }

  startDialogue(npcKey, onComplete = null) {
    console.log(`Starting dialogue with: ${npcKey}`);
    
    // Check if this dialogue has been completed
    if (this.completedDialogues.has(npcKey)) {
      console.log(`Dialogue with ${npcKey} has already been completed.`);
      return false; // Return false to indicate dialogue didn't start
    }
    
    this.npcKey = npcKey;
    this.onComplete = onComplete;
    const sceneKey = Object.keys(this.dialogueData)[0];
    const sceneDialogue = this.dialogueData[sceneKey];
    if (!sceneDialogue) {
      console.warn(`No dialogue found for scene key: ${sceneKey}`);
      return false;
    }
    if (this.isPaused) {
      console.log(`Resuming dialogue from index ${this.currentDialogueIndex}`);
      this.currentDialogue = sceneDialogue.slice(this.currentDialogueIndex);
      this.isPaused = false;
    } else {
      this.currentDialogue = sceneDialogue;
      this.currentDialogueIndex = 0;
    }
    if (!this.currentDialogue.length) {
      console.warn("No dialogue content found");
      return false;
    }
    this.removeAllIndicators();
    if (this.scene.player?.body) {
      this.scene.player.body.enable = false;
    }
    this.scene.inDialogue = true;
    this.isActive = true;
    this.createDialogueBox();
    this.scene.scale.on("resize", this.resizeListener);
    this.dialogueQueue = [...this.currentDialogue];
    this.scene.time.delayedCall(100, () => this.adjustBoxHeight());
    if (this.dialogueQueue.length > 0) {
      this.nextDialogue();
    } else {
      this.endDialogue();
    }
    
    return true; // Return true to indicate dialogue started successfully
  }
  

  createDialogueBox() {
    const cam = this.scene.cameras.main;
    this.boxWidth = cam.width * 0.6;
    this.boxHeight = cam.height * 0.15;
    this.boxX = (cam.width - this.boxWidth) / 2;
    const containerY = cam.height - 20 - this.boxHeight / 2;
    this.dialogueContainer = this.scene.add.container(
      this.boxX + this.boxWidth / 2,
      containerY
    );
    this.dialogueContainer.setDepth(9999);
    // Background (depth 0)
    this.bg = this.scene.add
      .rectangle(0, 0, this.boxWidth, this.boxHeight, 0x000000, 0.8)
      .setOrigin(0.5)
      .setDepth(0);
    // Portrait (depth 1)
    this.portrait = this.scene.add
      .image(-this.boxWidth / 2 + 20, -this.boxHeight / 2 + 20, null)
      .setOrigin(0, 0)
      .setDisplaySize(60, 60)
      .setDepth(1);
    // Speaker name (depth 2)
    const nameSize = Math.round(cam.height * 0.015);
    this.nameText = this.scene.add
      .text(this.portrait.x + 30, this.portrait.y + 60 + 10, "???", {
        font: `${nameSize}px Inknut Antiqua`,
        fill: "#ffffff",
        fontWeight: "bold",
        wordWrap: { width: 60, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0)
      .setDepth(2);
    // Dialogue text (depth 3)
    const textSize = Math.round(cam.height * 0.025);
    this.dialogueText = this.scene.add
      .text(-this.boxWidth / 2 + 160, -this.boxHeight / 2 + 20, "", {
        font: `${textSize}px Inknut Antiqua`,
        fill: "#ffffff",
        wordWrap: { width: this.boxWidth - 200, useAdvancedWrap: true },
      })
      .setDepth(3);
    this.dialogueContainer.add([
      this.bg,
      this.portrait,
      this.nameText,
      this.dialogueText,
    ]);
  }

  nextDialogue() {
    if (this.dialogueQueue.length === 0) {
      this.endDialogue();
      if (this.onComplete) this.onComplete(false); // Not an endScene
      return;
    }
    
    const dialogueNode = this.dialogueQueue.shift();
    this.currentDialogueIndex++;
    
    if (dialogueNode.endScene) {
      // Mark this dialogue as completed when endScene is true
      this.completedDialogues.add(this.npcKey);
      
      this.endDialogue();
      if (this.onComplete) this.onComplete(true); // Pass true to indicate endScene was reached
      return;
    }
    
    this.updateSpeaker(dialogueNode.speaker);
    const isPlayerSpeaking = dialogueNode.speaker === this.playerKey;
    
    if (isPlayerSpeaking) {
      // For player lines, immediately type the text instead of showing an option
      this.typeText(dialogueNode.text, () => {
        // After typing completes, proceed with showing response options or "..."
        if (this.dialogueQueue.length > 0 && !this.dialogueQueue[0].endScene) {
          this.showResponses([{ text: "..." }], null, dialogueNode.translation);
        } else {
          this.nextDialogue(); // Auto-advance if this is the last line
        }
      });
    } else {
      // For NPC lines, type the text automatically.
      this.typeText(dialogueNode.text);
      if (dialogueNode.responses && dialogueNode.responses.length > 0) {
        this.showResponses(dialogueNode.responses, null, dialogueNode.translation);
      } else {
        this.showResponses([{ text: "..." }], null, dialogueNode.translation);
      }
    }
  }

  updateSpeaker(speaker) {
    if (!speaker) {
      this.nameText.setText("???");
      this.portrait.setTexture(null);
      return;
    }
    this.nameText.setText(speaker);
    const texKey = this.portraitMap[speaker] || "npc";
    if (this.scene.textures.exists(texKey)) {
      this.portrait.setTexture(texKey).setDisplaySize(60, 60);
    } else {
      this.portrait.setTexture(null);
    }
  }

  showPlayerDialogueOptions(options, playerText) {
    this.clearResponses();
    
    // Calculate positions to ensure options are inside the box
    const optionsY = this.getResponsePositionY();
    const textStartX = -this.boxWidth / 2 + 180; // Base from dialogue box left edge
    
    options.forEach((option, index) => {
      // Create a container to hold each response option
      const optionContainer = this.scene.add.container(0, 0);
      optionContainer.setDepth(4);
      
      const optionText = this.scene.add.text(
        0, // Position relative to container
        0,
        option.text,
        {
          font: "22px Inknut Antiqua",
          fill: "#ffff00",
          padding: { x: 10, y: 5 },
        }
      ).setInteractive().setOrigin(0);
      
      const border = this.scene.add.rectangle(
        optionText.width / 2 + 10,
        optionText.height / 2,
        optionText.width + 20,
        optionText.height + 10
      ).setStrokeStyle(2, 0xffff00)
       .setVisible(false);
      
      optionText.on("pointerover", () => border.setVisible(true));
      optionText.on("pointerout", () => border.setVisible(false));
      optionText.on("pointerdown", () => {
        // Type out the player's line and, when finished, add a continue option.
        this.typeText(playerText, () => {
          this.addContinueOption();
        });
        this.clearResponses();
      });
      
      optionContainer.add([border, optionText]);
      
      // Position the container within the dialogue box
      optionContainer.setPosition(textStartX, optionsY - index * 40);
      
      this.dialogueContainer.add(optionContainer);
      this.responseContainers.push(optionContainer);
    });
  }

  showResponses(responses, playerText = null, translation = null) {
    this.clearResponses();
    
    // Calculate positions
    const optionsY = this.getResponsePositionY();
    const textStartX = -this.boxWidth / 2 + 180; // Base from dialogue box left edge
    
    if (translation && translation.trim() !== "") {
      responses.unshift({
        text: "[Translate to modern english]",
        translation,
        originalText: this.fullText,
      });
    }
    
    responses.forEach((resp, index) => {
      // Create a container to hold each response option and its hitbox
      const optionContainer = this.scene.add.container(0, 0);
      optionContainer.setDepth(4);
      
      const responseText = resp.text || resp["text:"] || "...";
      const optionText = this.scene.add.text(
        0, // We'll position relative to container
        0,
        responseText,
        {
          font: "22px Inknut Antiqua",
          fill: "#ffff00",
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0);
      
      // Create border/hitbox for the option
      const border = this.scene.add.rectangle(
        optionText.width / 2 + 10,
        optionText.height / 2,
        optionText.width + 20,
        optionText.height + 10
      ).setStrokeStyle(2, 0xffff00)
       .setVisible(false);
      
      // Add interaction
      optionText.setInteractive();
      optionText.on("pointerover", () => border.setVisible(true));
      optionText.on("pointerout", () => border.setVisible(false));
      optionText.on("pointerdown", () => {
        if (resp.translation) {
          const originalText = resp.originalText || this.fullText;
          if (this.dialogueText.text === originalText) {
            this.dialogueText.setText(resp.translation);
            optionText.setText("[Show original]");
          } else {
            this.dialogueText.setText(originalText);
            optionText.setText("[Translate to modern english]");
          }
          return;
        }
        if (resp.isPlayerLine || playerText) {
          this.typeText(playerText || resp.text, () => {
            this.addContinueOption();
          });
          this.clearResponses();
          return;
        }
        this.clearResponses();
        this.nextDialogue();
      });
      
      // Add elements to container
      optionContainer.add([border, optionText]);
      
      // Position the container itself within the dialogue box coordinate space
      optionContainer.setPosition(textStartX, optionsY - index * 40);
      
      // Add the container to the dialogue container
      this.dialogueContainer.add(optionContainer);
      this.responseContainers.push(optionContainer);
    });
  }

  // Revised method for getting response position
  getResponsePositionY() {
    if (!this.dialogueText || !this.bg) return 0;
    
    // Calculate from the bottom of the dialogue text
    const textBottom = this.dialogueText.y + this.dialogueText.height;
    
    // Box bounds in local coordinates
    const boxTop = -this.boxHeight / 2;
    const boxBottom = this.boxHeight / 2;
    
    // Space between text bottom and box bottom
    const availableSpace = boxBottom - textBottom;
    
    // Calculate a position that's approximately 2/3 of the way down the available space
    // This will position responses lower in the box
    return textBottom + (availableSpace * 0.5);
  }

  clearResponses() {
    this.responseContainers.forEach((container) => container.destroy());
    this.responseContainers = [];
  }

  adjustBoxHeight() {
    if (!this.dialogueContainer || !this.bg) return;
    const textHeight = this.dialogueText.height + 40;
    const cam = this.scene.cameras.main;
    const baseH = cam.height * 0.15;
    const maxH = cam.height * 0.4;
    this.boxWidth = cam.width * 0.6;
    const newHeight = Math.min(baseH + textHeight, maxH);
    this.bg.setSize(this.boxWidth, Math.max(baseH, newHeight));
    this.boxHeight = Math.max(baseH, newHeight);
    const containerY = cam.height - 20 - this.boxHeight / 2;
    this.boxX = (cam.width - this.boxWidth) / 2;
    this.dialogueContainer.setPosition(this.boxX + this.boxWidth / 2, containerY);
    this.adjustPortraitAndName();
    this.adjustResponsePositions();
  }

  adjustPortraitAndName() {
    if (!this.dialogueContainer) return;
    this.portrait.setPosition(-this.boxWidth / 2 + 20, -this.boxHeight / 2 + 20);
    this.nameText.setPosition(this.portrait.x + 30, this.portrait.y + 60 + 10);
    this.dialogueText.setPosition(-this.boxWidth / 2 + 160, -this.boxHeight / 2 + 20);
  }

  // Completely revised response positioning
  adjustResponsePositions() {
    if (!this.dialogueContainer || this.responseContainers.length === 0) return;
    
    // Recalculate the vertical position for responses
    const optionsY = this.getResponsePositionY();
    const textStartX = -this.boxWidth / 2 + 180; // Base from dialogue box left edge
    
    // Position each response container
    this.responseContainers.forEach((container, i) => {
      // Set the container's position directly
      container.setPosition(textStartX, optionsY - i * 40);
    });
  }

  // Revised method for box resizing
  adjustBoxSize(width, height) {
    if (!this.dialogueContainer) return;
    
    // Recalculate box dimensions
    this.boxWidth = width * 0.6;
    this.boxX = (width - this.boxWidth) / 2;
    const containerY = height - 20 - this.boxHeight / 2;
    
    // Update box size and position
    this.bg.setSize(this.boxWidth, this.boxHeight);
    this.dialogueContainer.setPosition(this.boxX + this.boxWidth / 2, containerY);
    this.dialogueText.setWordWrapWidth(this.boxWidth - 200);
    
    // Update other elements
    this.adjustPortraitAndName();
    this.adjustResponsePositions();
  }

  typeText(text, onComplete) {
    this.fullText = text;
    this.currentText = "";
    this.textIndex = 0;
    this.dialogueText.setText("");
    if (this.textTimer) {
      this.textTimer.remove(false);
    }
    this.typeTextCallback = onComplete || null;
    this.textTimer = this.scene.time.addEvent({
      delay: this.typingSpeed,
      callback: this.typeNextLetter,
      callbackScope: this,
      loop: true,
    });
    this.scene.time.delayedCall(200, () => this.adjustBoxHeight());
  }

  typeNextLetter() {
    if (!this.dialogueText || !this.fullText) return;
    if (this.textIndex < this.fullText.length) {
      this.currentText += this.fullText[this.textIndex];
      this.dialogueText.setText(this.currentText);
      this.textIndex++;
      this.scene.time.delayedCall(50, () => this.adjustBoxHeight());
    } else {
      if (this.textTimer) {
        this.textTimer.remove(false);
      }
      if (this.typeTextCallback) {
        this.typeTextCallback();
        this.typeTextCallback = null;
      }
    }
  }

  // Improve continue option positioning
  addContinueOption() {
    const textStartX = -this.boxWidth / 2 + 180; // Consistent with other options
    
    // Calculate position relative to text
    const textBottom = this.dialogueText.y + this.dialogueText.height;
    const startY = textBottom + 20; // 20px below text
    
    // Create container
    const optionContainer = this.scene.add.container(textStartX, startY);
    optionContainer.setDepth(4);
    
    // Add text
    const optionText = this.scene.add.text(
      0,
      0,
      "...",
      {
        font: "18px Inknut Antiqua",
        fill: "#ffff00",
        padding: { x: 10, y: 5 },
      }
    ).setInteractive().setOrigin(0);
    
    // Add interaction
    optionText.on("pointerdown", () => {
      this.clearResponses();
      this.nextDialogue();
    });
    
    // Add to container
    optionContainer.add(optionText);
    this.dialogueContainer.add(optionContainer);
    this.responseContainers.push(optionContainer);
  }

  endDialogue() {
    this.scene.scale.off("resize", this.resizeListener);
    this.scene.time.removeAllEvents();
    if (this.dialogueContainer) {
      this.dialogueContainer.destroy();
      this.dialogueContainer = null;
      this.bg = null;
    }
    if (this.scene.player?.body) {
      this.scene.player.body.enable = true;
    }
    this.scene.inDialogue = false;
    this.isActive = false;
    this.isPaused = false;
    this.currentDialogueIndex = 0;
  }

  destroy() {
    this.scene.scale.off("resize", this.resizeListener);
    this.scene.time.removeAllEvents();
    if (this.dialogueContainer) {
      this.dialogueContainer.destroy();
    }
    this.removeAllIndicators();
    this.interactableNpcs.clear();
    this.isActive = false;
    this.scene.inDialogue = false;
    this.isPaused = false;
  }
}