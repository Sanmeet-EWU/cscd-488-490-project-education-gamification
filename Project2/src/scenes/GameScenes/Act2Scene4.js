import { BaseGameScene } from '../BaseGameScene.js';

export class Act2Scene4 extends BaseGameScene {
  constructor() {
    // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
    super('Act2Scene4');
    
    // Set to true if this is a cutscene without player movement
    this.isCutscene = true;
  }

  // Oldman, macduff, and ross 
  preload() {

    // Background
    if (!this.textures.exists('Act1Scene6Bg')) {
      //this.load.svg('Act2Scene1Bg', 'assets/act2/Act2Scene1BG.svg', { width: 2560, height: 1440 });
      this.load.svg('Act1Scene6Bg', 'assets/act1/Act1Scene6.svg', { width: 2560, height: 1440 });
    }//Outside macbeths castle
    
    // Dialogue JSON 1
    if (!this.cache.json.exists('Act2Scene4Data')) {
      this.load.json('Act2Scene4Data', 'SceneDialogue/Act2Scene4.json');
    }

    
    ////////////////////////////
    // Character spritesheets // 
    ////////////////////////////

    // Load Ross as player, old man and macduff as NPCs

    // Load Ross sprite sheets and JSON data
    if (!this.textures.exists('ross_idle_sheet')) {
        this.load.image('ross_idle_sheet', 'assets/characters/Ross_Idle.png');
    }
    if (!this.textures.exists('ross_walk_sheet')) {
        this.load.image('ross_walk_sheet', 'assets/characters/Ross_Walk.png');
    }
    if (!this.cache.json.exists('ross_idle_json')) {
        this.load.json('ross_idle_json', 'assets/characters/Ross_Idle.json');
    }
    if (!this.cache.json.exists('ross_walk_json')) {
        this.load.json('ross_walk_json', 'assets/characters/Ross_Walk.json');
    }

    //Load Macduff sprite sheets and JSON data
    if (!this.textures.exists('macduff_idle_sheet')) {
        this.load.image('macduff_idle_sheet', 'assets/characters/Macduff_Idle.png');
    }
    if (!this.textures.exists('macduff_walk_sheet')) {
        this.load.image('macduff_walk_sheet', 'assets/characters/Macduff_Walk.png');
    }
    if (!this.cache.json.exists('macduff_idle_json')) {
        this.load.json('macduff_idle_json', 'assets/characters/Macduff_Idle.json');
    }
    if (!this.cache.json.exists('macduff_walk_json')) {
        this.load.json('macduff_walk_json', 'assets/characters/Macduff_Walk.json');
    }

    // Load Old Man sprite sheets and JSON data
    if (!this.textures.exists('oldman_idle_sheet')) {
        this.load.image('oldman_idle_sheet', 'assets/characters/Old_man_idle.png');
    }
    if (!this.textures.exists('oldman_walk_sheet')) {
        this.load.image('oldman_walk_sheet', 'assets/characters/Old_man_walk.png');
    }
    if (!this.cache.json.exists('oldman_idle_json')) {
        this.load.json('oldman_idle_json', 'assets/characters/Old_man_idle.json');
    }
    if (!this.cache.json.exists('oldman_walk_json')) {
        this.load.json('oldman_walk_json', 'assets/characters/Old_man_walk.json');
    }

    // Backup guard
      if (!this.textures.exists('guardImg')) {
        this.load.image('guardImg', 'assets/characters/Guard.png');
      }
      if (!this.textures.exists('guard')) {
        this.load.json('guardData', 'assets/characters/guard.json');
      }
    
    // Character portraits for dialogue //Im ignoring the drunken porter, most of his dialogue was cut anyway
    this.load.image("rossportrait", "assets/portraits/Ross.png");
    this.load.image("macduffportrait", "assets/portraits/Macduff.png");
    this.load.image("oldmanportrait", "assets/portraits/OldMan.png");
    
    // Scene music
    this.load.audio('darkHallway', 'assets/audio/dark_hallway_synth_bg.mp3');//idk what good music would be, figure out later
    
    // Error handling for asset loading
    this.load.on('loaderror', (fileObj) => {
      console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
    });
  }

  create(data) {
    // Call parent create method
    super.create(data);
    const { width, height } = this.scale;
    this.nextSceneKey = 'Act3Scene1';
    
    // Check required assets
    const requiredAssets = [
        'Act1Scene6Bg',
        'Act2Scene4Data',
        'rossportrait',
        'macduffportrait',
        'oldmanportrait',
        'darkHallway'
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
    this.background = this.add.image(0, 0, 'Act1Scene6Bg')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(-1);
      //Its the next morning so no tint
      

    this.physics.world.setBounds(0, 0, width, height * .85)//setting the Y higher up to act as the floor
    

    // Play scene music
    if (this.audioController && this.cache.audio.exists('darkHallway')) {//Still sort of uneasy feeling during the play
      this.audioController.playMusic('darkHallway', this, { volume: 1.5, loop: true });
    }

    // Create floor for characters to stand on
    //this.createFloor();//Screw the floor
    
    
    // Create animations
    this.createAnimations();
    
    // Spawn macbeth
    this.setupPlayer();

    // Play eerie sting sound effect, upon macbeths entry
    //this.sound.add('sting').play({ loop: false, volume: this.audioController.soundVolume*.75});//Its hella loud

    // Create NPCs
    this.setupNPCs();
    
    // Setup dialogue
    this.setupSceneDialogue();

    //this.unlockExit = false;

    this.start();
  
    // Handle scene resize
    this.scale.on('resize', this.onResize, this);
    
    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });

  }

  start(){
    // Start dialogue for cutscenes
    if (this.isCutscene && this.dialogueManager) {
      // For cutscenes, automatically start dialogue
      this.dialogueManager.startDialogue("Macduff", () => {

          this.switchScene(this.nextSceneKey);//to act 3 scene 1

      });
    }
  }

  setupPlayer() {
    // Use Macbeth atlas for the player, or fallback to older options
    let texture, frame, animation;
    
    if (this.textures.exists('ross_idle_atlas')) {
        texture = 'ross_idle_atlas';
        frame = 'sprite1';
        animation = 'ross_idle';
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
        displayName: 'Ross',
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
        key: "Old Man",
        x: width * 0.55,
        y: height * 0.8,
        texture: 'old_man_idle_atlas',
        frame: 'sprite1',
        scale: 3,
        animationKey: 'old_man_idle',
        interactive: true,
        displayName: 'Old Man'
      },
      {
        key: "Macduff",
        x: width * 0.7,
        y: height * 0.8,
        texture: 'Macduff_idle_atlas',
        frame: 'sprite1',
        scale: 3,
        animationKey: 'macduff_idle',
        interactive: true,
        displayName: 'Macduff'
      }
    ];

    // Use the base class method to create NPCs
    this.createNPCs(npcConfigs);
    // this.npcs["Old Man"].flipX = true;
    // this.npcs["Macduff"].flipX = true;
  }

  setupSceneDialogue() {
    if (!this.cache.json.exists('Act2Scene4Data')) return;
    
    try {
      const dialogueData = this.cache.json.get('Act2Scene4Data');
      
      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "Ross" : "rossportrait",
        "Old Man" : "oldmanportrait",
        "Macduff" : "macduffportrait"
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, null);
    } catch (error) {
      console.error("Error setting up dialogue:", error);
    }
  }

  createAnimations() {
    this.setupRossAtlas();
    this.setupOldManAtlas();
    this.setupMacduffAtlas();
    this.setupGuardAtlas();
  }

  setupMacduffAtlas() {
    if (this.textures.exists('macduff_idle_sheet') && this.cache.json.exists('macduff_idle_json')) {
      // Convert the JSON to Phaser atlas format
      const idleJsonData = this.cache.json.get('macduff_idle_json');
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
        'macduff_idle_atlas',
        this.textures.get('macduff_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );

      // Create idle animation
      this.anims.create({
        key: 'macduff_idle',
        frames: idleJsonData.map(frame => ({ key: 'macduff_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    }
  }
  
  setupOldManAtlas() {
    if (this.textures.exists('old_man_idle_sheet') && this.cache.json.exists('old_man_idle_json')) {
      // Convert the JSON to Phaser atlas format
      const idleJsonData = this.cache.json.get('old_man_idle_json');
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
        'old_man_idle_atlas',
        this.textures.get('old_man_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );

      // Create idle animation
      this.anims.create({
        key: 'old_man_idle',
        frames: idleJsonData.map(frame => ({ key: 'old_man_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  setupRossAtlas() {
    if (this.textures.exists('ross_idle_sheet') && this.cache.json.exists('ross_idle_json')) {
      // Convert the JSON to Phaser atlas format
      const idleJsonData = this.cache.json.get('ross_idle_json');
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
        'ross_idle_atlas',
        this.textures.get('ross_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      
      // Create idle animation
      this.anims.create({
        key: 'ross_idle',
        frames: idleJsonData.map(frame => ({ key: 'ross_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Do the same for walk animation
    if (this.textures.exists('ross_walk_sheet') && this.cache.json.exists('ross_walk_json')) {
      const runJsonData = this.cache.json.get('ross_walk_json');
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
        'ross_walk_atlas',
        this.textures.get('ross_walk_sheet').getSourceImage(),
        runPhaserAtlas
      );
      
      // Create run animations
      this.anims.create({
        key: 'ross_left',
        frames: runJsonData.map(frame => ({ key: 'ross_walk_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
      
      this.anims.create({
        key: 'ross_right',
        frames: runJsonData.map(frame => ({ key: 'ross_walk_atlas', frame: frame.name })),
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
        if (this.anims.exists('ross_left')) {
          this.player.anims.play('ross_left', true);
          this.player.flipX = true;
        } else {
          this.player.anims.play('left', true);
        }
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        
        // Use Macbeth-specific animation if available
        if (this.anims.exists('ross_right')) {
          this.player.anims.play('ross_right', true);
          this.player.flipX = false;
        } else {
          this.player.anims.play('right', true);
        }
      } else {
        this.player.setVelocityX(0);
        
        // Use Macbeth-specific idle animation if available
        if (this.anims.exists('ross_idle')) {
          this.player.anims.play('ross_idle', true);
        } else {
          this.player.anims.play('idle', true);
        }
      }
    

    }
  }
  
  onResize(gameSize) {
    if (!this.scene.isActive('Act2Scene4')) return; // REPLACE: Scene key
    
    const { width, height } = gameSize;
    
    // Resize background
    if (this.background?.active) {
      this.background.setDisplaySize(width, height);
    }
    
    // The rest of NPC repositioning is now handled by super.updateNametags()
  }
}