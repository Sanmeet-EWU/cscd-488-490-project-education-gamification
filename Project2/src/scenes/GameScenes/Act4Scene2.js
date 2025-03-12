import { BaseGameScene } from '../BaseGameScene.js';

export class TEMPLATESCENE extends BaseGameScene {
    constructor() {
        // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
        super('Act4Scene2');

        // Set to true if this is a cutscene without player movement
        this.isCutscene = false;
    }

    preload() {
        // REPLACE: Load your scene specific assets

        // Background
        if (!this.textures.exists('background_act4scene3')) {
            this.load.svg('background_act4scene2', 'assets/act4/scene2.svg', { width: 2560, height: 1440 });
        }

        // Dialogue JSON
        if (!this.cache.json.exists('Act4Scene2Data')) {
            this.load.json('Act4Scene2Data', 'SceneDialogue/Act4Scene2.json');
        }

        // Character spritesheets
        if (!this.textures.exists('ladyMacduff')) {
            this.load.spritesheet('ladyMacduff', 'assets/characters/LadyMacduff.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('ross')) {
            this.load.spritesheet('ross', 'assets/characters/Ross.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('son')) {
            this.load.spritesheet('son', 'assets/characters/Son.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('murderer')) {
            this.load.spritesheet('murderer', 'assets/characters/Murderer.png', {
                frameWidth: 32, frameHeight: 48
            });
        }


        // Character portraits for dialogue
        this.load.image("LadyMacduff", "assets/portraits/LadyMacduff.png");
        this.load.image("Ross", "assets/portraits/Ross.png");
        this.load.image("Son", "assets/portraits/Son.png");
        this.load.image("Murderer", "assets/portraits/Murderer.png");

        // Scene music
        this.load.audio('act4scene2music', 'assets/audio/act4scene2music.mp3');

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
            'background_act4scene2', 'ladyMacduff', 'ross', 'son', 'murderer', 'act5scene2music',
            'LadyMacbeth', 'Ross', 'Son', 'Murderer'
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
        this.background = this.add.image(0, 0, 'background_act4scene2')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setDepth(-1);

        // Create animations
        this.createAnimations();

        // Play scene music
        if (this.audioController && this.cache.audio.exists('act4scene2music')) {
            this.audioController.playMusic('act4scene2music', this, { volume: 1, loop: true });
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
            this.dialogueManager.startDialogue("Act4Scene2", () => {
                // Replace 'NextSceneName' with your next scene
                this.switchScene('Act4Scene3');
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
            texture: 'ladyMacduff',
            frame: 0,
            scale: 1.5,
            displayName: 'Lady Macduff',
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
                key: "Ross",
                x: this.scale.width * 0.25,
                y: this.scale.height * 0.8,
                texture: 'ross',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Ross'
            },
            {
                key: "Son",
                x: this.scale.width * 0.5,
                y: this.scale.height * 0.8,
                texture: 'son',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Son'
            },
            {
                key: "Murderer",
                x: this.scale.width * 0.5,
                y: this.scale.height * 0.8,
                texture: 'murderer',
                frame: 0,
                scale: 1.5,
                animationKey: 'idleAnim',
                interactive: true,
                displayName: 'Murderer'
            },
            // Add more NPCs as needed
        ];

        // Use the base class method to create NPCs
        this.createNPCs(npcConfigs);
    }

    setupSceneDialogue() {
        if (!this.cache.json.exists('Act4Scene2Data')) return;

        try {
            const dialogueData = this.cache.json.get('Act4Scene2Data');

            // REPLACE: Map character names to portrait texture keys
            const portraitMap = {
                "Lady Macduff": "LadyMacduff",
                "Ross": "Ross",
                "Son": "Son",
                "Murderer": "Murderer"
            };

            // Use base class method to setup dialogue
            this.setupDialogue(dialogueData, portraitMap, "LadyMacduff");
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
                frames: [{ key: 'ladyMacduff', frame: 0 }],
                frameRate: 10
            });
        }

        if (!this.anims.exists('walkLeft')) {
            this.anims.create({
                key: 'walkLeft',
                frames: this.anims.generateFrameNumbers('ladyMacduff', {
                    start: 0, end: 3
                }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('walkRight')) {
            this.anims.create({
                key: 'walkRight',
                frames: this.anims.generateFrameNumbers('ladyMacduff', {
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
        if (!this.scene.isActive('Act4Scene2')) return; // REPLACE: Scene key

        const { width, height } = gameSize;

        // Resize background
        if (this.background?.active) {
            this.background.setDisplaySize(width, height);
        }

        // The rest of NPC repositioning is now handled by super.updateNametags()
    }
}