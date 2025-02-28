import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene2 extends BaseGameScene {
  constructor() {
    super('Act1Scene2');
    this.isCutscene = false;
  }

  preload() {
    this.load.svg('background_act1scene2', 'assets/act1/act1scene2.svg', { width: 2560, height: 1440 });
    this.load.json('Act1Scene2Data', 'SceneDialogue/Act1Scene2.json');
    this.load.audio('act1scene2Music', 'assets/audio/act1scene1.mp3');
  }

  create(data) {
    data = data || {};
    data.playerConfig = {
      movementConstraint: 'horizontal',
      scale: 2
    };
    super.create(data);

    const { width, height } = this.scale;
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

    this.cameras.main.stopFollow();
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 300;
    this.createFloor();

    if (this.player && this.player.body) {
      this.player.body.setGravityY(300);
      this.physics.add.collider(this.player, this.floor);
    }

    this.npcs = {
      Malcolm: this.add.rectangle(width * 0.25, height * 0.8, 32, 48, 0xFF0000)
        .setInteractive()
        .on('pointerdown', () => this.startDialogue("Malcolm")),
      Captain: this.add.rectangle(width * 0.6, height * 0.8, 32, 48, 0x00FF00)
        .setInteractive()
        .on('pointerdown', () => this.startDialogue("Captain")),
      Ross: this.add.rectangle(width * 0.8, height * 0.8, 32, 48, 0x0000FF)
        .setInteractive()
        .on('pointerdown', () => this.startDialogue("Ross"))
    };

    // Set up DialogueManager
    if (this.cache.json.exists('Act1Scene2Data')) {
      try {
        const dialogueData = this.cache.json.get('Act1Scene2Data');
        this.dialogueManager = new DialogueManager(this, dialogueData, {}, false, "Duncan");
      } catch (error) {
        console.error("Error setting up dialogue:", error);
      }
    }

    // Updated audio approach
    const audioController = this.sys.game.globals.audioController;
    if (audioController) {
      audioController.stopMusic(); // stops any old track
      if (this.cache.audio.exists('act1scene2Music')) {
        audioController.playMusic('act1scene2Music', this, { volume: 1, loop: true });
      }
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
      this.dialogueManager.startDialogue(npcKey, () => {
        console.log(`Dialogue with ${npcKey} completed`);
      });
    }
  }

  update() {
    super.update();
    if (this.player && this.player.body && !this.isPaused) {
      const speed = 200;
      this.player.body.setVelocityX(0);
      if (this.keys.left.isDown) {
        this.player.body.setVelocityX(-speed);
      } else if (this.keys.right.isDown) {
        this.player.body.setVelocityX(speed);
      }
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
    if (this.npcs) {
      this.npcs.Malcolm?.setPosition(width * 0.25, height * 0.8);
      this.npcs.Captain?.setPosition(width * 0.6, height * 0.8);
      this.npcs.Ross?.setPosition(width * 0.8, height * 0.8);
    }

    this.physics.world.setBounds(0, 0, width, height);
    if (this.floor?.clear) {
      this.floor.clear();
      const groundY = height * 0.9;
      const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
      this.floor.add(ground);
      ground.setVisible(false);
    }

    if (this.dialogueManager?.isActive && this.dialogueManager.adjustBoxSize) {
      this.dialogueManager.adjustBoxSize(width, height);
    }
  }
}
