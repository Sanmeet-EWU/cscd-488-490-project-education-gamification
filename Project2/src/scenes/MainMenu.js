import { BaseScene } from './BaseScene';
import { getUsername, loadGameData } from '../../firebase/firebase.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

export class MainMenu extends BaseScene {
  constructor() {
    super('MainMenu');
    this.cloudXPositions = [0.05, 0.75, 0.25, 0.8, 0.2, 0.6, 0.38, 0.85];
    this.cloudYPositions = [0.08, 0.15, 0.42, 0.3, 0.7, 0.8, 0.25, 0.45];
  }

  async create() {
    super.create();
    await document.fonts.ready;

    this.scale.on('resize', this.handleResize, this);
    this.repositionUI({ width: this.scale.width, height: this.scale.height });
    this.events.on('wake', this.onWake, this);

    const { width, height } = this.scale;

    this.createBackground(width, height);
    this.createTitle(width, height);
    this.createClouds(width, height);
    this.createMenuButtons(width, height);

    const audioController = this.sys.game.globals.audioController;

    if (audioController) {
      // If the track key is something else or nothing is playing,
      // THEN start or switch to "testMusic" (or "mainMenuMusic").
      if (audioController._activeTrackKey !== 'testMusic') {
        audioController.playMusic('testMusic', this, { volume: 1, loop: true });
      }
    }

    this.usernameText = this.add.text(width - 20, 20, "Loading...", {
      fontFamily: 'Inknut Antiqua',
      fontSize: `${Math.floor(height * 0.05)}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'right'
    }).setOrigin(1, 0);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const username = await getUsername();
          if (this.usernameText?.active) {
            this.usernameText.setText(username || "Guest");
          }
        } catch {
          if (this.usernameText?.active) {
            this.usernameText.setText("Guest");
          }
        }
      } else {
        if (this.usernameText?.active) {
          this.usernameText.setText("Guest");
        }
      }
    });

    this.events.on('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
    });
  }

  onWake() {
    this.scale.refresh();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.repositionUI({ width, height });
  }

  createBackground(width, height) {
    try {
      this.sword = this.add.image(width * 0.2, height * 0.55, 'swordandcrown').setOrigin(0.5);
      this.fitToScreen(this.sword, 0.25);
      this.raven = this.add.image(width * 0.9, height * 0.95, 'raven').setOrigin(1, 1);
      this.fitToScreen(this.raven, 0.20);
    } catch {}
  }

  createTitle(width, height) {
    try {
      this.title = this.add.text(width * 0.5, height * 0.15, "Macbeth", {
        fontFamily: "Canterbury",
        fontSize: `${Math.floor(height * 0.22)}px`,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 10,
        align: 'center'
      }).setOrigin(0.5);

      const gradient = this.title.context.createLinearGradient(0, 0, 0, this.title.height);
      gradient.addColorStop(0, '#8B0000');
      gradient.addColorStop(0.5, '#B22222');
      gradient.addColorStop(1, '#FF0000');
      this.title.setFill(gradient);
    } catch {}
  }

  createClouds(width, height) {
    this.clouds = [];
    const cloudKeys = ['cloud','cloud2','cloud3','cloud4','cloud','cloud2','cloud3','cloud4'];
    for (let i = 0; i < cloudKeys.length; i++) {
      const x = width * this.cloudXPositions[i];
      const y = height * this.cloudYPositions[i];
      if (this.textures.exists(cloudKeys[i])) {
        const cloud = this.add.image(x, y, cloudKeys[i]).setOrigin(0.5);
        this.fitToScreen(cloud, 0.25);
        this.clouds.push(cloud);
      }
    }
    if (this.clouds.length > 0) {
      this.animateClouds(this.clouds, width, height);
    }
  }

  createMenuButtons(width, height) {
    this.newGame = this.createButton("New Game", 0.35, () => this.switchScene('Act1Scene1'));
    this.loadGame = this.createButton("Load Game", 0.45, async () => {
      try {
        const saveData = await loadGameData();
        if (saveData) {
          this.scene.start(saveData.scene, { position: saveData.position });
        } else {
          alert("No saved game data found.");
        }
      } catch {
        alert("Error loading game data. Please try again.");
      }
    });
    this.leaderboard = this.createButton("Leaderboard", 0.55, () => this.switchScene('Leaderboard'));
    this.settings = this.createButton("Settings", 0.65, () => this.switchScene('Settings'));
    this.sceneSelector = this.createButton("Scene Selector", 0.75, () => this.switchScene('SceneSelector'));
  }

  repositionUI({ width, height }) {
    if (!this.scene.isActive('MainMenu')) return;
    if (this.cameras?.main) this.cameras.main.setSize(width, height);

    if (this.sword?.active) {
      this.sword.setPosition(width * 0.2, height * 0.55);
      this.fitToScreen(this.sword, 0.25);
    }
    if (this.raven?.active) {
      this.raven.setPosition(width * 0.9, height * 0.95);
      this.fitToScreen(this.raven, 0.20);
    }
    if (this.title?.active) {
      this.title.setPosition(width * 0.5, height * 0.15);
      this.title.setFontSize(`${Math.floor(height * 0.22)}px`);
    }
    if (this.newGame?.active) {
      this.newGame.setPosition(width * 0.5, height * 0.35);
      this.newGame.setFontSize(`${Math.floor(height * 0.05)}px`);
    }
    if (this.loadGame?.active) {
      this.loadGame.setPosition(width * 0.5, height * 0.45);
      this.loadGame.setFontSize(`${Math.floor(height * 0.05)}px`);
    }
    if (this.leaderboard?.active) {
      this.leaderboard.setPosition(width * 0.5, height * 0.55);
      this.leaderboard.setFontSize(`${Math.floor(height * 0.05)}px`);
    }
    if (this.settings?.active) {
      this.settings.setPosition(width * 0.5, height * 0.65);
      this.settings.setFontSize(`${Math.floor(height * 0.05)}px`);
    }
    if (this.sceneSelector?.active) {
      this.sceneSelector.setPosition(width * 0.5, height * 0.75);
      this.sceneSelector.setFontSize(`${Math.floor(height * 0.05)}px`);
    }
    if (this.clouds?.length > 0) {
      this.clouds.forEach((cloud, i) => {
        if (cloud?.active) {
          cloud.setPosition(width * this.cloudXPositions[i], height * this.cloudYPositions[i]);
          this.fitToScreen(cloud, 0.25);
        }
      });
    }
    if (this.usernameText?.active) {
      this.usernameText.setPosition(width - 20, 20);
      this.usernameText.setFontSize(`${Math.floor(height * 0.05)}px`);
    }
  }

  animateClouds(clouds, width, height) {
    clouds.forEach(cloud => {
      if (!cloud?.active) return;
      const moveRight = Phaser.Math.Between(0, 1) === 1;
      const offset = 0.2;
      const startX = moveRight ? -cloud.width * offset : width + cloud.width * offset;
      const endX = moveRight ? width + cloud.width : -cloud.width;
      cloud.setPosition(startX, cloud.y);
      this.tweens.add({
        targets: cloud,
        x: endX,
        duration: Phaser.Math.Between(25000, 45000),
        ease: 'Linear',
        repeat: -1,
        onComplete: () => {
          if (cloud && cloud.active) cloud.x = startX;
        }
      });
    });
  }
}
