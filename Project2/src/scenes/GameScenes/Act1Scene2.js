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
    
    // Load portrait assets
    this.load.image("Captain", "assets/portraits/Captain.png");
    this.load.image("Malcolm", "assets/portraits/Malcolm.png");
    this.load.image("Ross", "assets/portraits/Ross.png");
    this.load.image("Duncan", "assets/portraits/Duncan.png");
    
    this.load.audio('act1scene2Music', 'assets/audio/act1scene2.ogg');
  }

  create(data) {
    // Call parent method but avoid player creation from parent
    super.create(data);
    
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
    
    // Create the player (Duncan)
    this.player = this.physics.add.sprite(width * 0.1, height * 0.8, 'guard', 'sprite1');
    this.player.setScale(1.5);
    this.player.setOrigin(0.5, 1.0);
    this.player.setCollideWorldBounds(true);
    this.player.depth = 10; // Ensure player is above other elements
    
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
    // Call parent update (from BaseGameScene, not BaseScene)
    super.update(time, delta);
    
    if (this.player && !this.dialogueManager?.isActive) {
      const speed = 160;
      
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
        this.player.anims.play('left', true);
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play('right', true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('idle', true);
      }
      
      // Check for NPC interaction (E key press)
      this.checkInteraction();
      
      // Update dialogue indicators if dialogueManager exists
      if (this.dialogueManager) {
        this.dialogueManager.updateIndicators();
      }
    }
  }
  
  checkInteraction() {
    if (!this.player) {
      this.interactText.setVisible(false);
      return;
    }

    let closestNPC = null;
    let closestDistance = Infinity;
    const interactDistance = 120; // Adjusted for easier interaction
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Find closest NPC
    Object.keys(this.npcs).forEach(key => {
      if (key.endsWith('Tag')) return;
      const npc = this.npcs[key];
      const dist = Phaser.Math.Distance.Between(playerX, playerY, npc.x, npc.y);
      if (dist <= interactDistance && dist < closestDistance) {
        closestNPC = { key, npc };
        closestDistance = dist;
      }
    });

    if (closestNPC) {
      this.interactText.setPosition(
        closestNPC.npc.x, 
        closestNPC.npc.y - (closestNPC.npc.height * 1.5) - 20
      );
      this.interactText.setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
        console.log(`Interaction key pressed near ${closestNPC.key}`);
        this.startDialogue(closestNPC.key);
      }
    } else {
      this.interactText.setVisible(false);
    }
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
      // Pass the actual npcKey instead of hardcoding "Act1Scene2"
      this.dialogueManager.startDialogue(npcKey, () => {
        console.log("Dialogue completed");
        this.dialogueFullyComplete = true;
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
    
    if (this.dialogueManager?.isActive && this.dialogueManager.adjustBoxSize) {
      this.dialogueManager.adjustBoxSize(width, height);
    }
  }
}