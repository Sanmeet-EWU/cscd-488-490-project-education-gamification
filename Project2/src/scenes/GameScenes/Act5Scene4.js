import { BaseGameScene } from '../BaseGameScene.js';

export class TEMPLATESCENE extends BaseGameScene {
    constructor() {
        // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
        super('Act5Scene4');

        // Set to true if this is a cutscene without player movement
        this.isCutscene = false;
    }

    preload() {
        // REPLACE: Load your scene specific assets

        // Background
        if (!this.textures.exists('background_act5scene4')) {
            this.load.svg('background_act5scene4', 'assets/act5/scene4.svg', { width: 2560, height: 1440 });
        }

        // Dialogue JSON
        if (!this.cache.json.exists('Act5Scene4Data')) {
            this.load.json('Act5Scene4Data', 'SceneDialogue/Act5Scene4.json');
        }

        // Character spritesheets
        if (!this.textures.exists('soldier')) {
            this.load.spritesheet('soldier', 'assets/characters/soldier.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('malcolm')) {
            this.load.spritesheet('malcolm', 'assets/characters/malcolm.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('siward')) {
            this.load.spritesheet('siward', 'assets/characters/siward.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('macduff')) {
            this.load.spritesheet('macduff', 'assets/characters/macduff.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('youngSiward')) {
            this.load.spritesheet('youngSiward', 'assets/characters/youngSiward.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('monteith')) {
            this.load.spritesheet('monteith', 'assets/characters/monteith.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('caithness')) {
            this.load.spritesheet('caithness', 'assets/characters/caithness.png', {
                frameWidth: 32, frameHeight: 48
            });
        }

        // Character portraits for dialogue
        this.load.image("Soldier", "assets/portraits/Soldier.png");
        this.load.image("Malcolm", "assets/portraits/Malcolm.png");
        this.load.image("Siward", "assets/portraits/Siward.png");
        this.load.image("Macduff", "assets/portraits/Macduff.png");
        this.load.image("YoungSiward", "assets/portraits/YoungSiward.png");
        this.load.image("Monteith", "assets/portraits/Monteith.png");
        this.load.image("Caithness", "assets/portraits/Caithness.png");

        // Scene music
        this.load.audio('act5scene4music', 'assets/audio/act5scene4music.mp3');

        // Sound effects
        this.load.audio('soundEffect1', 'assets/audio/effect.mp3');

        // Error handling for asset loading
        this.load.on('loaderror', (fileObj) => {
            console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
        });
    }

    create(data) {
        // Call parent create method
        super.create(data);
        const { width, height } = this.scale;

        // Check required assets
        const requiredAssets = [
            'background_act5scene4', 'soldier', 'malcolm', 'siward', 'macduff', 'youngSiward', 'monteith', 'caithness', 'act5scene8part1music',
            'Soldier', 'Malcolm', 'Siward', 'Macduff', 'YoungSiward', 'Monteith', 'Caithness'
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

        // Fade in scene
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Setup background
        this.background = this.add.image(0, 0, 'background_act5scene4')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setDepth(-1);

        // Create animations
        this.createAnimations();

        // Play scene music
        if (this.audioController && this.cache.audio.exists('act5scene4music')) {
            this.audioController.playMusic('act5scene4music', this, { volume: 1, loop: true });
        }

        // Create player if not a cutscene
        if (!this.isCutscene) {
            this.setupPlayer();
        }

        // Create NPCs
        this.setupNPCs();

        // Setup dialogue
        this.setupSceneDialogue();

        // Start dialogue for cutscenes
        if (this.isCutscene && this.dialogueManager) {
            // For cutscenes, automatically start dialogue
            this.dialogueManager.startDialogue("Act5Scene4", () => {
                // Replace 'NextSceneName' with your next scene
                this.switchScene('Act5Scene5');
            });
        }

        // Handle scene resize
        this.scale.on('resize', this.onResize, this);

        // Cleanup on shutdown
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.onResize, this);
        });
    }

    setupPlayer() {
        // REPLACE: Define player configuration
        const playerConfig = {
            texture: 'soldier',
            frame: 0,
            scale: 1.5,
            displayName: 'Soldier',
            animation: 'idleAnim',
            movementConstraint: 'horizontal' // or 'topdown'
        };

        // Use the base class method to create player
        this.player = this.createPlayer(playerConfig);
    }

    setupNPCs() {
        // REPLACE: Define your NPCs
        const npcConfigs = [
            {
                key: "Malcolm",
                x: this.scale.width * 0.5,
                y: this.scale.height * 0.8,
                texture: 'malcolm',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Malcolm'
            },
            {
                key: "Siward",
                x: this.scale.width * 0.55,
                y: this.scale.height * 0.8,
                texture: 'siward',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Siward'
            },
            {
                key: "Macduff",
                x: this.scale.width * 0.6,
                y: this.scale.height * 0.8,
                texture: 'macduff',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Macduff'
            },
            {
                key: "YoungSiward",
                x: this.scale.width * 0.7,
                y: this.scale.height * 0.8,
                texture: 'youngSiward',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Young Siward'
            },
            {
                key: "Monteith",
                x: this.scale.width * 0.8,
                y: this.scale.height * 0.8,
                texture: 'monteith',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Monteith'
            },
            {
                key: "Caithness",
                x: this.scale.width * 0.95,
                y: this.scale.height * 0.8,
                texture: 'caithness',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Caithness'
            },
            {
                key: "Soldier1",
                x: this.scale.width * 0.1,
                y: this.scale.height * 0.8,
                texture: 'soldier',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Soldier'
            },
            {
                key: "Soldier2",
                x: this.scale.width * 0.2,
                y: this.scale.height * 0.8,
                texture: 'soldier',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Soldier'
            },
            // Add more NPCs as needed
        ];

        // Use the base class method to create NPCs
        this.createNPCs(npcConfigs);
    }

    setupSceneDialogue() {
        if (!this.cache.json.exists('Act5Scene4Data')) return;

        try {
            const dialogueData = this.cache.json.get('Act5Scene4Data');

            // REPLACE: Map character names to portrait texture keys
            const portraitMap = {
                "Soldier": "Soldier",
                "Soldier1": "Soldier",
                "Soldier2": "Soldier",
                "Malcolm": "Malcolm",
                "Siward": "Siward",
                "Macduff": "Macduff",
                "Young Siward": "YoungSiward",
                "Monteith": "Monteith",
                "Caithness": "Caithness"
            };

            // Use base class method to setup dialogue
            this.setupDialogue(dialogueData, portraitMap, "Soldier");
        } catch (error) {
            console.error("Error setting up dialogue:", error);
        }
    }

    createAnimations() {
        // REPLACE: Set up your character animations

        // Example animation setup
        if (!this.anims.exists('idleAnim')) {
            this.anims.create({
                key: 'idleAnim',
                frames: [{ key: 'soldier', frame: 0 }],
                frameRate: 10
            });
        }

        if (!this.anims.exists('walkLeft')) {
            this.anims.create({
                key: 'walkLeft',
                frames: this.anims.generateFrameNumbers('soldier', {
                    start: 0, end: 3
                }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('walkRight')) {
            this.anims.create({
                key: 'walkRight',
                frames: this.anims.generateFrameNumbers('soldier', {
                    start: 4, end: 7
                }),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    update(time, delta) {
        // Call parent update - handles pause, nametags, interaction, and dialogue indicators
        super.update(time, delta);

        // Skip additional updates if paused or in dialogue
        if (this.isPaused || this.dialogueManager?.isActive) return;

        if (this.player) {
            const speed = 160;

            // Handle player movement
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
        if (!this.scene.isActive('Act5Scene4')) return; // REPLACE: Scene key

        const { width, height } = gameSize;

        // Resize background
        if (this.background?.active) {
            this.background.setDisplaySize(width, height);
        }

        // The rest of NPC repositioning is now handled by super.updateNametags()
    }
}