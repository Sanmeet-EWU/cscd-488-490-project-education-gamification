import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import "../firebase/firebase.js";
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Leaderboard } from './scenes/Leaderboard';
import { Settings } from './scenes/Settings';
import { GameScene } from './scenes/GameScene.js';
import { Act1Scene1 } from './scenes/Act1Scene1.js';
import AudioController from './AudioController.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { completeLogin } from '../firebase/firebase.js';
import { PauseMenu } from './scenes/PauseMenu.js';
import Base from 'phaser3-rex-plugins/templates/transitionimagepack/TransitionImagePack.js';
import { BaseGameScene } from './scenes/BaseGameScene.js';

// Declare game variable at a global scope
let game;

// Phaser Game Configuration
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
        Game,
        GameOver,
        Leaderboard,
        Settings,
        GameScene,
        Act1Scene1,
        PauseMenu,
        BaseGameScene
    ],
};

// Initialize the Phaser Game only on `game.html`
if (window.location.pathname.endsWith('game.html')) {
    completeLogin().then(() => {

        // Initialize the Phaser game and assign it to `game`
        game = new Phaser.Game(config);

        // Store audio globally
        game.globals = {
            audioController: new AudioController(),
            bgMusic: null
        };

        // Ensure the game resizes properly
        window.addEventListener("resize", () => {
            if (game && game.scale) {
                game.scale.resize(window.innerWidth, window.innerHeight);
            }
        });

    }).catch((error) => {
        console.error('Error processing login:', error);
        alert('Failed to log in. Please try again.');
    });
}
