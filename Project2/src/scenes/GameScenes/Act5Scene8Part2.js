import { BaseGameScene } from '../BaseGameScene.js';

export class Act5Scene8Part2 extends BaseGameScene {
  constructor() {
    // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
    super('Act5Scene8Part2');

    // Set to true if this is a cutscene without player movement
    this.isCutscene = true;
  }

  preload() {
    // REPLACE: Load your scene specific assets

    // Background
    if (!this.textures.exists('background_act5scene8part2')) {
      this.load.svg('background_act5scene8part2', 'assets/act5/act5scene8part2.svg', { width: 2560, height: 1440 });
    }

    // Dialogue JSON
    if (!this.cache.json.exists('Act5Scene8Part2DialogueData')) {
      this.load.json('Act5Scene8Part2DialogueData', 'SceneDialogue/Act5Scene8Part2.json');
    }

    // Character spritesheets
    // Macduff idle animation
    if (!this.textures.exists('macduff_idle_sheet')) {
      this.load.image('macduff_idle_sheet', 'assets/characters/MacbethIdle.png');
    }
    if (!this.cache.json.exists('macduff_idle_json')) {
      this.load.json('macduff_idle_json', 'assets/characters/MacduffIdle.json');
    }

    // Malcolm idle animation
    if (!this.textures.exists('malcolm_idle_sheet')) {
      this.load.image('malcolm_idle_sheet', 'assets/characters/MalcolmIdle.png');
    }
    if (!this.cache.json.exists('malcolm_idle_json')) {
      this.load.json('malcolm_idle_json', 'assets/characters/MalcolmIdle.json');
    }

    // Siward idle animation
    if (!this.textures.exists('siward_idle_sheet')) {
      this.load.image('siward_idle_sheet', 'assets/characters/SiwardIdle.png');
    }
    if (!this.cache.json.exists('siward_idle_json')) {
      this.load.json('siward_idle_json', 'assets/characters/SiwardIdle.json');
    }

    // Ross idle animation
    if (!this.textures.exists('ross_idle_sheet')) {
      this.load.image('ross_idle_sheet', 'assets/characters/RossIdle.png');
    }
    if (!this.cache.json.exists('ross_idle_json')) {
      this.load.json('ross_idle_json', 'assets/characters/RossIdle.json');
    }

    // Load guard sprite for fallback
    if (!this.textures.exists('guardImg')) {
      this.load.image('guardImg', 'assets/characters/Guard.png');
    }
    if (!this.cache.json.exists('guardData')) {
      this.load.json('guardData', 'assets/characters/guard.json');
    }

    // Character portraits for dialogue
    if (this.textures.exists('Macduff')) {
      this.load.image("Macduff", "assets/portraits/Macduff.png");
    }
    if (this.textures.exists('Malcolm')) {
      this.load.image("Malcolm", "assets/portraits/Malcolm.png");
    }
    if (this.textures.exists('Siward')) {
      this.load.image("Siward", "assets/portraits/Siward.png");
    }
    if (this.textures.exists('Ross')) {
      this.load.image("Ross", "assets/portraits/Ross.png");
    }

    // Scene music
    if (this.cache.audio.exists('act5scene8part2music')) {
      this.load.audio('act5scene8part2music', 'assets/audio/act5scene8part2music.mp3');
    }

    // Error handling for asset loading
    this.load.on('loaderror', (fileObj) => {
      console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
    });
  }

  create(data) {
    // Call parent create method
    super.create(data);
    const { width, height } = this.scale;
    this.dialogueStarted = false;
    this.dialogueFullyComplete = false;
    this.transitionActive = false;
    this.soliloquyStarted = false;

    // Check required assets
    const requiredAssets = ['background_act5scene8part2'];
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
    if (this.textures.exists('background_act5scene8part2')) {
      this.background = this.add.image(0, 0, 'background_act5scene8part2')
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
    this.setupMacduffAtlas();
    this.setupMalcolmAtlas();
    this.setupSiwardAtlas();
    this.setupRossAtlas();
    this.createAnimations();

    // Play scene music
    if (this.audioController && this.cache.audio.exists('act5scene8part2music')) {
      this.audioController.playMusic('act5scene8part2music', this, { volume: 1, loop: true });
    }

    // Create player if not a cutscene
    if (!this.isCutscene) {
      this.setupPlayer();
    }
    this.setupNPCs();
    this.setupSceneDialogue();

    // Start dialogue for cutscenes
    if (this.isCutscene && this.dialogueManager) {
      // For cutscenes, automatically start dialogue
      this.dialogueManager.startDialogue("Act5Scene8Part2", () => {
        // Replace 'NextSceneName' with your next scene
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.switchScene('Leaderboard');
        });
      });
    }

    // Handle scene resize
    this.scale.on('resize', this.onResize, this);

    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  setupMacduffAtlas() {
    if (this.textures.exists('macduff_idle_sheet') && this.cache.json.exists('macduff_idle_json')) {
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
      this.textures.addAtlas(
        'macduff_idle_atlas',
        this.textures.get('macduff_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      this.anims.create({
        key: 'macduff_idle',
        frames: idleJsonData.map(frame => ({ key: 'macduff_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    } else {
      console.error("Macduff idle animation assets failed to load.");
    }
  }

  setupMalcolmAtlas() {
    if (this.textures.exists('malcolm_idle_sheet') && this.cache.json.exists('malcolm_idle_json')) {
      const idleJsonData = this.cache.json.get('malcolm_idle_json');
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
        'malcolm_idle_atlas',
        this.textures.get('malcolm_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      this.anims.create({
        key: 'malcolm_idle',
        frames: idleJsonData.map(frame => ({ key: 'malcolm_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    } else {
      console.error("Malcolm idle animation assets failed to load.");
    }
  }

  setupSiwardAtlas() {
    if (this.textures.exists('siward_idle_sheet') && this.cache.json.exists('siward_idle_json')) {
      const idleJsonData = this.cache.json.get('siward_idle_json');
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
        'siward_idle_atlas',
        this.textures.get('siward_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      this.anims.create({
        key: 'siward_idle',
        frames: idleJsonData.map(frame => ({ key: 'siward_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    } else {
      console.error("Siward idle animation assets failed to load.");
    }
  }

  setupRossAtlas() {
    if (this.textures.exists('ross_idle_sheet') && this.cache.json.exists('ross_idle_json')) {
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
      this.textures.addAtlas(
        'ross_idle_atlas',
        this.textures.get('ross_idle_sheet').getSourceImage(),
        idlePhaserAtlas
      );
      this.anims.create({
        key: 'ross_idle',
        frames: idleJsonData.map(frame => ({ key: 'ross_idle_atlas', frame: frame.name })),
        frameRate: 8,
        repeat: -1
      });
    } else {
      console.error("Ross idle animation assets failed to load.");
    }
  }

  setupNPCs() {
    // REPLACE: Define your NPCs
    const npcConfigs = [
      {
      key: "Macduff",
      x: width * 0.7,
      y: height * 0.85,
      texture: 'macduff_idle_atlas',
      frame: 'sprite1',
      scale: 1.8,
      animationKey: 'macduff_idle',
      displayName: 'Macduff'
      },
      {
      key: "Malcolm",
      x: width * 0.5,
      y: height * 0.85,
      texture: 'malcolm_idle_atlas',
      frame: 'sprite1',
      scale: 1.8,
      animationKey: 'malcolm_idle',
      displayName: 'Malcolm'
      },
      {
      key: "Siward",
      x: width * 0.3,
      y: height * 0.85,
      texture: 'siward_idle_atlas',
      frame: 'sprite1',
      scale: 1.8,
      animationKey: 'siward_idle',
      displayName: 'Siward'
      },
      {
      key: "Ross",
      x: width * 0.1,
      y: height * 0.85,
      texture: 'ross_idle_atlas',
      frame: 'sprite1',
      scale: 1.8,
      animationKey: 'ross_idle',
      displayName: 'Ross'
      }
    ];

    // Use the base class method to create NPCs
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
    if (!this.cache.json.exists('Act5ScenePart2Data')) return;

    try {
      const dialogueData = this.cache.json.get('Act5Scene8Part2Data');

      // REPLACE: Map character names to portrait texture keys
      const portraitMap = {
        "Macduff": "Macduff",
        "Malcolm": "Malcolm",
        "Siward": "Siward",
        "Ross": "Ross"
      };

      // Use base class method to setup dialogue
      this.setupDialogue(dialogueData, portraitMap, "PlayerCharacterName");
    } catch (error) {
      console.error("Error setting up dialogue:", error);
    }
  }

  setupSceneDialogue() {
    if (!this.cache.json.exists('Act5Scene8Part2Data')) {
      console.error("Act5Scene8Part2Data JSON not found");
      return;
    }

    try {
      const dialogueData = this.cache.json.get('Act5Scene8Part2Data');
      const portraitMap = {
        "Macduff": "Macduff",
        "Malcolm": "Malcolm",
        "Siward": "Siward",
        "Ross": "Ross"
      };

      this.setupDialogue(dialogueData, portraitMap, "Macduff");

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

  update(time, delta) {
    // Call parent update - handles pause, nametags, interaction, and dialogue indicators
    super.update(time, delta);

    // Skip additional updates if paused or in dialogue
    if (this.isPaused || this.dialogueManager?.isActive) return;

    if (this.player) {
      const speed = 160;

      // Handle player movement
      // REPLACE
      if (this.keys.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play('walkLeft', true);
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play('walkRight', true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('idleAnim', true);
      }
    }
  }

  onResize(gameSize) {
    if (!this.scene.isActive('Act5Scene8Part2')) return;

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
    if (this.npcs["Macduff"]) {
      this.npcs["Macduff"].setPosition(width * 0.7, height * 0.85);
    }
    if (this.npcs["Malcolm"]) {
      this.npcs["Malcolm"].setPosition(width * 0.5, height * 0.85);
    }
    if (this.npcs["Siward"]) {
      this.npcs["Siward"].setPosition(width * 0.3, height * 0.85);
    }
    if (this.npcs["Ross"]) {
      this.npcs["Ross"].setPosition(width * 0.1, height * 0.85);
    }
    if (this.exitHint) {
      this.exitHint.setPosition(width - 50, height / 2);
    }
  }
}