import { BaseGameScene } from '../BaseGameScene.js';

export class Act1Scene6 extends BaseGameScene {
  constructor() {
    super('Act1Scene6');
    // Player character is Duncan
    this.isCutscene = false;
  }

  preload() {
    // Background
    if (!this.textures.exists('background_act1scene6')) {
      this.load.svg('background_act1scene6', 'assets/act1/Act1Scene6BG.svg', { width: 2560, height: 1440 });
    }

    // Dialogue JSON
    if (!this.cache.json.exists('Act1Scene6Data')) {
      this.load.json('Act1Scene6Data', 'SceneDialogue/Act1Scene6.json');
    }

    // Character sprite
    if (!this.textures.exists('characterSprite')) {
      this.load.spritesheet('characterSprite', 'assets/characters/Character.png', {
        frameWidth: 32, frameHeight: 48
      });
    }

    // Portraits
    this.load.image('portrait1', 'assets/portraits/Character1.png');
    this.load.image('portrait2', 'assets/portraits/Character2.png');

    // Scene music
    if (!this.cache.audio.exists('act1scene6Music')) {
      this.load.audio('act1scene6Music', 'assets/audio/act1scene6Music.mp3');
    }

    // Optional SFX
    if (!this.cache.audio.exists('soundEffect1')) {
      this.load.audio('soundEffect1', 'assets/audio/effect.mp3');
    }

    this.load.on('loaderror', (fileObj) => {
      console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
    });
  }

  create(data) {
    super.create(data);

    const { width, height } = this.scale;
    
    // Required assets
    const requiredAssets = [
      'background_act1scene6',
      'characterSprite',
      'act1scene6Music',
      'portrait1',
      'portrait2'
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

    // Fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Background
    this.background = this.add.image(0, 0, 'background_act1scene6')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(-1);

    // Animations
    this.createAnimations();

    // Music
    if (this.audioController && this.cache.audio.exists('act1scene6Music')) {
      this.audioController.playMusic('act1scene6Music', this, { volume: 1, loop: true });
    }

    // Player (Duncan)
    if (!this.isCutscene) {
      this.setupPlayer();
    }

    // NPCs
    this.setupNPCs();

    // Dialogue
    this.setupSceneDialogue();

    // Resize handling
    this.scale.on('resize', this.onResize, this);
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  setupPlayer() {
    const playerConfig = {
      texture: 'characterSprite',
      frame: 0,
      scale: 1.5,
      displayName: 'Duncan',
      animation: 'idleAnim',
      movementConstraint: 'horizontal'
    };
    this.player = this.createPlayer(playerConfig);
  }

  setupNPCs() {
    const npcConfigs = [
      {
        key: "NPC1",
        x: this.scale.width * 0.5,
        y: this.scale.height * 0.8,
        texture: 'characterSprite',
        frame: 0,
        scale: 1.5,
        animationKey: 'idleAnim',
        interactive: true,
        displayName: 'NPC Name'
      }
    ];
    this.createNPCs(npcConfigs);
  }

  setupSceneDialogue() {
    if (!this.cache.json.exists('Act1Scene6Data')) return;
    try {
      const dialogueData = this.cache.json.get('Act1Scene6Data');
      const portraitMap = {
        "Character1": "portrait1",
        "Character2": "portrait2"
      };
      // Player is "Duncan"
      this.setupDialogue(dialogueData, portraitMap, "Duncan");
    } catch (error) {
      console.error("Error setting up dialogue:", error);
    }
  }

  createAnimations() {
    if (!this.anims.exists('idleAnim')) {
      this.anims.create({
        key: 'idleAnim',
        frames: [{ key: 'characterSprite', frame: 0 }],
        frameRate: 10
      });
    }
    if (!this.anims.exists('walkLeft')) {
      this.anims.create({
        key: 'walkLeft',
        frames: this.anims.generateFrameNumbers('characterSprite', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!this.anims.exists('walkRight')) {
      this.anims.create({
        key: 'walkRight',
        frames: this.anims.generateFrameNumbers('characterSprite', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1
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
    if (!this.scene.isActive('Act1Scene6')) return;
    const { width, height } = gameSize;
    if (this.background?.active) {
      this.background.setDisplaySize(width, height);
    }
  }
}
