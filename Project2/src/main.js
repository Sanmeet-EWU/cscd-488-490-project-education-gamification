import { Boot } from './scenes/Boot';
import "../firebase/firebase.js";
import { SceneSelector } from './scenes/SceneSelector.js';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Leaderboard } from './scenes/Leaderboard';
import { Settings } from './scenes/Settings';
import { Act1Scene1 } from './scenes/GameScenes/Act1Scene1.js';
import { Act1Scene2 } from './scenes/GameScenes/Act1Scene2.js';
import { Act1Scene3 } from './scenes/GameScenes/Act1Scene3.js';
import { Act1Scene4 } from './scenes/GameScenes/Act1Scene4.js';
import AudioController from './AudioController.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { completeLogin } from '../firebase/firebase.js';
import { PauseMenu } from './scenes/PauseMenu.js';
import { BaseGameScene } from './scenes/BaseGameScene.js';
import { Act1Minigame } from './scenes/GameScenes/Act1Minigame.js';
import { Act1Scene2Minigame } from './scenes/GameScenes/Act1Scene2Minigame.js';
import { Act1Scene3Part1a } from './scenes/GameScenes/Act1Scene3Part1a.js';
import { Act1Scene3Part1b } from './scenes/GameScenes/Act1Scene3Part1b.js';

let game;

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  plugins: {
    scene: [
      {
        key: 'rexUI',
        plugin: RexUIPlugin,
        mapping: 'rexUI'
      }
    ]
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    Leaderboard,
    SceneSelector,
    Settings,
    Act1Scene1,
    Act1Scene2,
    Act1Scene3Part1a,
    Act1Scene3Part1b,
    Act1Scene3,
    Act1Minigame,
    Act1Scene2Minigame,
    Act1Scene4,
    PauseMenu,
    BaseGameScene
  ],
};

if (window.location.pathname.endsWith('game.html')) {
  game = new Phaser.Game(config);
  window.game = game;
  game.globals = {
    audioController: new AudioController(),
    bgMusic: null
  };

  completeLogin().then(() => {
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (game?.scale) {
          game.scale.resize(window.innerWidth, window.innerHeight);
        }
      }, 100);
    });
    if (game?.scale) {
      game.scale.resize(window.innerWidth, window.innerHeight);
    }
  }).catch(() => {
    alert('Failed to log in. Please try again.');
  });
}
