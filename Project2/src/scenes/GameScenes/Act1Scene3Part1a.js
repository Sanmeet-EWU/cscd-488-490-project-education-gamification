import { BaseGameScene } from '../BaseGameScene.js';

export class Act1Scene3Part1a extends BaseGameScene {
  constructor() {
    // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
    super('Act1Scene3Part1a');
    
    // Set to true if this is a cutscene without player movement
    this.isCutscene = true;
  }

  preload() {

    // Background
    if (!this.textures.exists('background_witchden')) {
      this.load.svg('background_witchden', 'assets/act1/Act1Scene1EmptyBg.svg', { width: 2560, height: 1440 });
    }
    
    // Dialogue JSON
    if (!this.cache.json.exists('Act1Scene3Part1aData')) {
      this.load.json('Act1Scene3Part1aData', 'SceneDialogue/Act1Scene3Part1a.json');
    }

    // Load other character sprites (using guard as a generic sprite if needed)
    if (!this.textures.exists('witchData')) {
      console.log("Loading generic witch json");
      this.load.json('witchData', 'assets/characters/witchIdle.json');
    }
    console.log("Loading witch json complete");
    // Character spritesheets
    if (!this.textures.exists('WitchIdle')) {
      this.load.spritesheet('WitchIdle', 'assets/characters/B_witch_idle.png', {
        frameWidth: 32, frameHeight: 48
      });
    }
    
    // Character portraits for dialogue
    this.load.image('witch1portrait', 'assets/portraits/witch1portrait.png');
    this.load.image('witch2portrait', 'assets/portraits/witch2portrait.png');
    this.load.image('witch3portrait', 'assets/portraits/witch3portrait.png');
    this.load.image('banquoportrait', 'assets/portraits/Banquo.png');
    this.load.image('witchPortriatAll', 'assets/portraits/witchPortraitAll.png');
    
    // Scene music
    this.load.audio('witchMusic', 'assets/audio/act1scene1.mp3');//Same music from first time seeing the witch den
    
    // Sound effects
    this.load.audio('bubblingSounds', 'assets/audio/CauldronMixing.mp3');

    // Load additional assets as needed
    this.load.image('cauldron', 'assets/act1/witchPot.png');
    this.load.image('cauldronGas', 'assets/effects/cauldronGas.svg');//To animate this just flip it horizontally repeatedly
    
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
      'background_witchden', 
      'WitchIdle', 
      'witchMusic',
      'witch1portrait', 
      'witch2portrait', 
      'witch3portrait', 
      'banquoportrait'
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
    this.background = this.add.image(0, 0, 'background_witchden')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(-1);
    
    // Create animations
    this.createAnimations();
    
    // Play scene music
    if (this.audioController && this.cache.audio.exists('witchMusic')) {
      this.audioController.playMusic('witchMusic', this, { volume: 1, loop: true });
    }
    
    // Create player if not a cutscene
    if (!this.isCutscene) {
      this.setupPlayer();
    }
    
    // Create NPCs
    this.setupNPCs();
    
    // Setup dialogue
    this.setupSceneDialogue();


    ////////////////////////////////////
    // Position the other assets here //
    ////////////////////////////////////

    this.cauldron = this.add.image(width * 0.5, height * 0.7, 'cauldron').setScale(width * 0.0004).setDepth(2);
    this.gas = this.add.image(width * 0.5, height * 0.5, 'cauldronGas').setScale(width * 0.0004).setDepth(1);

    // wait a little bit before starting dialogue
    this.time.delayedCall(1000, () => this.start());
    
    // Handle scene resize
    this.scale.on('resize', this.onResize, this);
    
    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  start() {
    // Start dialogue for cutscenes
    console.log("Is this a cutscene? " + this.isCutscene + "  Is dialogue manager initialized? " + this.dialogueManager);
    if (this.isCutscene && this.dialogueManager) {
      console.log("Starting dialogue for cutscene...");
      // For cutscenes, automatically start dialogue
      this.dialogueManager.startDialogue("FirstWitch", () => {
        // Replace 'NextSceneName' with your next scene
        this.switchScene('Act1Scene3Part1b');//NextSceneName
      });
    }
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
        key: "Witch1",
        x: this.scale.width * 0.25,
        y: this.scale.height * 0.8,
        texture: 'WitchIdle',
        frame: 0,
        scale: 5,
        animationKey: 'witchIdleAnim',
        interactive: true,
        displayName: 'First Witch'
      },
      {
        key: "Witch2",
        x: this.scale.width * 0.65,
        y: this.scale.height * 0.8,
        texture: 'WitchIdle',
        frame: 0,
        scale: 5,
        animationKey: 'witchIdleAnim',
        interactive: true,
        displayName: 'Second Witch'
      },
      {
        key: "Witch3",
        x: this.scale.width * 0.80,
        y: this.scale.height * 0.8,
        texture: 'WitchIdle',
        frame: 0,
        scale: 5,
        animationKey: 'witchIdleAnim',
        interactive: true,
        displayName: 'Third Witch'
      }
      // Add more NPCs as needed
    ];
    
    // Use the base class method to create NPCs
    this.createNPCs(npcConfigs);
  }

  setupSceneDialogue() {
    console.log("Setting up scene dialogue...");
    console.log(this.cache.json.exists('Act1Scene3Part1aData'));
    if (!this.cache.json.exists('Act1Scene3Part1aData')) return;
    
    try {
      const dialogueData = this.cache.json.get('Act1Scene3Part1aData');
      
      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "First Witch": "witch1portrait",
        "Second Witch": "witch2portrait",
        "Third Witch": "witch3portrait",
        "Banquo": "banquoportrait",
        "The Witches": "witchPortriatAll", // just default to the first witch I guess
        "Stage Directions": null
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, null); // no player character in this scene

      // Register NPCs with dialogue manager
      setTimeout(() => {
        Object.keys(this.npcs).forEach(key => {
          if (!key.endsWith('Tag')) {
            console.log("Registering: " + key + ", " + this.npcs[key] + ", " + this.npcs[key+ "Tag"]);
            this.dialogueManager?.registerNPC(key, this.npcs[key], this.npcs[key + "Tag"]);
          }
        });
      }, 100);

      if(!this.dialogueManager) console.log("DialogueManager is null.");

      console.log("Dialogue setup complete.");
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

    this.anims.create({
      key: 'witchIdleAnim',
      frames: this.anims.generateFrameNumbers('WitchIdle', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1
    });

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

    
    // if (this.player) { // no playe in this scene
    //   const speed = 160;
      
    //   // Handle player movement
    //   if (this.keys.left.isDown) {
    //     this.player.setVelocityX(-speed);
    //     this.player.anims.play('walkLeft', true);
    //   } else if (this.keys.right.isDown) {
    //     this.player.setVelocityX(speed);
    //     this.player.anims.play('walkRight', true);
    //   } else {
    //     this.player.setVelocityX(0);
    //     this.player.anims.play('idleAnim', true);
    //   }
    // }
  }
  
  onResize(gameSize) {
    if (!this.scene.isActive('Act1Scene3Part1a')) return; // REPLACE: Scene key
    
    const { width, height } = gameSize;
    
    // Resize background
    if (this.background?.active) {
      this.background.setDisplaySize(width, height);
    }

    // Resize other scene elements here
    if (this.cauldron) {
      this.cauldron.setPosition(width * 0.5, height * 0.7);
      this.cauldron.setScale(width * 0.0004);
    }
    if (this.gas) {
      this.gas.setPosition(width * 0.5, height * 0.5);
      this.gas.setScale(width * 0.0004);
    }


    if (this.npcs) {
      Object.keys(this.npcs).forEach(key => {
        if (!key.endsWith('Tag') && this.npcs[key] == "Witch1") {
          console.log("in here")
          this.npcs[key].setPosition(width * 0.25, height * 0.8);
        }
      });
    }

    // // Reposition NPCs
    // if (this.npcs[key] == "Witch1") this.npcs[key].setPosition(width * 0.25, height * 0.8);
    // if (this.npcs[key] == "Witch2") this.npcs[key].setPosition(width * 0.65, height * 0.8);
    // if (this.npcs[key] == "Witch3") this.npcs[key].setPosition(width * 0.85, height * 0.8);
    // // Resize the witches
    // if (this.npcs) {
    //   Object.keys(this.npcs).forEach(key => {
    //     if (!key.endsWith('Tag') && this.npcs[key]) {
    //       this.npcs[key].setScale(5);
    //       // if (this.npcs[key + 'Tag']) {
    //       //   this.npcs[key + 'Tag'].setPosition(this.npcs[key].x, this.npcs[key].y - 40);
    //       // }
    //     }
    //   });
    // }
    
    
    // The rest of NPC repositioning is now handled by super.updateNametags()
    super.updateNametags();
  }
}