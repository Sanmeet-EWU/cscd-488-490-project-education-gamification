import { BaseGameScene } from '../BaseGameScene.js';

export class Act2Scene1 extends BaseGameScene {
  constructor() {
    // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
    super('Act2Scene1');
    
    // Set to true if this is a cutscene without player movement
    this.isCutscene = false;
  }

  // BANQUO, FLEANCE, and MACBETH 
  preload() {
    // REPLACE: Load your scene specific assets
    
    // Background
    if (!this.textures.exists('Act2Scene1Bg')) {
      this.load.svg('Act2Scene1Bg', 'assets/act2/Act2Scene1Bg.svg', { width: 2560, height: 1440 });
    }
    
    // Dialogue JSON
    if (!this.cache.json.exists('Act2Scene1Data')) {
      this.load.json('Act2Scene1Data', 'SceneDialogue/Act2Scene1.json');
    }
    
    ////////////////////////////
    // Character spritesheets //
    ////////////////////////////

    // Load Macbeth sprite sheets and JSON data
        if (!this.textures.exists('macbeth_idle_sheet')) {
        this.load.image('macbeth_idle_sheet', 'assets/characters/MacbethIdle.png');
        }
        if (!this.textures.exists('macbeth_run_sheet')) {
        this.load.image('macbeth_run_sheet', 'assets/characters/MacbethRun.png');
        }
        if (!this.cache.json.exists('macbeth_idle_json')) {
        this.load.json('macbeth_idle_json', 'assets/characters/MacbethIdle.json');
        }
        if (!this.cache.json.exists('macbeth_run_json')) {
        this.load.json('macbeth_run_json', 'assets/characters/MacbethRun.json');
        }
        
        // Legacy Macbeth sprite - keeping for compatibility
        if (!this.textures.exists('macbeth')) {
        this.load.spritesheet('macbeth', 'assets/characters/Macbeth.png', {
            frameWidth: 32, frameHeight: 48
        });
        }

    // Load Fleace sprite sheets and JSON data
        if (!this.textures.exists('fleace_idle_sheet')) {
            this.load.image('fleace_idle_sheet', 'assets/characters/Boy_idle.png');
        }
        if (!this.textures.exists('fleace_walk_sheet')) {
            this.load.image('fleace_walk_sheet', 'assets/characters/Boy_walk.png');
        }
        if (!this.cache.json.exists('macbeth_idle_json')) {
            this.load.json('macbeth_idle_json', 'assets/characters/MacbethIdle.json');
        }
        if (!this.cache.json.exists('Boy_walk_json')) {
            this.load.json('Boy_walk_json', 'assets/characters/Boy_walk.json');
        }
    
    // Character portraits for dialogue
    this.load.image("banquoportrait", "assets/portraits/Banquo.png");
    this.load.image("fleanceportrait", "assets/portraits/Fleance.png");
    this.load.image("macbethportrait", "assets/portraits/Macbeth.png");
    
    // Scene music
    //this.load.audio('sceneMusic', 'assets/audio/scenemusic.mp3');
    
    // Sound effects
    //this.load.audio('soundEffect1', 'assets/audio/effect.mp3');

     

    
    
    // Error handling for asset loading
    this.load.on('loaderror', (fileObj) => {
      console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
    });
  }

  create(data) {
    // Call parent create method
    super.create(data);
    const { width, height } = this.scale;
    
    // Check required assets
    const requiredAssets = [
      'Act2Scene1Bg'
    ];
    const missing = this.checkRequiredAssets(requiredAssets);
    if (missing.length > 0) {
      this.add.text(width / 2, height / 2, "Error: Missing assets\n" + missing.join(', '), {
        fontSize: '32px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);
      return;
    }

    // Fade in scene
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Setup background
    this.background = this.add.image(0, 0, 'Act2Scene1Bg')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(-1);
    
    // Create animations
    this.createAnimations();
    
    // Play scene music
    if (this.audioController && this.cache.audio.exists('sceneMusic')) {
      this.audioController.playMusic('sceneMusic', this, { volume: 1, loop: true });
    }
    
    // Create player if not a cutscene
    if (!this.isCutscene) {
      this.setupPlayer();
    }
    
    // Create NPCs
    this.setupNPCs();
    
    // Setup dialogue
    this.setupSceneDialogue();
    
    // Start dialogue for cutscenes
    if (this.isCutscene && this.dialogueManager) {
      // For cutscenes, automatically start dialogue
      this.dialogueManager.startDialogue("MainDialogue", () => {
        // Replace 'NextSceneName' with your next scene
        this.switchScene('NextSceneName');
      });
    }
    
    // Handle scene resize
    this.scale.on('resize', this.onResize, this);
    
    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  setupPlayer() {
    // REPLACE: Define player configuration
    const playerConfig = {
      texture: 'characterSprite',
      frame: 0,
      scale: 1.5,
      displayName: 'Character Name',
      animation: 'idleAnim',
      movementConstraint: 'horizontal' // or 'topdown'
    };
    
    // Use the base class method to create player
    this.player = this.createPlayer(playerConfig);
  }

  setupNPCs() {
    // REPLACE: Define your NPCs
    const npcConfigs = [
      {
        key: "NPC1",
        x: this.scale.width * 0.25,
        y: this.scale.height * 0.8,
        texture: 'characterSprite',
        frame: 0,
        scale: 1.5,
        animationKey: 'idleAnim',
        interactive: true,
        displayName: 'NPC Name'
      },
      // Add more NPCs as needed
    ];
    
    // Use the base class method to create NPCs
    this.createNPCs(npcConfigs);
  }

  setupSceneDialogue() {
    if (!this.cache.json.exists('SceneDialogueData')) return;
    
    try {
      const dialogueData = this.cache.json.get('SceneDialogueData');
      
      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "Character1": "portrait1",
        "Character2": "portrait2"
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, "PlayerCharacterName");
    } catch (error) {
      console.error("Error setting up dialogue:", error);
    }
  }

  createAnimations() {
    // REPLACE: Set up your character animations
    
    // Example animation setup
    if (!this.anims.exists('idleAnim')) {
      this.anims.create({
        key: 'idleAnim',
        frames: [{ key: 'characterSprite', frame: 0 }],
        frameRate: 10
      });
    }
    
    if (!this.anims.exists('walkLeft')) {
      this.anims.create({
        key: 'walkLeft',
        frames: this.anims.generateFrameNumbers('characterSprite', { 
          start: 0, end: 3 
        }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    if (!this.anims.exists('walkRight')) {
      this.anims.create({
        key: 'walkRight',
        frames: this.anims.generateFrameNumbers('characterSprite', { 
          start: 4, end: 7 
        }),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  update(time, delta) {
    // Call parent update - handles pause, nametags, interaction, and dialogue indicators
    super.update(time, delta);
    
    // Skip additional updates if paused or in dialogue
    if (this.isPaused || this.dialogueManager?.isActive) return;
    
    if (this.player) {
      const speed = 160;
      
      // Handle player movement
      if (this.keys.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play('walkLeft', true);
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play('walkRight', true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('idleAnim', true);
      }
    }
  }
  
  onResize(gameSize) {
    if (!this.scene.isActive('SceneTemplate')) return; // REPLACE: Scene key
    
    const { width, height } = gameSize;
    
    // Resize background
    if (this.background?.active) {
      this.background.setDisplaySize(width, height);
    }
    
    // The rest of NPC repositioning is now handled by super.updateNametags()
  }
}