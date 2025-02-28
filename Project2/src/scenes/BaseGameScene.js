import { BaseScene } from './BaseScene';
import { saveGameData, loadGameData } from "../../firebase/firebase.js";

export class BaseGameScene extends BaseScene {
  constructor(key = 'BaseGameScene') {
    super(key);
    this.playerConfig = {
      texture: 'player',
      scale: 1,
      animationKey: null,
      movementConstraint: 'free'
    };
  }

  init(data) {
    this.viewOnly = data?.viewOnly || false;
    this.isCutscene = data?.isCutscene || false;
    if (data.position) this.startingPosition = data.position;
    if (data.playerConfig) {
      this.playerConfig = { ...this.playerConfig, ...data.playerConfig };
    }
  }

  create(data) {
    super.create();
    this.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.ESC]);
    if (this.game.canvas) this.game.canvas.focus();

    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    if (!this.isCutscene) {
      if (this.playerConfig?.movementConstraint === 'horizontal') {
        this.createFloor();
      }
      this.createPlayer();
    }

    this.isPaused = false;

    this.audioController = this.sys.game.globals.audioController;
    if (this.audioController) {
      this.audioController._currentSceneKey = this.scene.key;
      this.audioController._gameScenePaused = false;
      this.audioController._pausedSceneKey = null;
    }
  }

  createPlayer() {
    try {
      if (this.textures.exists(this.playerConfig?.texture)) {
        // If the texture key exists, create a physics sprite
        this.player = this.physics.add.sprite(
          this.startingPosition?.x || 100,
          this.startingPosition?.y || 100,
          this.playerConfig.texture,
          this.playerConfig.frame
        );
        this.player.setCollideWorldBounds(true);
      } else {
        // Otherwise, create a rectangle shape with arcade physics
        const rect = this.add.rectangle(
          this.startingPosition?.x || 100,
          this.startingPosition?.y || 100,
          32,
          48,
          0xFF8800
        );
        this.player = this.physics.add.existing(rect);
        this.player.body.collideWorldBounds = true;
      }

      if (this.playerConfig.scale !== 1) {
        this.player.setScale(this.playerConfig.scale);
      }

      if (this.playerConfig.movementConstraint === 'horizontal') {
        this.physics.world.gravity.y = 300;
        // For a sprite or shape, set gravity on its body
        if (this.player.body) {
          this.player.body.setGravityY(300);
        }
        if (this.floor) {
          this.physics.add.collider(this.player, this.floor);
        }
      }
    } catch (error) {
      console.error("Error creating player:", error);
    }
  }

  createFloor() {
    const { width, height } = this.scale;
    const groundY = height * 0.9;
    this.floor = this.physics.add.staticGroup();
    this.floor
      .create(width / 2, groundY, 'ground')
      .setDisplaySize(width, 20)
      .refreshBody()
      .setVisible(false);
  }

  update(time, delta) {
    if (this.isPaused) return;
    super.update();

    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
      return;
    }

    if (!this.isCutscene && this.player) {
      const speed = 500;
      // If it's a Phaser sprite with .setVelocity(...)
      if (this.player.body && typeof this.player.setVelocity === 'function') {
        let vx = 0, vy = 0;

        if (this.playerConfig.movementConstraint === 'free') {
          if (this.keys.left.isDown) vx = -speed;
          else if (this.keys.right.isDown) vx = speed;
          if (this.keys.up.isDown) vy = -speed;
          else if (this.keys.down.isDown) vy = speed;
          this.player.setVelocity(vx, vy);

        } else if (this.playerConfig.movementConstraint === 'horizontal') {
          if (this.keys.left.isDown) vx = -speed;
          else if (this.keys.right.isDown) vx = speed;
          this.player.setVelocity(vx, this.player.body.velocity.y);

        } else if (this.playerConfig.movementConstraint === 'none') {
          this.player.setVelocity(0, 0);
        }

      } else if (this.player.x !== undefined) {
        // Otherwise, it’s likely a shape or something else
        const move = 5;
        if (this.playerConfig.movementConstraint === 'free') {
          if (this.keys.left.isDown) this.player.x -= move;
          else if (this.keys.right.isDown) this.player.x += move;
          if (this.keys.up.isDown) this.player.y -= move;
          else if (this.keys.down.isDown) this.player.y += move;

        } else if (this.playerConfig.movementConstraint === 'horizontal') {
          if (this.keys.left.isDown) this.player.x -= move;
          else if (this.keys.right.isDown) this.player.x += move;
        }

        // Keep within scene bounds
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.y < 0) this.player.y = 0;
        if (this.player.x > this.scale.width) this.player.x = this.scale.width;
        if (this.player.y > this.scale.height) this.player.y = this.scale.height;
      }
    }
  }

  createNPCs(npcDefs) {
    this.npcs = {};
    npcDefs.forEach(def => {
      const npc = this.add.sprite(def.x, def.y, def.texture, def.frame).setOrigin(0.5);
      if (def.scale) npc.setScale(def.scale);
      if (def.animationKey) npc.play(def.animationKey);
      if (def.interactive) {
        npc.setInteractive();
        npc.on("pointerdown", () => {
          if (def.onClick) def.onClick.call(this, def.key);
          else this.handleInteraction(def.key);
        });
      }
      this.npcs[def.key] = npc;
    });
  }

  handleInteraction(npcKey) {
    // Override in derived classes
  }

  async saveProgress() {
    if (this.viewOnly) return;
    try {
      const saveData = {
        scene: this.scene.key,
        position: this.player ? { x: this.player.x, y: this.player.y } : null,
        score: this.score || 0,
        inventory: this.inventory || []
      };
      await saveGameData(saveData);
    } catch {}
  }

  async loadProgress() {
    try {
      const saveData = await loadGameData();
      if (saveData) {
        this.scene.start(saveData.scene, { position: saveData.position });
      }
    } catch {}
  }

  togglePause() {
    if (this.ignoreNextESC) return;

    if (this.isPaused) {
      // Unpause
      this.isPaused = false;
      this.physics.world.resume();
      this.scene.stop('PauseMenu');
      this.ignoreNextESC = true;
      this.time.delayedCall(300, () => (this.ignoreNextESC = false));

    } else {
      // Pause
      this.isPaused = true;
      this.physics.world.pause();

      // If this.player is a sprite, setVelocity(0), else set body velocity to 0
      if (this.player) {
        if (typeof this.player.setVelocity === 'function') {
          this.player.setVelocity(0);
        } else if (this.player.body?.setVelocity) {
          this.player.body.setVelocity(0, 0);
        }
      }

      this.scene.launch('PauseMenu', { gameScene: this });
    }
  }
}
