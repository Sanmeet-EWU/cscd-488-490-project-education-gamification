import { BaseScene } from './BaseScene';
import { saveGameData, loadGameData } from "../../firebase/firebase.js";
import { DialogueManager } from '../DialogueManager.js';

export class BaseGameScene extends BaseScene {
  constructor(key = 'BaseGameScene') {
    super(key);
    // Core properties
    this.playerConfig = null;
    this.characterManager = null;
    this.isCutscene = false;
    this.isMinigame = false;  // New flag for minigame scenes
    this.npcs = {};
    this.interactText = null;
    this.debugText = null;
  }

  init(data) {
    // Use the data the scene passes in
    this.viewOnly = data?.viewOnly || false;
    this.isCutscene = data?.isCutscene || this.isCutscene;
    this.startingPosition = data?.position || { x: 100, y: 100 };
  }

  create(data) {
    super.create();

    // Initialize character manager if it doesn't exist
    if (!this.characterManager) {
      this.characterManager = null; // Replace with your character manager if available
    }

    // Setup keyboard inputs
    this.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.ESC]);
    if (this.game.canvas) {
      this.game.canvas.focus();
    }

    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Setup physics world
    const { width, height } = this.scale;
    this.physics.world.setBounds(0, 0, width, height);

    // If not a cutscene or minigame, optionally create floor
    if (!this.isCutscene && !this.isMinigame && this.playerConfig?.movementConstraint === 'horizontal') {
      this.createFloor();
    }

    // Setup pause state
    this.isPaused = false;

    // Setup Audio
    this.audioController = this.sys.game.globals.audioController;
    if (this.audioController) {
      this.audioController._currentSceneKey = this.scene.key;
      this.audioController._gameScenePaused = false;
      this.audioController._pausedSceneKey = null;
    }

    // Create interaction text if not a cutscene
    if (!this.isCutscene && !this.isMinigame) {
      this.interactText = this.add.text(
        width / 2,
        height / 2,
        'Press E to Interact',
        { 
          fontSize: '16px', 
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 2
        }
      ).setOrigin(0.5).setVisible(false).setDepth(100);
    }

    // Optional debug text
    this.debugText = this.add.text(10, 10, "Scene ready", { 
      fill: "#ffffff", 
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 }
    }).setDepth(1000);
  }

  /**
   * Creates the floor for platforming scenes
   */
  createFloor() {
    const { width, height } = this.scale;
    const groundY = height * 0.9;
    this.floor = this.physics.add.staticGroup();
    const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
    this.floor.add(ground);
    ground.setVisible(false);
  }

  /**
   * Creates a player character
   * @param {Object} config - Configuration options for the player
   */
  createPlayer(config = null) {
    // Skip player creation for minigames or cutscenes without players
    if (this.isMinigame) return null;

    // Use provided config or the scene's playerConfig
    const playerConfig = config || this.playerConfig;
    
    // If there's no config at all, skip player creation or warn
    if (!playerConfig) {
      console.warn("No playerConfig provided—no player created.");
      return null;
    }

    // Check if the texture actually exists
    const tex = playerConfig.texture;
    if (!this.textures.exists(tex)) {
      console.error(`Texture "${tex}" not found. Check your preload() or file path.`);
      return null;
    }

    try {
      // Create player
      this.player = this.physics.add.sprite(
        this.startingPosition?.x || 100,
        this.startingPosition?.y || 100,
        tex,
        playerConfig.frame || 0
      );
      
      this.player.setScale(playerConfig.scale || 1);
      this.player.setOrigin(0.5, 1.0);
      this.player.setCollideWorldBounds(true);
      this.player.setDepth(10);
      
      // Add gravity if needed
      if (playerConfig.movementConstraint === 'horizontal' && this.player.body) {
        this.player.body.setGravityY(300);
      }
      
      // Add floor collision
      if (this.floor) {
        this.physics.add.collider(this.player, this.floor);
      }
      
      // Create player nametag if displayName is provided
      if (playerConfig.displayName) {
        this.playerNameTag = this.add.text(
          this.player.x, 
          this.player.y - (this.player.height * 1.5),
          playerConfig.displayName,
          {
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
          }
        ).setOrigin(0.5).setDepth(11);
      }
      
      // Play animation if provided
      if (playerConfig.animation && this.anims.exists(playerConfig.animation)) {
        this.player.play(playerConfig.animation);
      }

      return this.player;
    } catch (error) {
      console.error("Error creating player sprite:", error);
      return null;
    }
  }

  /**
   * Creates NPCs in the scene
   * @param {Array} npcConfigs - Array of NPC configuration objects
   */
  createNPCs(npcConfigs) {
    if (!npcConfigs || !Array.isArray(npcConfigs)) return;
    
    npcConfigs.forEach(config => {
      // Skip if required properties are missing
      if (!config.key || !config.texture || !this.textures.exists(config.texture)) {
        console.warn(`Skipping NPC: missing key or texture: ${config.key}`);
        return;
      }
      
      // Create the NPC sprite
      const npc = this.physics.add.sprite(
        config.x, 
        config.y, 
        config.texture, 
        config.frame || 0
      );
      
      npc.setScale(config.scale || 1);
      npc.setOrigin(0.5, 1.0);
      npc.setDepth(config.depth || 5);
      
      // Add to npcs object
      this.npcs[config.key] = npc;
      
      // Make interactive if specified
      if (config.interactive || config.onClick) {
        npc.setInteractive();
        npc.on('pointerdown', () => {
          if (config.onClick) {
            config.onClick.call(this, config.key);
          } else {
            this.handleInteraction(config.key);
          }
        });
      }
      
      // Add physics properties
      if (config.physics !== false && npc.body) {
        // Add gravity if needed
        if (config.gravity) {
          npc.body.setGravityY(300);
        }
        
        // Add collision with floor
        if (this.floor) {
          this.physics.add.collider(npc, this.floor);
        }
      }
      
      // Create nametag
      if (config.displayName || config.nameTag) {
        const tagText = config.displayName || config.nameTag || config.key;
        const nameTag = this.add.text(
          npc.x, 
          npc.y - (npc.height * npc.scale * 1.2),
          tagText,
          {
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
          }
        ).setOrigin(0.5).setDepth(npc.depth + 1);
        
        this.npcs[config.key + "Tag"] = nameTag;
      }
      
      // Play animation if specified
      if (config.animationKey && this.anims.exists(config.animationKey)) {
        npc.play(config.animationKey);
      }
    });
  }

  /**
   * Sets up the dialogue manager for the scene
   * @param {Object} dialogueData - JSON data for dialogue
   * @param {Object} portraitMap - Mapping of character names to portrait textures
   * @param {String} playerKey - Key for the player character in dialogue
   */
  setupDialogue(dialogueData, portraitMap, playerKey = null) {
    if (!dialogueData) return null;
    
    try {
      this.dialogueManager = new DialogueManager(
        this,
        dialogueData,
        portraitMap,
        true,
        playerKey
      );
      
      // Register NPCs for dialogue indicators
      setTimeout(() => {
        Object.keys(this.npcs).forEach(key => {
          if (!key.endsWith('Tag')) {
            const npcTag = this.npcs[key + "Tag"];
            if (npcTag) {
              this.dialogueManager.registerNPC(key, this.npcs[key], npcTag);
            }
          }
        });
      }, 100);
      
      return this.dialogueManager;
    } catch (error) {
      console.error("Error setting up dialogue:", error);
      return null;
    }
  }

  /**
   * Handles interaction with an NPC
   * @param {String} npcKey - Key of the NPC to interact with
   */
  handleInteraction(npcKey) {
    if (this.dialogueManager && !this.dialogueManager.isActive) {
      // Stop player movement
      if (this.player?.body) {
        this.player.body.setVelocity(0, 0);
      }
      
      // Start dialogue with the NPC
      this.dialogueManager.startDialogue(npcKey, () => {
        console.log(`Dialogue with ${npcKey} completed`);
        // Override in child classes for custom behavior
      });
    }
  }

  /**
   * Checks if player is near an NPC for interaction
   */
  checkInteraction() {
    // Skip for minigames since they don't have player interaction with NPCs
    if (this.isMinigame) return;
    
    if (!this.player || !this.interactText) {
      if (this.interactText) this.interactText.setVisible(false);
      return;
    }

    let closestNPC = null;
    let closestDistance = Infinity;
    const interactDistance = 120; // Interaction radius
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Find closest NPC
    Object.keys(this.npcs).forEach(key => {
      if (key.endsWith('Tag')) return;
      const npc = this.npcs[key];
      if (!npc || !npc.active) return;
      
      const dist = Phaser.Math.Distance.Between(playerX, playerY, npc.x, npc.y);
      if (dist <= interactDistance && dist < closestDistance) {
        closestNPC = { key, npc };
        closestDistance = dist;
      }
    });

    // Show interaction prompt if near an NPC
    if (closestNPC) {
      this.interactText.setPosition(
        closestNPC.npc.x, 
        closestNPC.npc.y - (closestNPC.npc.height * 1.5) - 20
      );
      this.interactText.setVisible(true);
      
      // Check for interaction key press
      if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
        this.handleInteraction(closestNPC.key);
      }
    } else {
      this.interactText.setVisible(false);
    }
  }

  /**
   * Verifies that all required assets are loaded
   * @param {Array} requiredAssets - Array of asset keys to check
   * @return {Array} Array of missing assets, empty if all assets loaded
   */
  checkRequiredAssets(requiredAssets) {
    return requiredAssets.filter(asset => {
      const hasTexture = this.textures.exists(asset);
      const hasAudio   = this.cache.audio.exists(asset);
      const hasJson    = this.cache.json.exists(asset); // new
      return !(hasTexture || hasAudio || hasJson);
    });
  }

  update(time, delta) {
    if (this.isPaused) return;
    
    super.update(time, delta);
  
    // Check for pause key
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
      return;
    }
    
    // Skip player-specific update logic for minigames
    if (!this.isMinigame) {
      // Update player and NPC tags
      this.updateNametags();
      
      // Check for NPC interaction if not a cutscene
      if (!this.isCutscene && this.player && !this.dialogueManager?.isActive) {
        this.checkInteraction();
      }
    }
    
    // Update dialogue indicators
    if (this.dialogueManager) {
      this.dialogueManager.updateIndicators();
    }
  }
  
  /**
   * Updates positions of all character nametags
   */
  updateNametags() {
    // Skip for minigames
    if (this.isMinigame) return;
    
    // Update player nametag
    if (this.player && this.playerNameTag) {
      this.playerNameTag.setPosition(
        this.player.x, 
        this.player.y - (this.player.height * this.player.scale * 1.2)
      );
    }
    
    // Update NPC nametags
    Object.keys(this.npcs).forEach(key => {
      if (key.endsWith('Tag') && this.npcs[key]) {
        const npcKey = key.replace('Tag', '');
        const npc = this.npcs[npcKey];
        if (npc?.active) {
          this.npcs[key].setPosition(
            npc.x, 
            npc.y - (npc.height * npc.scale * 1.2)
          );
        }
      }
    });
  }

  async saveProgress() {
    if (this.viewOnly) return;
    try {
      const saveData = {
        scene: this.scene.key,
        position: this.player ? { x: this.player.x, y: this.player.y } : null,
        score: this.score || 0,
        inventory: this.inventory || []
      };
      await saveGameData(saveData);
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  async loadProgress() {
    try {
      const saveData = await loadGameData();
      if (saveData) {
        this.scene.start(saveData.scene, { position: saveData.position });
      }
    } catch (error) {
      console.error("Failed to load game:", error);
    }
  }

  togglePause() {
    if (this.ignoreNextESC) return;

    if (this.isPaused) {
      this.isPaused = false;
      this.physics.world.resume();
      this.scene.stop('PauseMenu');
      this.ignoreNextESC = true;
      this.time.delayedCall(300, () => (this.ignoreNextESC = false));
    } else {
      this.isPaused = true;
      this.physics.world.pause();
      if (this.player && typeof this.player.setVelocity === 'function') {
        this.player.setVelocity(0);
      }
      this.scene.launch('PauseMenu', { gameScene: this });
    }
  }
  
  // Clean up resources when scene is shut down
  shutdown() {
    if (this.characterManager) {
      this.characterManager.destroy();
    }
    if (this.dialogueManager) {
      this.dialogueManager.destroy();
    }
    super.shutdown();
  }
}