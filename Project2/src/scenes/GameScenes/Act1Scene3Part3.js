import { BaseGameScene } from '../BaseGameScene.js';

export class Act1Scene3Part3 extends BaseGameScene {
  constructor() {
    // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
    super('Act1Scene3Part3');
    
    // Set to true if this is a cutscene without player movement
    this.isCutscene = true;
  }

  // Macbeth and Banquo are on their way back to Fores to report to King Duncan after their victory, however they stumble upon three witches who make prophecies about their future.
  preload() {

    // Background
    if (!this.textures.exists('background_witchden')) {
      this.load.svg('background_witchden', 'assets/act1/Act1Scene1EmptyBg.svg', { width: 2560, height: 1440 });
    }
    
    // Dialogue JSON #1
    if (!this.cache.json.exists('Act1Scene3Part3aData')) {
      this.load.json('Act1Scene3Part3aData', 'SceneDialogue/Act1Scene3Part3a.json');
    }
    // Dialogue JSON #2
    if (!this.cache.json.exists('Act1Scene3Part3bData')) {
      this.load.json('Act1Scene3Part3bData', 'SceneDialogue/Act1Scene3Part3b.json');
    }

    // Character spritesheets - just need banquo and macbeth, and later ross and angus

      // Backup guard
      if (!this.textures.exists('guardImg')) {
        this.load.image('guardImg', 'assets/characters/Guard.png');
      }
      if (!this.textures.exists('guard')) {
        this.load.json('guardData', 'assets/characters/guard.json');
      }

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

    // Character portraits for dialogue
    this.load.image('banquoportrait', 'assets/portraits/Banquo.png');
    this.load.image('macbethpotrait', 'assets/portraits/Macbeth.png');
    this.load.image('rossportrait', 'assets/portraits/Ross.png');
    
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
      'witchMusic', 
      'banquoportrait',
      'macbethpotrait'

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
    
    this.physics.world.setBounds(0, 0, width, height * .8);//Im setting the Y higher up to act as the floor

    // Create floor for characters to stand on
    this.createFloor();

    // Setup guard atlas if needed for NPC characters
    this.setupGuardAtlas();
    
    // Setup Macbeth atlas for animations
    this.setupMacbethAtlas();
    
    // Create animations
    this.createAnimations();
    
    // Play scene music
    if (this.audioController && this.cache.audio.exists('witchMusic')) {
      this.audioController.playMusic('witchMusic', this, { volume: 1, loop: true });
    }
    
    // Create player if not a cutscene
    // if (!this.isCutscene) {
    //   this.setupPlayer();
    // }
    this.setupPlayer();
    
    // Create NPCs
    this.setupNPCs();

    this.dialogueComplete = false;
    
    // Setup dialogue
    this.setupSceneDialogue();

    ////////////////////////////////////
    // Position the other assets here //
    ////////////////////////////////////

    this.cauldron = this.add.image(width * 0.7, height * 0.7, 'cauldron').setScale(width * 0.0003).setDepth(2);
    this.gas = this.add.image(width * 0.7, height * 0.5, 'cauldronGas').setScale(width * 0.0003).setDepth(1);


    // wait a little bit before starting dialogue
    this.time.delayedCall(1000, () => this.start());

    
    
    
    // Handle scene resize
    this.scale.on('resize', this.onResize, this);
    
    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  start() {//Im trying two sets of dialogue, one to open with and the other for when ross and angus enter the scene
    //Start dialogue for cutscenes

      if (this.isCutscene && this.dialogueManager) {
        // For cutscenes, automatically start dialogue
        this.dialogueManager.startDialogue("Macbeth", () => {

          console.log("Ross and Angus enter the scene");

            this.setupNPCs2();
            // Setup dialogue
            this.setupSceneDialogue2();

          //this.switchScene('Act1Minigame');//NextSceneName
        });
      }
  }

  setupPlayer() {
      // Use Macbeth atlas for the player, or fallback to older options
      let texture, frame, animation;
      
      if (this.textures.exists('macbeth_idle_atlas')) {
          texture = 'macbeth_idle_atlas';
          frame = 'sprite1';
          animation = 'macbeth_idle';
      } else if (this.textures.exists('macbeth')) {
          texture = 'macbeth';
          frame = 0;
          animation = 'idle';
      } else {
          texture = 'guard';
          frame = 'sprite1';
          animation = 'idle';
      }
      
      // Define player configuration
      const playerConfig = {
          texture: texture,
          frame: frame,
          scale: 3.0, // Larger scale for Macbeth
          displayName: 'Macbeth',
          animation: animation,
          movementConstraint: 'horizontal'
      };
      
      // Create the player
      this.player = this.createPlayer(playerConfig);
      
      // Position Macbeth on center
      if (this.player) {
          const { width, height } = this.scale;
          this.player.setPosition(width * 0.5, height * 0.8);
          this.player.setFlipX(true);
      }
  }

  setupNPCs() {//Banquo is the only NPC to start out
    const { width, height } = this.scale;

    const npcConfigs = [
      {
        key: "Banquo",
        x: width * 0.4,
        y: height * 0.8,
        texture: 'guard',
        frame: 'sprite1',
        scale: 1.5,
        animationKey: 'idle',
        interactive: false,
        displayName: 'Banquo'
      }
      // Add more NPCs as needed
    ];
    
    // Use the base class method to create NPCs
    this.createNPCs(npcConfigs);
  }

  setupNPCs2() {//Ross and Angus
    const { width, height } = this.scale;

    const npcConfigs = [
      {
        key: "Ross",
        x: width * 0.65,
        y: height * 0.9,
        texture: 'guard',
        frame: 'sprite1',
        scale: 1.8,
        animationKey: 'idle',
        interactive: true,
        displayName: 'Ross'
      },
      {
        key: "Angus",
        x: width * 0.8,
        y: height * 0.9,
        texture: 'guard',
        frame: 'sprite1',
        scale: 1.8,
        animationKey: 'idle',
        interactive: true,
        displayName: 'Ross'
      }
      // Add more NPCs as needed
    ];
    
    // Use the base class method to create NPCs
    this.createNPCs(npcConfigs);

    // Make them look closer ot the fron of the stage
    this.npcs["Ross"].setDepth(100);
    this.npcs["Angus"].setDepth(100);

  }

  setupSceneDialogue() {
    if (!this.cache.json.exists('Act1Scene3Part3aData')) return;
    
    try {
      const dialogueData = this.cache.json.get('Act1Scene3Part3aData');
      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "Banquo": "banquoportrait",
        "Macbeth": "macbethpotrait",
        "Stage Directions": null
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, null); // no player character in this scene

      // Register NPCs with dialogue manager
      setTimeout(() => {
        Object.keys(this.npcs).forEach(key => {
          if (!key.endsWith('Tag')) {
            this.dialogueManager?.registerNPC(key, this.npcs[key], this.npcs[key + "Tag"]);
          }
        });
      }, 100);
    } catch (error) {
      console.error("Error setting up dialogue:", error);
    }
  }

  setupSceneDialogue2() {
    if (!this.cache.json.exists('Act1Scene3Part3bData')) return;
    
    try {
      const dialogueData = this.cache.json.get('Act1Scene3Part3bData');
      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "Banquo": "banquoportrait",
        "Macbeth": "macbethpotrait",
        "Ross": "rossportrait",
        "Angus": "",
        "Stage Directions": null
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, null); // no player character in this scene

      // Register NPCs with dialogue manager
      setTimeout(() => {
        Object.keys(this.npcs).forEach(key => {
          if (!key.endsWith('Tag')) {
            this.dialogueManager?.registerNPC(key, this.npcs[key], this.npcs[key + "Tag"]);
          }
        });
      }, 100);
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

  setupGuardAtlas() {
    const guardData = this.cache.json.get('guardData');
    if (guardData) {
      const phaserAtlas = { frames: {} };
      guardData.forEach(frame => {
        phaserAtlas.frames[frame.name] = {
          frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
          rotated: false,
          trimmed: false,
          sourceSize: { w: frame.width, h: frame.height },
          spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height }
        };
      });
      this.textures.addAtlas(
        'guard', 
        this.textures.get('guardImg').getSourceImage(), 
        phaserAtlas
      );
    }
  }

  setupMacbethAtlas() {
    // Setup Macbeth's atlases
    if (this.textures.exists('macbeth_idle_sheet') && this.cache.json.exists('macbeth_idle_json')) {
      // Convert the JSON to Phaser atlas format
      const idleJsonData = this.cache.json.get('macbeth_idle_json');
      const idlePhaserAtlas = { frames: {} };
      
      idleJsonData.forEach(frame => {
        idlePhaserAtlas.frames[frame.name] = {
          frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
          rotated: false,
          trimmed: false,
          sourceSize: { w: frame.width, h: frame.height },
          spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height }
        };
      });
      
      // Add atlas to texture manager
      this.textures.addAtlas(
        'macbeth_idle_atlas',
        this.textures.get('macbeth_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      
      // Create idle animation
      this.anims.create({
        key: 'macbeth_idle',
        frames: idleJsonData.map(frame => ({ key: 'macbeth_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Do the same for run animation
    if (this.textures.exists('macbeth_run_sheet') && this.cache.json.exists('macbeth_run_json')) {
      const runJsonData = this.cache.json.get('macbeth_run_json');
      const runPhaserAtlas = { frames: {} };
      
      runJsonData.forEach(frame => {
        runPhaserAtlas.frames[frame.name] = {
          frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
          rotated: false,
          trimmed: false,
          sourceSize: { w: frame.width, h: frame.height },
          spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height }
        };
      });
      
      this.textures.addAtlas(
        'macbeth_run_atlas',
        this.textures.get('macbeth_run_sheet').getSourceImage(),
        runPhaserAtlas
      );
      
      // Create run animations
      this.anims.create({
        key: 'macbeth_left',
        frames: runJsonData.map(frame => ({ key: 'macbeth_run_atlas', frame: frame.name })),
        frameRate: 10,
        repeat: -1
      });
      
      this.anims.create({
        key: 'macbeth_right',
        frames: runJsonData.map(frame => ({ key: 'macbeth_run_atlas', frame: frame.name })),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  update(time, delta) {
    // Call parent update - handles pause, nametags, interaction, and dialogue indicators
    super.update(time, delta);
    
    // Skip additional updates if paused or in dialogue
    if (this.isPaused || this.dialogueManager?.isActive) {
      if (this.player) {
        this.player.setVelocityX(0);
        // Use Macbeth-specific idle animation if available
        if (this.anims.exists('macbeth_idle')) {
          this.player.anims.play('macbeth_idle', true);
        } else {
          this.player.anims.play('idle', true);
        }
      }
    } //return;
      
    if (this.player) {
      const speed = 160;
      
      // Handle player movement (Macbeth)
      if (this.keys.left.isDown) {
        this.player.setVelocityX(-speed);
        
        // Use Macbeth-specific animation if available
        if (this.anims.exists('macbeth_left')) {
          this.player.anims.play('macbeth_left', true);
          this.player.flipX = true;
        } else {
          this.player.anims.play('left', true);
        }
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        
        // Use Macbeth-specific animation if available
        if (this.anims.exists('macbeth_right')) {
          this.player.anims.play('macbeth_right', true);
          this.player.flipX = false;
        } else {
          this.player.anims.play('right', true);
        }
      } else {
        this.player.setVelocityX(0);
        
        // Use Macbeth-specific idle animation if available
        if (this.anims.exists('macbeth_idle')) {
          this.player.anims.play('macbeth_idle', true);
        } else {
          this.player.anims.play('idle', true);
        }
      }
    

    }
  
  }
  
  onResize(gameSize) {
    if (!this.scene.isActive('Act1Scene3Part3')) return; // REPLACE: Scene key
    
    const { width, height } = gameSize;
    
    // Resize background
    if (this.background?.active) {
      this.background.setDisplaySize(width, height);
    }

    // Resize other scene elements here
    if (this.cauldron) {
      this.cauldron.setPosition(width * 0.7, height * 0.7);
      this.cauldron.setScale(width * 0.0003);
    }
    if (this.gas) {
      this.gas.setPosition(width * 0.7, height * 0.5);
      this.gas.setScale(width * 0.0003);
    }

     // Update floor position
     if (this.floor?.clear) {
      this.floor.clear();
      const groundY = height * 0.9;
      const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
      this.physics.add.existing(ground, true);
      ground.body.setImmovable(true);
      this.floor.add(ground);
      ground.setVisible(false);
      
      // Important: Refresh the physics body
      this.floor.refresh();
      
      // Re-add colliders
      if (this.player) {
        this.physics.add.collider(this.player, this.floor);
      }
      
      if (this.npcs) {
        Object.keys(this.npcs).forEach(key => {
          if (!key.endsWith('Tag') && this.npcs[key]) {
            this.physics.add.collider(this.npcs[key], this.floor);
          }
        });
      }
    }
    
    // The rest of NPC repositioning is now handled by super.updateNametags()
    super.updateNametags();
  }
}