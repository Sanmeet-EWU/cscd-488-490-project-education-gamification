import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene4 extends BaseGameScene {
  constructor() {
    super('Act1Scene4');
    
    // This scene features Macbeth in Duncan's court
    this.isCutscene = false;
  }

  preload() {
    // Load background
    if (!this.textures.exists('background_act1scene4')) {
      this.load.svg('background_act1scene4', 'assets/act1/act1scene4.svg', { width: 2560, height: 1440 });
    }
    
    // Dialogue JSON
    if (!this.cache.json.exists('Act1Scene4Data')) {
      this.load.json('Act1Scene4Data', 'SceneDialogue/Act1Scene4.json');
    }
    
    // Load Macbeth character sprite and other characters
    if (!this.textures.exists('macbeth')) {
      this.load.spritesheet('macbeth', 'assets/characters/Macbeth.png', {
        frameWidth: 32, frameHeight: 48
      });
    }
    
    // Load other character sprites (using guard as a generic sprite if needed)
    if (!this.textures.exists('guardImg')) {
      this.load.image('guardImg', 'assets/characters/Guard.png');
    }
    if (!this.textures.exists('guard')) {
      this.load.json('guardData', 'assets/characters/guard.json');
    }
    
    // Character portraits for dialogue
    this.load.image("Macbeth", "assets/portraits/Macbeth.png");
    this.load.image("Duncan", "assets/portraits/Duncan.png");
    this.load.image("Malcolm", "assets/portraits/Malcolm.png");
    this.load.image("Banquo", "assets/portraits/Banquo.png");
    
    // Scene music
    this.load.audio('act1scene4Music', 'assets/audio/act1scene2.ogg');
    
    this.load.on('loaderror', (fileObj) => {
      console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
    });
  }

  create(data) {
    // Call parent create method
    super.create(data);
    const { width, height } = this.scale;
    this.nextSceneKey = 'Act1Scene5';
    // Check required assets
    const requiredAssets = [
      'background_act1scene4'
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

    // Setup background - fallback to a plain color if the background image isn't available
    if (this.textures.exists('background_act1scene4')) {
      this.background = this.add.image(0, 0, 'background_act1scene4')
        .setOrigin(0, 0)
        .setDisplaySize(width, height)
        .setDepth(-1);
    } else {
      // Fallback to a color background - use a castle/court color
      this.background = this.add.rectangle(0, 0, width, height, 0x482c1c)
        .setOrigin(0, 0)
        .setDepth(-1);
    }
    
    // Create floor for characters to stand on
    this.createFloor();
    
    // Setup guard atlas if needed for NPC characters
    this.setupGuardAtlas();
    
    // Create animations
    this.createAnimations();
    
    // Play scene music
    if (this.audioController && this.cache.audio.exists('act1scene4Music')) {
      this.audioController.playMusic('act1scene4Music', this, { volume: 1, loop: true });
    }
    
    // Create player (Macbeth)
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

  setupPlayer() {
    // Use Macbeth sprite, or fallback to guard if not available
    const texture = this.textures.exists('macbeth') ? 'macbeth' : 'guard';
    const frame = texture === 'guard' ? 'sprite1' : 0;
    
    // Define player configuration
    const playerConfig = {
      texture: texture,
      frame: frame,
      scale: 1.5,
      displayName: 'Macbeth',
      animation: 'idle',
      movementConstraint: 'horizontal'
    };
    
    // Create the player (positioned on the left side)
    this.player = this.createPlayer(playerConfig);
    
    // Position Macbeth on right side of scene
    if (this.player) {
      const { width, height } = this.scale;
      this.player.setPosition(width * 0.3, height * 0.8);
    }
  }

  setupNPCs() {
    const { width, height } = this.scale;
    
    // Define the NPCs for this scene - position them in a court setting
    const npcConfigs = [
      {
        key: "Duncan",
        x: width * 0.5,
        y: height * 0.8,
        texture: 'guard',
        frame: 'sprite1',
        scale: 1.5,
        animationKey: 'idle',
        interactive: true,
        displayName: 'King Duncan'
      },
      {
        key: "Malcolm",
        x: width * 0.6,
        y: height * 0.8,
        texture: 'guard',
        frame: 'sprite1',
        scale: 1.5,
        animationKey: 'idle',
        interactive: true,
        displayName: 'Malcolm'
      },
      {
        key: "Banquo",
        x: width * 0.4,
        y: height * 0.8,
        texture: 'guard',
        frame: 'sprite1',
        scale: 1.5,
        animationKey: 'idle',
        interactive: true,
        displayName: 'Banquo'
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
    if (!this.cache.json.exists('Act1Scene4Data')) {
      console.error("Act1Scene4Data JSON not found");
      return;
    }
    
    try {
      const dialogueData = this.cache.json.get('Act1Scene4Data');
      
      // Map character names to portrait texture keys
      const portraitMap = {
        "Macbeth": "Macbeth",
        "Duncan": "Duncan",
        "Malcolm": "Malcolm",
        "Banquo": "Banquo"
      };

      // Use base class method to setup dialogue with Macbeth as player character
      this.setupDialogue(dialogueData, portraitMap, "Macbeth");
      
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
    // Basic animations for all characters
    
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
    
    // If we have specific Macbeth animations, add them here
    if (this.textures.exists('macbeth')) {
      // Custom Macbeth animations would go here
    }
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
      
      // Start the scene directly with Duncan speaking
      this.dialogueManager.startDialogue("Duncan", () => {
        console.log(`Dialogue completed`);
        // If this is a complete scene, we could auto-advance to the next scene
        this.time.delayedCall(2000, () => {
          // Example: Switch to next scene after dialogue completes
          // this.switchScene('Act1Scene5');
        });
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
      
      // Handle player movement (Macbeth)
      if (this.keys.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play('left', true);
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play('right', true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('idle', true);
      }
      
      // Check for starting dialogue
      // If player is near Duncan, automatically start the scene dialogue
      const distToDuncan = this.npcs.Duncan ? 
        Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.npcs.Duncan.x, this.npcs.Duncan.y
        ) : Infinity;
        
      if (distToDuncan < 120 && !this.dialogueStarted) {
        this.dialogueStarted = true;
        this.startDialogue("Duncan");
      }
    }
  }
  
  onResize(gameSize) {
    if (!this.scene.isActive('Act1Scene4')) return;
    
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
    
    // Reposition characters
    if (this.player) {
      this.player.setPosition(width * 0.3, height * 0.8);
    }
    
    if (this.npcs.Duncan) {
      this.npcs.Duncan.setPosition(width * 0.5, height * 0.8);
    }
    
    if (this.npcs.Malcolm) {
      this.npcs.Malcolm.setPosition(width * 0.6, height * 0.8);
    }
    
    if (this.npcs.Banquo) {
      this.npcs.Banquo.setPosition(width * 0.4, height * 0.8);
    }
    
    // The rest of nametag repositioning is handled by super.updateNametags()
    
    // Update dialogue box if active
    if (this.dialogueManager?.isActive && this.dialogueManager.adjustBoxSize) {
      this.dialogueManager.adjustBoxSize(width, height);
    }
  }
}