// In Act1Scene2.js
import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene2 extends BaseGameScene {
  constructor() {
    super('Act1Scene2');
    this.isCutscene = false;
    this.npcs = {};
    this.interactText = null;
    // Flag to prevent re-initiating dialogue once fully complete
    this.dialogueFullyComplete = false;
  }

  preload() {
    this.load.svg('background_act1scene2', 'assets/act1/act1scene2.svg', { width: 2560, height: 1440 });
    this.load.json('Act1Scene2Data', 'SceneDialogue/Act1Scene2.json');
    
    // Load guard image and JSON
    this.load.image('guardImg', 'assets/characters/Guard.png');
    this.load.json('guardData', 'assets/characters/guard.json');
    
    // Load Duncan character sprite sheets and JSON data
    if (!this.textures.exists('duncan_idle_sheet')) {
      this.load.image('duncan_idle_sheet', 'assets/characters/DuncanIdle.png');
    }
    if (!this.textures.exists('duncan_run_sheet')) {
      this.load.image('duncan_run_sheet', 'assets/characters/DuncanRun.png');
    }
    if (!this.cache.json.exists('duncan_idle_json')) {
      this.load.json('duncan_idle_json', 'assets/characters/DuncanIdle.json');
    }
    if (!this.cache.json.exists('duncan_run_json')) {
      this.load.json('duncan_run_json', 'assets/characters/DuncanRun.json');
    }
    
    // Load portrait assets
    this.load.image("Captain", "assets/portraits/Captain.png");
    this.load.image("Malcolm", "assets/portraits/Malcolm.png");
    this.load.image("Ross", "assets/portraits/Ross.png");
    this.load.image("Duncan", "assets/portraits/Duncan.png");
    
    // Load minigame portal asset
    this.load.image("minigame_portal", "assets/ui/minigame_portal.png");
    
    this.load.audio('act1scene2Music', 'assets/audio/act1scene2.ogg');
  }

  create(data) {
    // Call parent method but avoid player creation from parent
    super.create(data);
    this.nextSceneKey = 'Act1Scene3Part1';
    const { width, height } = this.scale;
    // Setup background
    this.background = this.add.rectangle(0, 0, width, height, 0x333333)
      .setOrigin(0, 0)
      .setDepth(-1);
      
    if (this.textures.exists('background_act1scene2')) {
      this.background.destroy();
      this.background = this.add.image(0, 0, 'background_act1scene2')
        .setOrigin(0, 0)
        .setDisplaySize(width, height)
        .setDepth(-1);
    }
    
    // Create floor FIRST (before characters)
    this.createFloor();
    
    // Create the guard atlas directly
    this.setupGuardAtlas();
    
    // Setup Duncan's atlas
    this.setupDuncanAtlas();
    
    // THE IMPORTANT PART: Keep using guard sprite for physics but load Duncan animations
    // Create the player (Duncan) USING THE ORIGINAL WORKING CODE
    this.player = this.physics.add.sprite(width * 0.1, height * 0.8, 'guard', 'sprite1');
    this.player.setScale(2.0);
    this.player.setOrigin(0.5, 1.0);
    this.player.setCollideWorldBounds(true);
    this.player.depth = 10; // Ensure player is above other elements
    this.player.displayName = 'Duncan'; // Add this for animation logic
    
    // Add floor collision for player
    if (this.floor) {
      this.physics.add.collider(this.player, this.floor);
    }
    
    // Create player nametag - position at top of head
    this.playerNameTag = this.add.text(
      this.player.x, 
      this.player.y - (this.player.height * 1.5),
      'Duncan', 
      {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5).setDepth(11);
    
    // Create NPCs
    this.createNPCs();
    
    // Create minigame portal at the far right of the screen
    this.createMinigamePortal(width, height);
    
    // "Press E to Interact" text
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
    
    // Scene setup
    this.cameras.main.stopFollow();
    this.physics.world.setBounds(0, 0, width, height);
    
    // Lower gravity for better control
    this.physics.world.gravity.y = 300;
    
    // Play music
    const audioController = this.sys.game.globals.audioController;
    if (audioController) {
      audioController.stopMusic();
      if (this.cache.audio.exists('act1scene2Music')) {
        audioController.playMusic('act1scene2Music', this, { volume: 1, loop: true });
      }
    }

    // Setup dialogue if JSON exists
    if (this.cache.json.exists('Act1Scene2Data')) {
      try {
        const dialogueData = this.cache.json.get('Act1Scene2Data');
        console.log("Loaded dialogue data:", Object.keys(dialogueData));
        
        // Define a portrait map so that speaker names match the loaded portraits.
        const portraitMap = {
          "Captain": "Captain",
          "Malcolm": "Malcolm",
          "Ross": "Ross",
          "Duncan": "Duncan"
        };

        // Pass the portraitMap and set "Duncan" as the player character
        this.dialogueManager = new DialogueManager(
          this,
          dialogueData,
          portraitMap,
          true,
          "Duncan"
        );
        
        // Register NPCs (delay slightly to ensure NPCs exist)
        setTimeout(() => {
          this.dialogueManager.registerNPC('Malcolm', this.npcs.Malcolm, this.npcs.MalcolmTag);
          this.dialogueManager.registerNPC('Captain', this.npcs.Captain, this.npcs.CaptainTag);
          this.dialogueManager.registerNPC('Ross', this.npcs.Ross, this.npcs.RossTag);
        }, 100);
      } catch (error) {
        console.error("Error setting up dialogue:", error);
      }
    }
    
    // Debug text
    this.frameText = this.add.text(10, 10, "Ready", { 
      fill: "#ffffff", 
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 }
    });
  }
  
  createFloor() {
    const { width, height } = this.scale;
    const groundY = height * 0.9;
    this.floor = this.physics.add.staticGroup();
    const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
    this.floor.add(ground);
    ground.setVisible(false);
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
      
      // Create run animations - we'll use this animation for both left and right movement
      this.anims.create({
        key: 'duncan_run',
        frames: runJsonData.map(frame => ({ key: 'duncan_run_atlas', frame: frame.name })),
        frameRate: 10,
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
      this.anims.create({
        key: 'idle',
        frames: [{ key: 'guard', frame: 'sprite1' }],
        frameRate: 10
      });
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
  }
  
  createMinigamePortal(width, height) {
    // Create an interactive portal/station at the far right of the screen
    const portalX = width * 0.95;
    const portalY = height * 0.9;
    
    // Create portal sprite or rectangle
    if (this.textures.exists('minigame_portal')) {
      this.minigamePortal = this.add.image(portalX, portalY, 'minigame_portal');
      this.minigamePortal.setScale(1.5);
      this.minigamePortal.setOrigin(0.5, 1.0);
    } else {
      // Fallback if image isn't loaded
      this.minigamePortal = this.add.rectangle(portalX, portalY - 50, 80, 100, 0x00ff00, 0.7);
      this.minigamePortal.setStrokeStyle(2, 0xffffff);
    }
    
    // Add floating animation
    this.tweens.add({
      targets: this.minigamePortal,
      y: portalY - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add glowing effect
    this.tweens.add({
      targets: this.minigamePortal,
      alpha: 0.7,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add portal label
    this.minigameLabel = this.add.text(
      portalX,
      portalY - 110,
      'Battle Report\nTranslator',
      {
        fontSize: '16px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Create interaction zone (larger than the visual element for easier interaction)
    this.minigameZone = this.add.zone(portalX, portalY - 50, 150, 150).setInteractive();
    
    // Store portal position for checking proximity
    this.minigamePortalPosition = { x: portalX, y: portalY };
  }
  
  createNPCs() {
    const { width, height } = this.scale;
    
    // Create Malcolm
    this.npcs.Malcolm = this.physics.add.sprite(width * 0.25, height * 0.8, 'guard', 'sprite1');
    this.npcs.Malcolm.setScale(1.5);
    this.npcs.Malcolm.setOrigin(0.5, 1.0);
    this.npcs.Malcolm.setInteractive();
    this.npcs.Malcolm.body.setGravityY(300);
    this.npcs.Malcolm.on('pointerdown', () => this.startDialogue('Malcolm'));
    
    // Malcolm nametag
    this.npcs.MalcolmTag = this.add.text(
      this.npcs.Malcolm.x, 
      this.npcs.Malcolm.y - (this.npcs.Malcolm.height * 1.5),
      'Malcolm', 
      {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
    
    // Create Captain
    this.npcs.Captain = this.physics.add.sprite(width * 0.60, height * 0.8, 'guard', 'sprite1');
    this.npcs.Captain.setScale(1.5);
    this.npcs.Captain.setOrigin(0.5, 1.0);
    this.npcs.Captain.setInteractive();
    this.npcs.Captain.body.setGravityY(300);
    this.npcs.Captain.on('pointerdown', () => this.startDialogue('Captain'));
    
    // Captain nametag
    this.npcs.CaptainTag = this.add.text(
      this.npcs.Captain.x, 
      this.npcs.Captain.y - (this.npcs.Captain.height * 1.5),
      'Captain', 
      {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
    
    // Create Ross
    this.npcs.Ross = this.physics.add.sprite(width * 0.80, height * 0.8, 'guard', 'sprite1');
    this.npcs.Ross.setScale(1.5);
    this.npcs.Ross.setOrigin(0.5, 1.0);
    this.npcs.Ross.setInteractive();
    this.npcs.Ross.body.setGravityY(300);
    this.npcs.Ross.on('pointerdown', () => this.startDialogue('Ross'));
    
    // Ross nametag
    this.npcs.RossTag = this.add.text(
      this.npcs.Ross.x, 
      this.npcs.Ross.y - (this.npcs.Ross.height * 1.5),
      'Ross', 
      {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
    
    // Floor collision for NPCs
    if (this.floor) {
      this.physics.add.collider(this.npcs.Malcolm, this.floor);
      this.physics.add.collider(this.npcs.Captain, this.floor);
      this.physics.add.collider(this.npcs.Ross, this.floor);
    }
  }

  update(time, delta) {
    // Call parent update
    super.update(time, delta);
    
    // Skip additional updates if paused or in dialogue
    if (this.isPaused || this.dialogueManager?.isActive) return;
    
    if (this.player) {
      const speed = 250;
      
      // Update player nametag
      if (this.playerNameTag) {
        this.playerNameTag.setPosition(this.player.x, this.player.y - (this.player.height * 1.5));
      }
      
      // Update NPC nametags
      Object.keys(this.npcs).forEach(key => {
        if (key.endsWith('Tag') && this.npcs[key]) {
          const npcKey = key.replace('Tag', '');
          if (this.npcs[npcKey]) {
            this.npcs[key].setPosition(
              this.npcs[npcKey].x, 
              this.npcs[npcKey].y - (this.npcs[npcKey].height * 1.5)
            );
          }
        }
      });
      
      // Debug text update
      if (this.frameText) {
        this.frameText.setText(`Frame: ${this.player.frame.name || 'unknown'}`);
      }
      
      // Handle player movement
      if (this.keys.left.isDown) {
        this.player.setVelocityX(-speed);
        
        // Use Duncan-specific animation if available
        if (this.anims.exists('duncan_run')) {
          this.player.anims.play('duncan_run', true);
          this.player.flipX = true; // Flip sprite horizontally when moving left
        } else {
          this.player.anims.play('left', true);
        }
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        
        // Use Duncan-specific animation if available
        if (this.anims.exists('duncan_run')) {
          this.player.anims.play('duncan_run', true);
          this.player.flipX = false; // Don't flip when moving right
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
      
      // Check for NPC interaction (E key press)
      this.checkInteraction();
      
      // Check for minigame portal interaction
      this.checkMinigamePortal();
      
      // Update dialogue indicators if dialogueManager exists
      if (this.dialogueManager) {
        this.dialogueManager.updateIndicators();
      }
      
      // Scene transition logic (only after dialogue is complete)
      if (this.dialogueFullyComplete && this.nextSceneKey) {
        if (this.player.x > width - 50) {
          if (!this.transitionActive) {
            this.transitionActive = true;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start(this.nextSceneKey);
            });
          }
        }
      }
    }
  }
  
 
  
  checkMinigamePortal() {
    // Check if player is within the minigame zone
    if (!this.minigameZone || !this.player) return;
    
    const bounds = this.minigameZone.getBounds();
    const playerBounds = this.player.getBounds();
    
    if (Phaser.Geom.Rectangle.Overlaps(bounds, playerBounds)) {
      this.interactText.setPosition(
        this.minigamePortalPosition.x,
        this.minigamePortalPosition.y - 140
      );
      this.interactText.setText('Press E to Start Minigame');
      this.interactText.setVisible(true);
      
      // Highlight the portal
      this.minigamePortal.setAlpha(1);
      
      if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
        this.startMinigame();
      }
    } else if (this.interactText.text === 'Press E to Start Minigame') {
      this.interactText.setVisible(false);
    }
  }
  
  startMinigame() {
    console.log("Starting Battle Report Translator minigame");
    
    // Transition effect
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Switch to the minigame scene
      this.scene.start('Act1Scene2Minigame');
    });
  }
  
  startDialogue(npcKey) {
    // Prevent re-initiating dialogue if already complete
    if (this.dialogueFullyComplete) {
      console.log("Dialogue already complete; cannot re-initiate.");
      return;
    }
    if (this.dialogueManager && !this.dialogueManager.isActive) {
      if (this.player?.body) {
        this.player.body.setVelocity(0, 0);
      }
      // Pass the actual npcKey
      this.dialogueManager.startDialogue(npcKey, (isEndScene) => {
        console.log("Dialogue completed, endScene:", isEndScene);
        if (isEndScene) {
          this.dialogueFullyComplete = true;
          this.showExitHint();
        }
      });
    }
  }
  
  showExitHint() {
    if (!this.exitHint && this.nextSceneKey) {
      const { width, height } = this.scale;
      this.exitHint = this.add.text(
        width - 50, 
        height / 2,
        "→",
        { 
          fontSize: '32px', 
          fill: '#ffff00',
          stroke: '#000000',
          strokeThickness: 4
        }
      ).setOrigin(0.5).setDepth(100);
      
      // Add a pulsing animation
      this.tweens.add({
        targets: this.exitHint,
        alpha: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  repositionUI({ width, height }) {
    if (this.background) {
      if (this.background.type === 'Image') {
        this.background.setDisplaySize(width, height);
      } else {
        this.background.width = width;
        this.background.height = height;
      }
    }
    this.physics.world.setBounds(0, 0, width, height);
    
    // Update floor position
    if (this.floor?.clear) {
      this.floor.clear();
      const groundY = height * 0.9;
      const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
      this.floor.add(ground);
      ground.setVisible(false);
    }
    
    // Reposition player (Duncan)
    if (this.player) {
      this.player.setPosition(width * 0.1, height * 0.8);
    }
    
    // Reposition NPCs
    if (this.npcs.Malcolm) this.npcs.Malcolm.setPosition(width * 0.25, height * 0.8);
    if (this.npcs.Captain) this.npcs.Captain.setPosition(width * 0.60, height * 0.8);
    if (this.npcs.Ross) this.npcs.Ross.setPosition(width * 0.80, height * 0.8);
    
    // Reposition minigame portal
    if (this.minigamePortal) {
      const portalX = width * 0.95;
      const portalY = height * 0.8;
      this.minigamePortal.setPosition(portalX, portalY);
      this.minigamePortalPosition = { x: portalX, y: portalY };
      
      if (this.minigameLabel) {
        this.minigameLabel.setPosition(portalX, portalY - 110);
      }
      
      if (this.minigameZone) {
        this.minigameZone.setPosition(portalX, portalY - 50);
      }
    }
    
    if (this.dialogueManager?.isActive && this.dialogueManager.adjustBoxSize) {
      this.dialogueManager.adjustBoxSize(width, height);
    }
  }
}