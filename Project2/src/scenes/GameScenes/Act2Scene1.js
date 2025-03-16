import { BaseGameScene } from '../BaseGameScene.js';

export class Act2Scene1 extends BaseGameScene {
  constructor() {
    // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
    super('Act2Scene1');
    
    // Set to true if this is a cutscene without player movement
    this.isCutscene = true;
  }

  // BANQUO, FLEANCE, and MACBETH 
  preload() {
    // REPLACE: Load your scene specific assets
    
    // Background
    if (!this.textures.exists('Act2StairsBg')) {
      //this.load.svg('Act2Scene1Bg', 'assets/act2/Act2Scene1BG.svg', { width: 2560, height: 1440 });
      this.load.svg('Act2StairsBg', 'assets/act2/Act2StairsBg.svg', { width: 2560, height: 1440 });
    }
    
    // Dialogue JSON 1
    if (!this.cache.json.exists('Act2Scene1DataPart1')) {
      this.load.json('Act2Scene1DataPart1', 'SceneDialogue/Act2Scene1Part1.json');
    }
    // Dialogue JSON 2
    if (!this.cache.json.exists('Act2Scene1DataPart2')) {
      this.load.json('Act2Scene1DataPart2', 'SceneDialogue/Act2Scene1Part2.json');
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
        if (!this.textures.exists('fleance_idle_sheet')) {
            this.load.image('fleance_idle_sheet', 'assets/characters/Boy_idle.png');
        }
        if (!this.textures.exists('fleace_walk_sheet')) {
            this.load.image('fleace_walk_sheet', 'assets/characters/Boy_walk.png');
        }
        if (!this.cache.json.exists('fleance_idle_json')) {
            this.load.json('fleance_idle_json', 'assets/characters/Boy_idle.json');
        }
        if (!this.cache.json.exists('fleance_walk_json')) {
            this.load.json('fleance_walk_json', 'assets/characters/Boy_walk.json');
        }

    // Load Banquo sprite sheets and JSON data
        if (!this.textures.exists('Banquo_idle_sheet')) {
            this.load.image('banquo_idle_sheet', 'assets/characters/Banquo_idle.png');
        }
        if (!this.textures.exists('fleace_walk_sheet')) {
            this.load.image('banquo_walk_sheet', 'assets/characters/Banquo_walk.png');
        }
        if (!this.cache.json.exists('banquo_idle_json')) {
            this.load.json('banquo_idle_json', 'assets/characters/Banquo_idle.json');
        }
        if (!this.cache.json.exists('banquo_walk_json')) {
            this.load.json('banquo_walk_json', 'assets/characters/Banquo_walk.json');
        }

    // Backup guard
      if (!this.textures.exists('guardImg')) {
        this.load.image('guardImg', 'assets/characters/Guard.png');
      }
      if (!this.textures.exists('guard')) {
        this.load.json('guardData', 'assets/characters/guard.json');
      }
    
    // Character portraits for dialogue
    this.load.image("banquoportrait", "assets/portraits/Banquo.png");
    this.load.image("fleanceportrait", "assets/portraits/Fleance.png");
    this.load.image("macbethportrait", "assets/portraits/Macbeth.png");
    
    // Scene music
    this.load.audio('darkHallway', 'assets/audio/dark_hallway_synth_bg.mp3');
    
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
    this.nextSceneKey = 'Act2Scene2';
    
    // Check required assets
    const requiredAssets = [
      'Act2StairsBg'
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
    this.background = this.add.image(0, 0, 'Act2StairsBg')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(-1);

    this.physics.world.setBounds(0, 0, width, height * .85)//setting the Y higher up to act as the floor
    

    // Play scene music
    if (this.audioController && this.cache.audio.exists('darkHallway')) {
      this.audioController.playMusic('darkHallway', this, { volume: 1.5, loop: true });
    }

    // Create floor for characters to stand on
    //this.createFloor();
    
    // Create animations
    this.createAnimations();
    
    //Usually we spawn the player here, however macbeth joins mid scene

    // Create NPCs
    this.setupNPCs();
    
    // Setup dialogue
    this.setupSceneDialogue1();

    this.unlockExit = false;
  
    // Handle scene resize
    this.scale.on('resize', this.onResize, this);
    
    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });

    // Start the scene after a short delay
    this.time.delayedCall(1500, () =>  
      this.start()
    );

  }

  start(){
    // Start dialogue for cutscenes
    if (this.isCutscene && this.dialogueManager) {
      // For cutscenes, automatically start dialogue
      this.dialogueManager.startDialogue("Banquo", () => {
          // Add in macbeth
          this.setupPlayer();
          // Load the main set of dialogue
          this.setupSceneDialogue2();

          this.time.delayedCall(1000, () =>  
            this.dialogueManager.startDialogue("Macbeth", () => {
            //spawn in an arrow to sgnify go right up the stairs
            this.showExitHint();
            this.unlockExit = true;
            })
          );

        // Replace 'NextSceneName' with your next scene
        //this.switchScene('NextSceneName');
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
        this.player.setPosition(width * 0.1, height * 0.8);
    }
  }

  setupNPCs() {
    const { width, height } = this.scale;

    const npcConfigs = [
      {
        key: "Banquo",
        x: width * 0.5,
        y: height * 0.8,
        texture: 'banquo_idle_atlas',
        frame: 'sprite1',
        scale: 3,
        animationKey: 'banquo_idle',
        interactive: true,
        displayName: 'Banquo'
      },
      {
        key: "Fleance",
        x: width * 0.4,
        y: height * 0.8,
        texture: 'fleance_idle_atlas',
        frame: 'sprite1',
        scale: 3,
        animationKey: 'fleance_idle',
        interactive: false,
        displayName: 'Fleance'
      }
    ];

    // Use the base class method to create NPCs
    this.createNPCs(npcConfigs);
    this.npcs["Banquo"].flipX = true;
  }

  setupSceneDialogue1() {
    if (!this.cache.json.exists('Act2Scene1DataPart1')) return;
    
    try {
      const dialogueData = this.cache.json.get('Act2Scene1DataPart1');
      
      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "Banquo": "banquoportrait",
        "Fleance": "fleanceportrait",
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, null);
    } catch (error) {
      console.error("Error setting up dialogue:", error);
    }
  }

  setupSceneDialogue2() {
    if (!this.cache.json.exists('Act2Scene1DataPart2')) return;
    
    try {
      const dialogueData = this.cache.json.get('Act2Scene1DataPart2');
      
      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "Banquo": "banquoportrait",
        "Fleance": "fleanceportrait",
        "Macbeth": "macbethportrait"
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, "Macbeth");
    } catch (error) {
      console.error("Error setting up dialogue:", error);
    }
  }

  createAnimations() {
    this.setupMacbethAtlas();
    this.setupGuardAtlas();
    this.setupBanquoAtlas();
    this.setupFleanceAtlas();
  }

  setupBanquoAtlas() {
    if (this.textures.exists('banquo_idle_sheet') && this.cache.json.exists('banquo_idle_json')) {
      // Convert the JSON to Phaser atlas format
      const idleJsonData = this.cache.json.get('banquo_idle_json');
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
        'banquo_idle_atlas',
        this.textures.get('banquo_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      
      // Create idle animation
      this.anims.create({
        key: 'banquo_idle',
        frames: idleJsonData.map(frame => ({ key: 'banquo_idle_atlas', frame: frame.name })),
        frameRate: .5,
        repeat: -1
      });
    }


  }

  setupFleanceAtlas() {
    if (this.textures.exists('fleance_idle_sheet') && this.cache.json.exists('fleance_idle_json')) {
      // Convert the JSON to Phaser atlas format
      const idleJsonData = this.cache.json.get('fleance_idle_json');
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
        'fleance_idle_atlas',
        this.textures.get('fleance_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );

      // Create idle animation
      this.anims.create({
        key: 'fleance_idle',
        frames: idleJsonData.map(frame => ({ key: 'fleance_idle_atlas', frame: frame.name })),
        frameRate: .5,
        repeat: -1
      });
    }
  }

  // Had to reduce the framerate for macbeth for some reason?
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
        frameRate: 8,
        repeat: -1
      });
      
      this.anims.create({
        key: 'macbeth_right',
        frames: runJsonData.map(frame => ({ key: 'macbeth_run_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  // Backup method for all
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

  showExitHint() {
    if (!this.exitHint && this.nextSceneKey) {
        const { width, height } = this.scale;  // Get current screen dimensions
        this.exitHint = this.add.text(
            width - 50,                        // Position near right edge
            height / 2,                        // Center vertically
            "→",                               // Arrow pointing right
            { 
                fontSize: '52px', 
                fill: '#ffff00',               // Yellow color
                stroke: '#000000',             // Black outline
                strokeThickness: 4             // Outline thickness
            }
        ).setOrigin(0.5).setDepth(100);       // Center the text and set depth
  
        // Add a pulsing animation for visibility
        this.tweens.add({
            targets: this.exitHint,
            alpha: 0.6,                        // Fade to 60% opacity
            duration: 800,                     // 800ms per pulse
            yoyo: true,                        // Fade back to full opacity
            repeat: -1                         // Repeat indefinitely
        });
    }
  }

  update(time, delta) {
    // Call parent update - handles pause, nametags, interaction, and dialogue indicators
    super.update(time, delta);
    
    // Skip additional updates if paused or in dialogue
    if (this.isPaused || this.dialogueManager?.isActive) return;


    // Check for exit
    if(this.unlockExit && this.player.x > this.scale.width * .95){
      console.log("exit")
      this.switchScene(this.nextScene)
    }

    
    if (this.player) {
      const speed = 100;
      
      // Handle player movement (Macbeth)
      if (this.keys.left.isDown && this.keys.right.isDown) {
        this.player.setVelocityX(0);

      } else if (this.keys.left.isDown) {
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
    if (!this.scene.isActive('SceneTemplate')) return; // REPLACE: Scene key
    
    const { width, height } = gameSize;
    
    // Resize background
    if (this.background?.active) {
      this.background.setDisplaySize(width, height);
    }
    
    // The rest of NPC repositioning is now handled by super.updateNametags()
  }
}