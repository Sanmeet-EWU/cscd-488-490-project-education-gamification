import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene1 extends BaseGameScene {
  constructor() {
    super('Act1Scene1');
    this.isCutscene = true;
  }

  preload() {
    if (!this.textures.exists('background')) {
      this.load.svg('background', 'assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
    }
    if (!this.cache.json.exists('Act1Scene1Data')) {
      this.load.json('Act1Scene1Data', 'SceneDialogue/Act1Scene1.json');
    }

    this.load.spritesheet('WitchIdle', 'assets/characters/B_witch_idle.png', {
      frameWidth: 32, frameHeight: 48
    });
    this.load.image('lightning1', 'assets/effects/lightning1.svg');
    this.load.image('lightning2', 'assets/effects/lightning2.svg');
    this.load.image('lightning3', 'assets/effects/lightning3.svg');
    this.load.image('lightning4', 'assets/effects/lightning4.svg');
    this.load.audio('thunder', 'assets/audio/thunder.mp3');
    this.load.audio('sceneMusic', 'assets/audio/act1scene1.mp3');
    this.load.image('witch1portrait', 'assets/portraits/witch1portrait.png');
    this.load.image('witch2portrait', 'assets/portraits/witch2portrait.png');
    this.load.image('witch3portrait', 'assets/portraits/witch3portrait.png');

    this.load.on('loaderror', (fileObj) => {
      console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
    });
  }

  create(data) {
    super.create(data);
    const { width, height } = this.scale;

    // Check required assets
    const requiredAssets = [
      'background','WitchIdle','lightning1','lightning2','lightning3','lightning4',
      'thunder','sceneMusic','witch1portrait','witch2portrait','witch3portrait'
    ];
    const missing = requiredAssets.filter(asset =>
      !(this.textures.exists(asset) || this.cache.audio.exists(asset))
    );
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

    // Stop any previous track, if playing
    this.audioController = this.sys.game.globals.audioController;
    if (this.audioController) {
      this.audioController.stopMusic();
    }

    // Basic scene setup
    this.whiteBg = this.add.rectangle(0, 0, width, height, 0xffffff)
      .setOrigin(0, 0)
      .setDepth(-1);
    this.background = this.add.image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    // NPC definitions
    this.npcDefs = [
      { key: "Witch1", xRatio: 0.25, yRatio: 0.8, scale: 7, animationKey: 'witchIdle', texture: 'WitchIdle' },
      { key: "Witch2", xRatio: 0.4, yRatio: 0.55, scale: 7, animationKey: 'witchIdle', texture: 'WitchIdle' },
      { key: "Witch3", xRatio: 0.75, yRatio: 0.8, scale: 7, animationKey: 'witchIdle', texture: 'WitchIdle' }
    ];
    this.scale.on('resize', this.onResize, this);

    // Create and load dialogue data
    try {
      if (!this.cache.json.exists('Act1Scene1Data')) {
        throw new Error("Dialogue data not found");
      }
      const portraitMap = {
        "First Witch": "witch1portrait",
        "Second Witch": "witch2portrait",
        "Third Witch": "witch3portrait"
      };
      const dialogueData = this.cache.json.get('Act1Scene1Data');
      if (!dialogueData || Object.keys(dialogueData).length === 0) {
        throw new Error("Dialogue data is empty");
      }
      this.dialogueManager = new DialogueManager(this, dialogueData, portraitMap, true);
    } catch (error) {
      this.add.text(width / 2, height / 2, `Error: ${error.message}`, {
        fontSize: '32px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
      return;
    }

    this.createAnimations();
    this.playLightningEffect();

    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
      if (this.audioController) {
        // Replace old `stopSceneMusic()` with unified `stopMusic()`
        this.audioController.stopMusic();
      }
      if (this.dialogueManager) {
        this.dialogueManager.destroy();
      }
    });
  }

  createAnimations() {
    if (!this.anims.exists('witchIdle')) {
      this.anims.create({
        key: 'witchIdle',
        frames: this.anims.generateFrameNumbers('WitchIdle', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
  }

  spawnNPCs() {
    const { width, height } = this.scale;
    const npcDefsForCreation = this.npcDefs.map(def => ({
      key: def.key,
      x: width * def.xRatio,
      y: height * def.yRatio,
      texture: def.texture,
      scale: def.scale,
      animationKey: def.animationKey
    }));
    if (!this.npcs) {
      this.createNPCs(npcDefsForCreation);
    }
  }

  playLightningEffect() {
    const { width, height } = this.scale;
    const lightningYStart = -height * 0.2;
    const lightningYEnd = height * 0.4;

    // If no lightning texture, skip effect
    if (!this.textures.exists('lightning1')) {
      this.spawnNPCs();
      if (this.audioController) {
        this.audioController.playMusic('sceneMusic', this, { volume: 1, loop: true });
      }
      if (this.dialogueManager) {
        this.dialogueManager.startDialogue("Act1Scene1", () => this.switchScene('Act1Scene2'));
      }
      return;
    }

    // Create lightning sprite
    const lightning = this.add.image(width / 2, lightningYStart, 'lightning1')
      .setOrigin(0.5)
      .setDisplaySize(width, height)
      .setAlpha(0)
      .setDepth(5);

    // Play thunder
    try {
      if (this.sound.locked) {
        const unlockAudio = () => {
          this.sound.play('thunder', { volume: this.audioController ? this.audioController.soundVolume : 0.5 });
          this.input.off('pointerdown', unlockAudio);
        };
        this.input.once('pointerdown', unlockAudio);
      } else {
        this.sound.play('thunder', { volume: this.audioController ? this.audioController.soundVolume : 0.5 });
      }
    } catch {}

    // Animate lightning
    this.tweens.add({
      targets: lightning,
      y: lightningYEnd,
      alpha: 1,
      duration: 200,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        // Flicker effect
        this.time.delayedCall(100, () => { if (lightning.active) lightning.setAlpha(0); });
        this.time.delayedCall(200, () => { if (lightning.active) lightning.setAlpha(1); });
        this.time.delayedCall(300, () => { if (lightning.active) lightning.setAlpha(0); });
        this.time.delayedCall(400, () => { if (lightning.active) lightning.setAlpha(1); });
        this.time.delayedCall(600, () => { if (lightning.active) lightning.setAlpha(0); });

        // Spawn NPCs
        this.time.delayedCall(800, () => this.spawnNPCs());

        // Start scene music
        this.time.delayedCall(1000, () => {
          if (this.audioController) {
            // Instead of `playSceneMusic`, do:
            this.audioController.playMusic('sceneMusic', this, { volume: 1, loop: true });
          }
        });

        // Start dialogue
        this.time.delayedCall(1400, () => {
          if (this.dialogueManager) {
            this.dialogueManager.startDialogue("Act1Scene1", () => {
              this.switchToAct1Scene2();
            });
          } else {
            this.switchToAct1Scene2();
          }
        });
      }
    });
  }

  onResize(gameSize) {
    if (!this.scene.isActive('Act1Scene1')) return;
    const { width, height } = gameSize;
    if (this.whiteBg?.active) {
      this.whiteBg.setSize(width, height);
    }
    if (this.background?.active) {
      this.background.setDisplaySize(width, height);
    }
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    if (this.npcs) {
      this.npcDefs.forEach(def => {
        const npc = this.npcs[def.key];
        if (npc?.active) {
          npc.x = width * def.xRatio;
          npc.y = height * def.yRatio;
        }
      });
    }
    if (this.dialogueManager?.isActive) {
      this.dialogueManager.adjustBoxSize(width, height);
    }
  }

  switchToAct1Scene2() {
    try {
      if (this.scene.get('Act1Scene2')) {
        this.switchScene('Act1Scene2');
      } else {
        this.switchScene('MainMenu');
      }
    } catch {
      this.switchScene('MainMenu');
    }
  }
}
