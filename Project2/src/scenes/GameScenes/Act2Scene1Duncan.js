import { BaseGameScene } from '../BaseGameScene.js';

export class Act2Scene1Duncan extends BaseGameScene {
  constructor() {
    // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
    super('Act2Scene1Duncan');
    
    // Set to true if this is a cutscene without player movement
    this.isCutscene = false;
  }

  // BANQUO, FLEANCE, and MACBETH 
  preload() {
    // REPLACE: Load your scene specific assets
    
    // Background
    if (!this.textures.exists('Act2DuncansRoom')) {
      //this.load.svg('Act2Scene1Bg', 'assets/act2/Act2Scene1BG.svg', { width: 2560, height: 1440 });
      this.load.svg('Act2DuncansRoom', 'assets/act2/duncans_bedroom_bg.svg', { width: 2560, height: 1440 });
    }
    
    // Dialogue JSON 1
    if (!this.cache.json.exists('Act2Scene1DataDuncan1')) {
      this.load.json('Act2Scene1DataDuncan1', 'SceneDialogue/Act2Scene1Duncan1.json');
    }
    // Dialogue JSON 2
    if (!this.cache.json.exists('Act2Scene1DataDuncan2')) {
      this.load.json('Act2Scene1DataDuncan2', 'SceneDialogue/Act2Scene1Duncan2.json');
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

    // Load duncan sprite sheets and JSON data
    if (!this.textures.exists('duncan_idle_sheet')) {
      this.load.image('duncan_idle_sheet', 'assets/characters/DuncanIdle.png');
    }
    if (!this.cache.json.exists('duncan_idle_json')) {
      this.load.json('duncan_idle_json', 'assets/characters/DuncanIdle.json');
    }

    // Backup guard
      if (!this.textures.exists('guardImg')) {
        this.load.image('guardImg', 'assets/characters/Guard.png');
      }
      if (!this.textures.exists('guard')) {
        this.load.json('guardData', 'assets/characters/guard.json');
      }
    
    // Character portraits for dialogue
    this.load.image("macbethportrait", "assets/portraits/Macbeth.png");
    
    // Scene music
    this.load.audio('darkHallway', 'assets/audio/dark_hallway_synth_bg.mp3');
    
    // Sound effects
    this.load.audio('sting', 'assets/audio/dark_hallway_sting.mp3');
    this.load.audio('stabbing', 'assets/audio/stabbing.mp3');

    // Load additional assets
    this.load.image('bed', 'assets/act2/bed.png');
    
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
      'Act2DuncansRoom'
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
    this.background = this.add.image(0, 0, 'Act2DuncansRoom')
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
    
    // Spawn macbeth
    this.setupPlayer();
    this.player.setDepth(2);
    this.player.flipX = true;//start facing the left

    // Play eerie sting sound effect, upon macbeths entry
    this.sound.add('sting').play({ loop: false, volume: this.audioController.soundVolume*.75});//Its hella loud

    // Create NPCs
    this.setupNPCs();
    this.npcs["Duncan"].angle = -90;
    this.npcs["Duncan"].setDepth(4);

    // Create bed
    this.add.image(width * 0.15, height * 0.8, 'bed').setScale(.5).setDepth(3);
    
    // Setup dialogue
    this.setupSceneDialogue1();
  
    // Handle scene resize
    this.scale.on('resize', this.onResize, this);
    
    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });

    this.physics.add.existing(this.npcs["Duncan"], true);
    this.physics.world.enable(this.npcs["Duncan"]);
    this.npcs["Duncan"].body.setSize(80, 80);
    this.npcs["Duncan"].body.setOffset(0.5);

    this.physics.add.existing(this.player, true);
    this.physics.world.enable(this.player);
    this.player.setCollideWorldBounds(true);
    this.player.body.setOffset(0.5);

    // Setup a collider for the player and Duncan
    this.physics.add.overlap(this.player, this.npcs["Duncan"], this.handleInteraction, null, this);

  }

  // Handles macbeth 'interacting' with sleeping Duncan
  handleInteraction() {
    // Check if player is close to Duncan
    console.log("Standing by Duncan");

    if(this.keys.interact.isDown){
      console.log("Press E on Duncan");
    }
    
    if(this.dialogueManager && this.keys.interact.isDown){
      console.log("Press E on Duncan");
      this.dialogueManager.startDialogue("Macbeth", () => {
        console.log("Interacting with Duncan");
        // Once he walks up to duncan, darken the screen, and play the stabbing sound effect
        this.cameras.main.fade(7000, 0, 0, 0);
        this.sound.add('stabbing').play({ loop: false, volume: this.audioController.soundVolume});

        this.time.delayedCall(1500, () =>  
          this.switchScene(this.nextSceneKey)
        );
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
        this.player.setPosition(width * 0.7, height * 0.85);
    }
  }

  setupNPCs() {
    const { width, height } = this.scale;

    const npcConfigs = [
      {
        key: "Duncan",
        x: width * 0.2,
        y: height * 0.8,
        texture: 'duncan_idle_atlas',
        frame: 'sprite1',
        scale: 2,
        animationKey: 'duncan_idle',
        interactive: true,
        displayName: 'Duncan'
      }
    ];

    // Use the base class method to create NPCs
    this.createNPCs(npcConfigs);
  }

  setupSceneDialogue1() {
    if (!this.cache.json.exists('Act2Scene1DataDuncan1')) return;
    
    try {
      const dialogueData = this.cache.json.get('Act2Scene1DataDuncan1');
      
      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "Macbeth": "macbethportrait",
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, null);
    } catch (error) {
      console.error("Error setting up dialogue:", error);
    }
  }

  setupSceneDialogue2() {//Idk if we even want to include his long monologue after, itll need to be broken up
    if (!this.cache.json.exists('Act2Scene1DataDuncan2')) return;
    
    try {
      const dialogueData = this.cache.json.get('Act2Scene1DataDuncan2');
      
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
    this.setupDuncanAtlas();
    this.setupGuardAtlas();
  }

  setupDuncanAtlas() {
    if (this.textures.exists('duncan_idle_sheet') && this.cache.json.exists('duncan_idle_json')) {
      const idleJsonData = this.cache.json.get('duncan_idle_json');
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
      this.textures.addAtlas(
        'duncan_idle_atlas',
        this.textures.get('duncan_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      this.anims.create({
        key: 'duncan_idle',
        frames: idleJsonData.map(frame => ({ key: 'duncan_idle_atlas', frame: frame.name })),
        frameRate: 3, // Slower animation cuz he sleepy catchin Z's
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
      const speed = 150;
      
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