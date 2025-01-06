import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Leaderboard } from './scenes/Leaderboard';
import { Settings } from './scenes/Settings';
import testScene from './scenes/testScene';
import { completeLogin } from '../firebase/firebase.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

// Call completeLogin when the page loads to handle email-based login
window.onload = () => {
    completeLogin();
};

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
        Settings
    ],
};

export default new Phaser.Game(config);
