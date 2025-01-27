import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Leaderboard } from './scenes/Leaderboard';
import { Settings } from './scenes/Settings';
import { GameScene } from './scenes/GameScene.js';
import { Act1Scene1 } from './scenes/Act1Scene1.js';
import testScene from './scenes/testScene';
import AudioController from './AudioController.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { completeLogin } from '../firebase/firebase.js';
import { PauseMenu } from './scenes/PauseMenu.js';


// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
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
        testScene,
        Game,
        GameOver,
        Leaderboard,
        Settings,
        GameScene,
        Act1Scene1,
        PauseMenu
    ],
};

// Initialize the Phaser Game in `game.html`
if (window.location.pathname.endsWith('game.html')) {
    console.log('Processing login link...');
    completeLogin().then(() => {
        console.log('Login completed, initializing game...');
        
        // Initialize the Phaser game
        class Project extends Phaser.Game {
            constructor() {
                super(config);
                const audioController = new AudioController();
                this.globals = { audioController, bgMusic: null };
            }
        }

        new Project(); // Start the game after login
    }).catch((error) => {
        console.error('Error processing login:', error);
        alert('Failed to log in. Please try again.');
    });
}
