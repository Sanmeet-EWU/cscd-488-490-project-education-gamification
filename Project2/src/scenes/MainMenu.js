import { BaseScene } from './BaseScene';
import { getUsername } from '../../firebase/firebase.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

export class MainMenu extends BaseScene {
    constructor() {
        super('MainMenu');
        // Define cloud relative positions once
        this.cloudXPositions = [0.05, 0.75, 0.25, 0.8, 0.2, 0.6, 0.38, 0.85];
        this.cloudYPositions = [0.08, 0.15, 0.42, 0.3, 0.7, 0.8, 0.25, 0.45];
    }

    async create() {
        super.create();
        await document.fonts.ready;

        // Attach a single resize listener and reposition immediately.
        this.scale.on('resize', this.repositionUI, this);
        this.repositionUI({ width: this.scale.width, height: this.scale.height });

        // Add the wake event listener.
        this.events.on('wake', this.onWake, this);

        const { width, height } = this.scale;

        // Create background elements (sword & raven)
        this.createBackground(width, height);
        // Create the title with a gradient effect.
        this.createTitle(width, height);
        // Create and animate clouds.
        this.createClouds(width, height);
        // Create menu buttons.
        this.createMenuButtons(width, height);
        // Setup background music.
        this.setupMusic();

        // Create username text in the top-right corner.
        // We position it at (width - 20, 20) with setOrigin(1, 0) so that its right edge is 20px from the right.
        this.usernameText = this.add.text(width - 20, 20, "Loading...", {
            fontFamily: 'Inknut Antiqua',
            fontSize: `${Math.floor(height * 0.05)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'right'
        }).setOrigin(1, 0);

        // Listen for authentication state changes.
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User is signed in:", user.email);
                const username = await getUsername();
                this.usernameText.setText(username || "Guest");
            } else {
                console.log("No user is signed in.");
                this.usernameText.setText("Guest");
            }
        });

        // Cleanup resize listener when leaving MainMenu.
        this.events.on('shutdown', () => {
            console.log("MainMenu is shutting down, removing resize listener.");
            this.scale.off('resize', this.repositionUI, this);
        });
    }

    onWake() {
        // Force the scale manager to refresh.
        this.scale.refresh();
        // Recalculate layout using the actual window dimensions.
        const width = window.innerWidth;
        const height = window.innerHeight;
        console.log(`onWake: new dimensions are ${width} x ${height}`);
        this.repositionUI({ width, height });
    }

    createBackground(width, height) {
        // Sword & Crown
        this.sword = this.add.image(width * 0.2, height * 0.55, 'swordandcrown').setOrigin(0.5);
        this.fitToScreen(this.sword, 0.25);

        // Raven
        this.raven = this.add.image(width * 0.9, height * 0.95, 'raven').setOrigin(1, 1);
        this.fitToScreen(this.raven, 0.20);
    }

    createTitle(width, height) {
        this.title = this.add.text(width * 0.5, height * 0.15, "Macbeth", {
            fontFamily: "Canterbury",
            fontSize: `${Math.floor(height * 0.22)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Apply a blood-red gradient effect.
        const gradient = this.title.context.createLinearGradient(0, 0, 0, this.title.height);
        gradient.addColorStop(0, '#8B0000');
        gradient.addColorStop(0.5, '#B22222');
        gradient.addColorStop(1, '#FF0000');
        this.title.setFill(gradient);
    }

    createClouds(width, height) {
        this.clouds = [];
        const cloudKeys = ['cloud', 'cloud2', 'cloud3', 'cloud4', 'cloud', 'cloud2', 'cloud3', 'cloud4'];
        for (let i = 0; i < cloudKeys.length; i++) {
            const x = width * this.cloudXPositions[i];
            const y = height * this.cloudYPositions[i];
            const cloud = this.add.image(x, y, cloudKeys[i]).setOrigin(0.5);
            this.fitToScreen(cloud, 0.25);
            this.clouds.push(cloud);
        }
        this.animateClouds(this.clouds, width, height);
    }

    createMenuButtons(width, height) {
        this.newGame = this.createButton("New Game", 0.35, () => this.switchScene('Act1Scene1'));
        this.loadGame = this.createButton("Load Game", 0.45, () => this.switchScene('LoadGame'));
        this.leaderboard = this.createButton("Leaderboard", 0.55, () => this.switchScene('Leaderboard'));
        this.settings = this.createButton("Settings", 0.65, () => this.switchScene('Settings'));
    }

    setupMusic() {
        this.audioController = this.sys.game.globals.audioController;
        if (this.audioController.musicOn && !this.audioController.bgMusicPlaying) {
            this.bgMusic = this.sound.add('testMusic', { 
                volume: this.audioController.bgVolume, 
                loop: true 
            });

            this.input.once('pointerdown', () => {
                if (!this.bgMusic.isPlaying) {
                    this.bgMusic.play();
                    this.audioController.bgMusicPlaying = true;
                    this.sys.game.globals.bgMusic = this.bgMusic;
                }
            });
        }
    }

    /**
     * Repositions and scales UI elements based on new dimensions.
     */
    repositionUI({ width, height }) {
        console.log(`Repositioning UI: ${width} x ${height}`);
        if (!this.scene.isActive('MainMenu')) return;

        if (this.cameras && this.cameras.main) {
            this.cameras.main.setSize(width, height);
        } else {
            console.warn("Camera not initialized yet.");
            return;
        }

        if (!width || !height || isNaN(width) || isNaN(height)) {
            console.error("Invalid width/height during repositionUI");
            return;
        }

        // Reposition background elements.
        if (this.sword && this.sword.active) {
            this.sword.setPosition(width * 0.2, height * 0.55);
            this.fitToScreen(this.sword, 0.25);
        }
        if (this.raven && this.raven.active) {
            this.raven.setPosition(width * 0.9, height * 0.95);
            this.fitToScreen(this.raven, 0.20);
        }

        // Reposition title.
        if (this.title && this.title.active) {
            this.title.setPosition(width * 0.5, height * 0.15);
            this.title.setFontSize(`${Math.floor(height * 0.22)}px`);
        }

        // Reposition menu buttons.
        if (this.newGame && this.newGame.active && this.newGame.setFontSize) {
            this.newGame.setPosition(width * 0.5, height * 0.35);
            this.newGame.setFontSize(`${Math.floor(height * 0.05)}px`);
        }
        if (this.loadGame && this.loadGame.active && this.loadGame.setFontSize) {
            this.loadGame.setPosition(width * 0.5, height * 0.45);
            this.loadGame.setFontSize(`${Math.floor(height * 0.05)}px`);
        }
        if (this.leaderboard && this.leaderboard.active && this.leaderboard.setFontSize) {
            this.leaderboard.setPosition(width * 0.5, height * 0.55);
            this.leaderboard.setFontSize(`${Math.floor(height * 0.05)}px`);
        }
        if (this.settings && this.settings.active && this.settings.setFontSize) {
            this.settings.setPosition(width * 0.5, height * 0.65);
            this.settings.setFontSize(`${Math.floor(height * 0.05)}px`);
        }

        // Reposition clouds.
        if (this.clouds && this.clouds.length >= 8) {
            for (let i = 0; i < this.clouds.length; i++) {
                const cloud = this.clouds[i];
                if (cloud && cloud.active) {
                    const newX = width * this.cloudXPositions[i];
                    const newY = height * this.cloudYPositions[i];
                    cloud.setPosition(newX, newY);
                    this.fitToScreen(cloud, 0.25);
                }
            }
        }

        // Reposition username text in the top-right.
        if (this.usernameText && this.usernameText.active) {
            this.usernameText.setPosition(width - 20, 20);
            this.usernameText.setFontSize(`${Math.floor(height * 0.05)}px`);
        }
    }

    animateClouds(clouds, width, height) {
        clouds.forEach(cloud => {
            const moveRight = Phaser.Math.Between(0, 1) === 1;
            const offsetFactor = 0.2;
            const startX = moveRight ? -cloud.width * offsetFactor : width + cloud.width * offsetFactor;
            const endX = moveRight ? width + cloud.width : -cloud.width;
            cloud.setPosition(startX, cloud.y);
            this.tweens.add({
                targets: cloud,
                x: endX,
                duration: Phaser.Math.Between(25000, 45000),
                ease: 'Linear',
                repeat: -1,
                onComplete: () => {
                    cloud.x = startX;
                }
            });
        });
    }
}
