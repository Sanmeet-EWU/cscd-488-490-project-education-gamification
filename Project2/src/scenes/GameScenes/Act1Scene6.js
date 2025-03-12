import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene6 extends BaseGameScene {
  constructor() {
    super('Act1Scene6');
    // This is Duncan's arrival at Macbeth's castle
    this.isCutscene = false;
  }

  preload() {
    // Load background
    if (!this.textures.exists('background_act1scene6')) {
      this.load.svg('background_act1scene6', 'assets/act1/Act1Scene6BG.svg', { width: 2560, height: 1440 });
    }
    
    // Dialogue JSON
    if (!this.cache.json.exists('Act1Scene6Data')) {
      this.load.json('Act1Scene6Data', 'SceneDialogue/Act1Scene6.json');
    }
    
    // Load Duncan character sprite
    if (!this.textures.exists('duncan_idle_sheet')) {
      this.load.image('duncan_idle_sheet', 'assets/characters/DuncanIdle.png');
    }
    if (!this.cache.json.exists('duncan_idle_json')) {
      this.load.json('duncan_idle_json', 'assets/characters/DuncanIdle.json');
    }
    
    // Load character sheets when available
    if (!this.textures.exists('duncan_run_sheet')) {
      this.load.image('duncan_run_sheet', 'assets/characters/DuncanRun.png');
    }
    if (!this.cache.json.exists('duncan_run_json')) {
      this.load.json('duncan_run_json', 'assets/characters/DuncanRun.json');
    }
    
    // Load other character sprites (using guard as a generic sprite if needed)
    if (!this.textures.exists('guardImg')) {
      this.load.image('guardImg', 'assets/characters/Guard.png');
    }
    if (!this.textures.exists('guard')) {
      this.load.json('guardData', 'assets/characters/guard.json');
    }
    
    // Character portraits for dialogue
    this.load.image("Duncan", "assets/portraits/Duncan.png");
    this.load.image("Banquo", "assets/portraits/Banquo.png");
    this.load.image("Lady Macbeth", "assets/portraits/LadyMacbeth.png");
    
    // Scene music
    this.load.audio('act1scene6Music', 'assets/audio/act1scene2.ogg');
    
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
      'background_act1scene6'
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

    // Setup background - castle exterior or castle grounds
    if (this.textures.exists('background_act1scene6')) {
      this.background = this.add.image(0, 0, 'background_act1scene6')
        .setOrigin(0, 0)
        .setDisplaySize(width, height)
        .setDepth(-1);
    } else {
      // Fallback to a color background - castle exterior color
      this.background = this.add.rectangle(0, 0, width, height, 0x4e342e)
        .setOrigin(0, 0)
        .setDepth(-1);
    }
    
    // Create floor for characters to stand on
    this.createFloor();
    
    // Setup guard atlas if needed for NPC characters
    this.setupGuardAtlas();
    
    // Setup Duncan's atlas
    this.setupDuncanAtlas();
    
    // Create animations
    this.createAnimations();
    
    // Play scene music
    if (this.audioController && this.cache.audio.exists('act1scene6Music')) {
      this.audioController.playMusic('act1scene6Music', this, { volume: 0.8, loop: true });
    }
    
    // Create player (Duncan)
    this.setupPlayer();
    
    // Create NPCs for the scene
    this.setupNPCs();
    
    // Setup dialogue
    this.setupSceneDialogue();
    
    // Handle scene resize
    this.scale.on('resize', this.onResize, this);
    
    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
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

  setupDuncanAtlas() {
    // Setup Duncan's atlases
    if (this.textures.exists('duncan_idle_sheet') && this.cache.json.exists('duncan_idle_json')) {
      // Convert the JSON to Phaser atlas format
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
      
      // Add atlas to texture manager
      this.textures.addAtlas(
        'duncan_idle_atlas',
        this.textures.get('duncan_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      
      // Create idle animation
      this.anims.create({
        key: 'duncan_idle',
        frames: idleJsonData.map(frame => ({ key: 'duncan_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Do the same for run animation
    if (this.textures.exists('duncan_run_sheet') && this.cache.json.exists('duncan_run_json')) {
      const runJsonData = this.cache.json.get('duncan_run_json');
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
        'duncan_run_atlas',
        this.textures.get('duncan_run_sheet').getSourceImage(),
        runPhaserAtlas
      );
      
      // Create run animations
      this.anims.create({
        key: 'duncan_left',
        frames: runJsonData.map(frame => ({ key: 'duncan_run_atlas', frame: frame.name })),
        frameRate: 10,
        repeat: -1
      });
      
      this.anims.create({
        key: 'duncan_right',
        frames: runJsonData.map(frame => ({ key: 'duncan_run_atlas', frame: frame.name })),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  setupPlayer() {
    // Use Duncan's atlas for the player if available, or fallback
    let texture, frame, animation;
    
    if (this.textures.exists('duncan_idle_atlas')) {
      texture = 'duncan_idle_atlas';
      frame = 'sprite1';
      animation = 'duncan_idle';
    } else if (this.textures.exists('guard')) {
      texture = 'guard';
      frame = 'sprite1';
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
      scale: 2.0,
      displayName: 'Duncan',
      animation: animation,
      movementConstraint: 'horizontal'
    };
    
    // Create the player
    this.player = this.createPlayer(playerConfig);
    
    // Position Duncan on left side of scene
    if (this.player) {
      const { width, height } = this.scale;
      this.player.setPosition(width * 0.3, height * 0.8);
    }
  }

  setupNPCs() {
    const { width, height } = this.scale;
    
    // Define the NPCs for this scene
    const npcConfigs = [
      {
        key: "Banquo",
        x: width * 0.5,
        y: height * 0.8,
        texture: 'guard',
        frame: 'sprite1',
        scale: 1.5,
        animationKey: 'idle',
        interactive: true,
        displayName: 'Banquo'
      },
      {
        key: "Lady Macbeth",
        x: width * 0.7,
        y: height * 0.8,
        texture: 'guard',
        frame: 'sprite1',
        scale: 1.5,
        animationKey: 'idle',
        interactive: true,
        displayName: 'Lady Macbeth'
      }
    ];
    
    // Create NPCs using base class method
    this.createNPCs(npcConfigs);
    
    // Add floor collision for NPCs
    if (this.floor) {
      Object.keys(this.npcs).forEach(key => {
        if (!key.endsWith('Tag') && this.npcs[key]) {
          this.physics.add.collider(this.npcs[key], this.floor);
        }
      });
    }
  }

  setupSceneDialogue() {
    if (!this.cache.json.exists('Act1Scene6Data')) {
      console.error("Act1Scene6Data JSON not found");
      return;
    }
    
    try {
      const dialogueData = this.cache.json.get('Act1Scene6Data');
      
      // Map character names to portrait texture keys
      const portraitMap = {
        "Duncan": "Duncan",
        "Banquo": "Banquo",
        "Lady Macbeth": "Lady Macbeth"
      };

      // Use base class method to setup dialogue with Duncan as player character
      this.setupDialogue(dialogueData, portraitMap, "Duncan");
      
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
    // Basic animations for all characters (used as fallbacks)
    
    // Idle animation
    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: [{ key: 'guard', frame: 'sprite1' }],
        frameRate: 10
      });
    }
    
    // Walking animations
    if (!this.anims.exists('left')) {
      this.anims.create({
        key: 'left',
        frames: [
          { key: 'guard', frame: 'sprite4' },
          { key: 'guard', frame: 'sprite5' },
          { key: 'guard', frame: 'sprite6' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
    
    if (!this.anims.exists('right')) {
      this.anims.create({
        key: 'right',
        frames: [
          { key: 'guard', frame: 'sprite7' },
          { key: 'guard', frame: 'sprite8' },
          { key: 'guard', frame: 'sprite9' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Note: Duncan's specific animations are created in setupDuncanAtlas()
  }
  
  createFloor() {
    const { width, height } = this.scale;
    const groundY = height * 0.9;
    this.floor = this.physics.add.staticGroup();
    const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
    this.floor.add(ground);
    ground.setVisible(false);
  }
  
  startDialogue(npcKey) {
    if (this.dialogueManager && !this.dialogueManager.isActive) {
      if (this.player?.body) {
        this.player.body.setVelocity(0, 0);
      }
      
      this.dialogueManager.startDialogue(npcKey, () => {
        console.log(`Dialogue with ${npcKey} completed`);
        // Handle scene progression after dialogue completes
        // this.switchScene('Act1Scene7');
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
      
      // Handle player movement (Duncan)
      if (this.keys.left.isDown) {
        this.player.setVelocityX(-speed);
        
        // Use Duncan-specific animation if available
        if (this.anims.exists('duncan_left')) {
          this.player.anims.play('duncan_left', true);
          this.player.flipX = false;
        } else {
          this.player.anims.play('left', true);
        }
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        
        // Use Duncan-specific animation if available
        if (this.anims.exists('duncan_right')) {
          this.player.anims.play('duncan_right', true);
          this.player.flipX = false;
        } else {
          this.player.anims.play('right', true);
        }
      } else {
        this.player.setVelocityX(0);
        
        // Use Duncan-specific idle animation if available
        if (this.anims.exists('duncan_idle')) {
          this.player.anims.play('duncan_idle', true);
        } else {
          this.player.anims.play('idle', true);
        }
      }
      
      // Auto-start dialogue with Lady Macbeth when Duncan gets close enough
      if (this.npcs["Lady Macbeth"] && !this.dialogueStarted) {
        const distToLadyMacbeth = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.npcs["Lady Macbeth"].x, this.npcs["Lady Macbeth"].y
        );
        
        if (distToLadyMacbeth < 120) {
          this.dialogueStarted = true;
          this.startDialogue("Lady Macbeth");
        }
      }
    }
  }
  
  onResize(gameSize) {
    if (!this.scene.isActive('Act1Scene6')) return;
    
    const { width, height } = gameSize;
    
    // Resize background
    if (this.background?.active) {
      if (this.background.type === 'Image') {
        this.background.setDisplaySize(width, height);
      } else {
        this.background.width = width;
        this.background.height = height;
      }
    }
    
    // Update floor position
    if (this.floor?.clear) {
      this.floor.clear();
      const groundY = height * 0.9;
      const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
      this.floor.add(ground);
      ground.setVisible(false);
    }
    
    // The rest of NPC repositioning is handled by super.updateNametags()
  }
}