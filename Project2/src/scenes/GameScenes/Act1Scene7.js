import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene7 extends BaseGameScene {
  constructor() {
    super('Act1Scene7');
    this.isCutscene = false;
  }

  preload() {
    // Load background
    if (!this.textures.exists('background_act1scene7')) {
      this.load.svg('background_act1scene7', 'assets/act1/Act1Scene7.svg', { width: 2560, height: 1440 });
    }
    
    // Dialogue JSON
    if (!this.cache.json.exists('Act1Scene7Data')) {
      this.load.json('Act1Scene7Data', 'SceneDialogue/Act1Scene7.json');
    }
    
    // Load Macbeth's idle animation
    if (!this.textures.exists('macbeth_idle_sheet')) {
      this.load.image('macbeth_idle_sheet', 'assets/characters/MacbethIdle.png');
    }
    if (!this.cache.json.exists('macbeth_idle_json')) {
      this.load.json('macbeth_idle_json', 'assets/characters/MacbethIdle.json');
    }
    
    // Load Macbeth's run animation
    if (!this.textures.exists('macbeth_run_sheet')) {
      this.load.image('macbeth_run_sheet', 'assets/characters/MacbethRun.png');
    }
    if (!this.cache.json.exists('macbeth_run_json')) {
      this.load.json('macbeth_run_json', 'assets/characters/MacbethRun.json');
    }
    
    // Load Lady Macbeth's idle animation
    if (!this.textures.exists('lady_macbeth_idle_sheet')) {
      this.load.image('lady_macbeth_idle_sheet', 'assets/characters/LadyMacbeth_Idle.png');
    }
    if (!this.cache.json.exists('lady_macbeth_idle_json')) {
      this.load.json('lady_macbeth_idle_json', 'assets/characters/LadyMacbeth_Idle.json');
    }
    
    // Load guard sprite for fallback
    if (!this.textures.exists('guardImg')) {
      this.load.image('guardImg', 'assets/characters/Guard.png');
    }
    if (!this.cache.json.exists('guardData')) {
      this.load.json('guardData', 'assets/characters/guard.json');
    }
    
    // Character portraits
    if (!this.textures.exists('Macbeth')) {
      this.load.image('Macbeth', 'assets/portraits/Macbeth.png');
    }
    if (!this.textures.exists('Lady Macbeth')) {
      this.load.image('Lady Macbeth', 'assets/portraits/LadyMacbeth.png');
    }
    
    // Scene music
    if (!this.cache.audio.exists('act1scene7Music')) {
      this.load.audio('act1scene7Music', 'assets/audio/act1scene1.mp3');
    }
    
    this.load.on('loaderror', (fileObj) => {
      console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
    });
  }

  create(data) {
    super.create(data);
    const { width, height } = this.scale;
    this.nextSceneKey = 'Act2Scene1';
    this.dialogueStarted = false;
    this.dialogueFullyComplete = false;
    this.transitionActive = false;
    this.soliloquyStarted = false;

    const requiredAssets = ['background_act1scene7'];
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

    if (this.textures.exists('background_act1scene7')) {
      this.background = this.add.image(0, 0, 'background_act1scene7')
        .setOrigin(0, 0)
        .setDisplaySize(width, height)
        .setDepth(-1);
    } else {
      this.background = this.add.rectangle(0, 0, width, height, 0x210e04)
        .setOrigin(0, 0)
        .setDepth(-1);
    }

    this.createFloor();
    this.setupGuardAtlas();
    this.setupMacbethAtlas();
    this.setupLadyMacbethAtlas();
    this.createAnimations();

    if (this.audioController && this.cache.audio.exists('act1scene7Music')) {
      this.audioController.playMusic('act1scene7Music', this, { volume: 0.6, loop: true });
    }

    this.setupPlayer();
    this.setupNPCs();
    this.setupSceneDialogue();

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
      this.textures.addAtlas('guard', this.textures.get('guardImg').getSourceImage(), phaserAtlas);
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

  setupLadyMacbethAtlas() {
    if (this.textures.exists('lady_macbeth_idle_sheet') && this.cache.json.exists('lady_macbeth_idle_json')) {
      const idleJsonData = this.cache.json.get('lady_macbeth_idle_json');
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
        'lady_macbeth_idle_atlas',
        this.textures.get('lady_macbeth_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      this.anims.create({
        key: 'lady_macbeth_idle',
        frames: idleJsonData.map(frame => ({ key: 'lady_macbeth_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    } else {
      console.error("Lady Macbeth idle animation assets failed to load.");
    }
  }

  setupPlayer() {
    let texture = 'macbeth_idle_atlas';
    let frame = 'sprite1';
    let animation = 'macbeth_idle';

    if (!this.textures.exists('macbeth_idle_atlas')) {
      texture = 'guard';
      frame = 'sprite1';
      animation = 'idle';
    }

    const playerConfig = {
      texture: texture,
      frame: frame,
      scale: 2.0,
      displayName: 'Macbeth',
      animation: animation,
      movementConstraint: 'horizontal'
    };

    this.player = this.createPlayer(playerConfig);

    if (this.player) {
      const { width, height } = this.scale;
      this.player.setPosition(width * 0.3, height * 0.85);
      this.player.body.setGravityY(0);
      if (this.floor) {
        this.physics.add.collider(this.player, this.floor);
      }
      this.player.body.setSize(this.player.width, this.player.height);
      this.player.body.setOffset(0, this.player.height / 2);
    }
  }

  setupNPCs() {
    const { width, height } = this.scale;

    const npcConfigs = [
      {
        key: "Lady Macbeth",
        x: width * 0.7,
        y: height * 0.85,
        texture: 'lady_macbeth_idle_atlas',
        frame: 'sprite1',
        scale: 1.8,
        animationKey: 'lady_macbeth_idle',
        displayName: 'Lady Macbeth'
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
    if (!this.cache.json.exists('Act1Scene7Data')) {
      console.error("Act1Scene7Data JSON not found");
      return;
    }

    try {
      const dialogueData = this.cache.json.get('Act1Scene7Data');
      const portraitMap = {
        "Macbeth": "Macbeth",
        "Lady Macbeth": "Lady Macbeth"
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

  showExitHint() {
    if (!this.exitHint && this.nextSceneKey) {
      const { width, height } = this.scale;
      this.exitHint = this.add.text(
        width - 50,
        height / 2,
        "→",
        { fontSize: '32px', fill: '#ffff00', stroke: '#000000', strokeThickness: 4 }
      ).setOrigin(0.5).setDepth(100);

      this.tweens.add({
        targets: this.exitHint,
        alpha: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
  }

  startDialogue(npcKey) {
    if (this.dialogueManager && !this.dialogueManager.isActive) {
      if (this.player?.body) {
        this.player.body.setVelocity(0, 0);
      }

      this.dialogueManager.startDialogue(npcKey, () => {
        console.log(`Dialogue with ${npcKey} completed`);
        if (npcKey === "Lady Macbeth") {
          this.dialogueFullyComplete = true;
          this.showExitHint();
        }
      });
    }
  }

  update(time, delta) {
    super.update(time, delta);

    if (this.isPaused || this.dialogueManager?.isActive) return;

    if (this.player) {
      const speed = 160;

      if (this.keys.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play('macbeth_run', true);
        this.player.flipX = true;
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play('macbeth_run', true);
        this.player.flipX = false;
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('macbeth_idle', true);
      }

      if (!this.soliloquyStarted) {
        this.soliloquyStarted = true;
        this.time.delayedCall(1000, () => {
          this.startDialogue("Macbeth");
        });
      }

      if (this.npcs["Lady Macbeth"] && !this.dialogueStarted) {
        const distToLady = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.npcs["Lady Macbeth"].x, this.npcs["Lady Macbeth"].y
        );
        if (distToLady < 120) {
          this.dialogueStarted = true;
          this.startDialogue("Lady Macbeth");
        }
      }

      if (this.dialogueFullyComplete && this.nextSceneKey) {
        const { width } = this.scale;
        if (this.player.x > width - 50 && !this.transitionActive) {
          this.transitionActive = true;
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(this.nextSceneKey);
          });
        }
      }
    }
  }

  onResize(gameSize) {
    if (!this.scene.isActive('Act1Scene7')) return;

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
      this.player.setPosition(width * 0.3, height * 0.85);
    }
    if (this.npcs["Lady Macbeth"]) {
      this.npcs["Lady Macbeth"].setPosition(width * 0.7, height * 0.85);
    }
    if (this.exitHint) {
      this.exitHint.setPosition(width - 50, height / 2);
    }
  }
}