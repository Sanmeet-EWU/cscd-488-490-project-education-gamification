import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene4 extends BaseGameScene {
  constructor() {
    super('Act1Scene4');
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
    
    // Load Macbeth's idle and run animations
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
    
    // Load Duncan's idle animation
    if (!this.textures.exists('duncan_idle_sheet')) {
      this.load.image('duncan_idle_sheet', 'assets/characters/DuncanIdle.png');
    }
    if (!this.cache.json.exists('duncan_idle_json')) {
      this.load.json('duncan_idle_json', 'assets/characters/DuncanIdle.json');
    }
    
    // Load fallback sprites (guard)
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
    this.load.audio('act1scene4Music', 'assets/audio/act1scene4.mp3');
    
    this.load.on('loaderror', (fileObj) => {
      console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
    });
  }

  create(data) {
    super.create(data);
    const { width, height } = this.scale;
    this.dialogueFullyComplete = false;  // Tracks if the dialogue has fully ended
    this.transitionActive = false;       // Prevents multiple transitions
    this.nextSceneKey = 'Act1Scene5'; 
    const requiredAssets = ['background_act1scene4'];
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

    this.cameras.main.fadeIn(1000, 0, 0, 0);

    if (this.textures.exists('background_act1scene4')) {
      this.background = this.add.image(0, 0, 'background_act1scene4')
        .setOrigin(0, 0)
        .setDisplaySize(width, height)
        .setDepth(-1);
    } else {
      this.background = this.add.rectangle(0, 0, width, height, 0x482c1c)
        .setOrigin(0, 0)
        .setDepth(-1);
    }
    
    this.createFloor();
    this.setupGuardAtlas();
    this.setupMacbethAtlas();
    this.setupDuncanAtlas();
    this.createAnimations();
    if (this.audioController && this.cache.audio.exists('act1scene4Music')) {
      this.audioController.playMusic('act1scene4Music', this, { volume: 1, loop: true });
    }
    
    this.setupPlayer();
    this.setupNPCs();
    this.setupSceneDialogue();
    this.physics.world.gravity.y = 300;
    this.player.setMaxVelocity(500, 1000);
    this.scale.on('resize', this.onResize, this);
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

  setupMacbethAtlas() {
    if (this.textures.exists('macbeth_idle_sheet') && this.cache.json.exists('macbeth_idle_json')) {
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
      this.textures.addAtlas(
        'macbeth_idle_atlas',
        this.textures.get('macbeth_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      this.anims.create({
        key: 'macbeth_idle',
        frames: idleJsonData.map(frame => ({ key: 'macbeth_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    }
    
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
      this.anims.create({
        key: 'macbeth_run',
        frames: runJsonData.map(frame => ({ key: 'macbeth_run_atlas', frame: frame.name })),
        frameRate: 10,
        repeat: -1
      });
    }
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
        frameRate: 8,
        repeat: -1
      });
    }
  }

  setupPlayer() {
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
    
    const playerConfig = {
      texture: texture,
      frame: frame,
      scale: 3,
      displayName: 'Macbeth',
      animation: animation,
      movementConstraint: 'horizontal'
    };
    
    this.player = this.createPlayer(playerConfig);
    if (this.player) {
      const { width, height } = this.scale;
      this.player.setPosition(width * 0.3, height * 0.8);
    }
  }

  setupNPCs() {
    const { width, height } = this.scale;
    
    const npcConfigs = [
      {
        key: "Duncan",
        x: width * 0.5,
        y: height * 0.8,
        texture: this.textures.exists('duncan_idle_atlas') ? 'duncan_idle_atlas' : 'guard',
        frame: 'sprite1',
        scale: 1.5,
        animationKey: this.anims.exists('duncan_idle') ? 'duncan_idle' : 'idle',
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
    
    this.createNPCs(npcConfigs);
    
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
      const portraitMap = {
        "Macbeth": "Macbeth",
        "Duncan": "Duncan",
        "Malcolm": "Malcolm",
        "Banquo": "Banquo"
      };
      this.setupDialogue(dialogueData, portraitMap, "Macbeth");
      
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
    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: [{ key: 'guard', frame: 'sprite1' }],
        frameRate: 10
      });
    }
    
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
      this.dialogueManager.startDialogue("Duncan", () => {
        console.log(`Dialogue completed`);
      });
    }
  }

  update(time, delta) {
    super.update(time, delta);
    
    if (this.isPaused || this.dialogueManager?.isActive) return;
    
    if (this.player) {
      const speed = 300;
      
      if (this.keys.left.isDown) {
        this.player.setVelocityX(-speed);
        if (this.anims.exists('macbeth_run')) {
          this.player.anims.play('macbeth_run', true);
          this.player.flipX = true;
        } else {
          this.player.anims.play('left', true);
        }
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        if (this.anims.exists('macbeth_run')) {
          this.player.anims.play('macbeth_run', true);
          this.player.flipX = false;
        } else {
          this.player.anims.play('right', true);
        }
      } else {
        this.player.setVelocityX(0);
        if (this.anims.exists('macbeth_idle')) {
          this.player.anims.play('macbeth_idle', true);
        } else {
          this.player.anims.play('idle', true);
        }
      }
      
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
    if (this.dialogueFullyComplete && this.nextSceneKey) {
      const { width } = this.scale;
      if (this.player.x > width - 50) {  // Player is near right edge
          if (!this.transitionActive) {  // Prevent multiple transitions
              this.transitionActive = true;
              this.cameras.main.fadeOut(500, 0, 0, 0);  // Fade out over 500ms
              this.cameras.main.once('camerafadeoutcomplete', () => {
                  this.scene.start(this.nextSceneKey);  // Start next scene
              });
          }
      }
  }
  }
  
  onResize(gameSize) {
    if (!this.scene.isActive('Act1Scene4')) return;
    
    const { width, height } = gameSize;
    
    if (this.background?.active) {
      if (this.background.type === 'Image') {
        this.background.setDisplaySize(width, height);
      } else {
        this.background.width = width;
        this.background.height = height;
      }
    }
    
    if (this.floor?.clear) {
      this.floor.clear();
      const groundY = height * 0.9;
      const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
      this.floor.add(ground);
      ground.setVisible(false);
    }
    
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
    
    if (this.dialogueManager?.isActive && this.dialogueManager.adjustBoxSize) {
      this.dialogueManager.adjustBoxSize(width, height);
    }
  }
  startDialogue(npcKey) {
    if (this.dialogueManager && !this.dialogueManager.isActive) {
        if (this.player?.body) {
            this.player.body.setVelocity(0, 0);  // Stop player movement during dialogue
        }
        this.dialogueManager.startDialogue("Duncan", () => {
            console.log("Dialogue completed");
            this.dialogueFullyComplete = true;  // Mark dialogue as complete
            this.showExitHint();                // Show the hint
        });
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
              fontSize: '32px', 
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
}