import { BaseGameScene } from '../BaseGameScene.js';

export class Act4Scene1 extends BaseGameScene {
    constructor() {
        // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
        super('Act4Scene1');

        // Set to true if this is a cutscene without player movement
        this.isCutscene = false;
    }

    preload() {
        // REPLACE: Load your scene specific assets

        // Background
        if (!this.textures.exists('background_act4scene1')) {
            this.load.svg('background_act4scene1', 'assets/act4/scene1.svg', { width: 2560, height: 1440 });
        }

        // Dialogue JSON
        if (!this.cache.json.exists('Act4Scene1Data')) {
            this.load.json('Act4Scene1Data', 'SceneDialogue/Act4Scene1.json');
        }

        // Character spritesheets
        if (!this.textures.exists('macbeth')) {
            this.load.spritesheet('macbeth', 'assets/characters/Macbeth.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('firstWitch')) {
            this.load.spritesheet('firstWitch', 'assets/characters/FirstWitch.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('secondWitch')) {
            this.load.spritesheet('secondWitch', 'assets/characters/SecondWitch.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('thirdWitch')) {
            this.load.spritesheet('thirdWitch', 'assets/characters/ThirdWitch.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('firstApparition')) {
            this.load.spritesheet('firstApparition', 'assets/characters/FirstApparition.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('secondApparition')) {
            this.load.spritesheet('secondApparition', 'assets/characters/SecondApparition.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('thirdApparition')) {
            this.load.spritesheet('thirdApparition', 'assets/characters/ThirdApparition.png', {
                frameWidth: 32, frameHeight: 48
            });
        }
        if (!this.textures.exists('lennnox')) {
            this.load.spritesheet('lennnox', 'assets/characters/Lennnox.png', {
                frameWidth: 32, frameHeight: 48
            });
        }

        


        // Character portraits for dialogue
        this.load.image("macbeth", "assets/portraits/Macbeth.png");
        this.load.image("firstWitch", "assets/portraits/FirstWitch.png");
        this.load.image("secondWitch", "assets/portraits/SecondWitch.png");
        this.load.image("thirdWitch", "assets/portraits/ThirdWitch.png");
        this.load.image("firstApparition", "assets/portraits/FirstApparition.png");
        this.load.image("secondApparition", "assets/portraits/SecondApparition.png");
        this.load.image("thirdApparition", "assets/portraits/ThirdApparition.png");
        this.load.image("lennnox", "assets/portraits/Lennnox.png");

        // Scene music
        this.load.audio('act4scene1music', 'assets/audio/act4scene1music.mp3');

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
            'background_act4scene1', 'macbeth', 'firstWitch', 'secondWitch', 'thirdWitch', 
            'firstApparition', 'secondApparition', 'thirdApparition', 'lennnox', 'act4scene1music',
            'Macbeth', 'FirstWitch', 'SecondWitch', 'ThirdWitch', 'FirstApparition', 'SecondApparition', 
            'ThirdApparition', 'Lennnox'
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
        this.background = this.add.image(0, 0, 'background_act4scene1')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setDepth(-1);

        // Create animations
        this.createAnimations();

        // Play scene music
        if (this.audioController && this.cache.audio.exists('act4scene1music')) {
            this.audioController.playMusic('act4scene1music', this, { volume: 1, loop: true });
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
            this.dialogueManager.startDialogue("Act4Scene1", () => {
                // Replace 'NextSceneName' with your next scene
                this.switchScene('Act4Scene1');
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
            texture: 'macbeth',
            frame: 0,
            scale: 1.5,
            displayName: 'Macbeth',
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
            key: "FirstWitch",
            x: this.scale.width * 0.9,
            y: this.scale.height * 0.8,
            texture: 'firstWitch',
            frame: 0,
            scale: 1.5,
            animationKey: 'idleAnim',
            interactive: true,
            displayName: 'First Witch'
            },
            {
            key: "SecondWitch",
            x: this.scale.width * 0.8,
            y: this.scale.height * 0.8,
            texture: 'secondWitch',
            frame: 0,
            scale: 1.5,
            animationKey: 'idleAnim',
            interactive: true,
            displayName: 'Second Witch'
            },
            {
            key: "ThirdWitch",
            x: this.scale.width * 0.7,
            y: this.scale.height * 0.8,
            texture: 'thirdWitch',
            frame: 0,
            scale: 1.5,
            animationKey: 'idleAnim',
            interactive: true,
            displayName: 'Third Witch'
            },
            {
            key: "FirstApparition",
            x: this.scale.width * 0.55,
            y: this.scale.height * 0.8,
            texture: 'firstApparition',
            frame: 0,
            scale: 1.5,
            animationKey: 'idleAnim',
            interactive: true,
            displayName: 'First Apparition'
            },
            {
            key: "SecondApparition",
            x: this.scale.width * 0.5,
            y: this.scale.height * 0.8,
            texture: 'secondApparition',
            frame: 0,
            scale: 1.5,
            animationKey: 'idleAnim',
            interactive: true,
            displayName: 'Second Apparition'
            },
            {
            key: "ThirdApparition",
            x: this.scale.width * 0.45,
            y: this.scale.height * 0.8,
            texture: 'thirdApparition',
            frame: 0,
            scale: 1.5,
            animationKey: 'idleAnim',
            interactive: true,
            displayName: 'Third Apparition'
            },
            {
            key: "Lennnox",
            x: this.scale.width * 0.1,
            y: this.scale.height * 0.8,
            texture: 'lennnox',
            frame: 0,
            scale: 1.5,
            animationKey: 'idleAnim',
            interactive: true,
            displayName: 'Lennnox'
            },
            // Add more NPCs as needed
        ];

        // Use the base class method to create NPCs
        this.createNPCs(npcConfigs);
    }

    setupSceneDialogue() {
        if (!this.cache.json.exists('Act4Scene1Data')) return;

        try {
            const dialogueData = this.cache.json.get('Act4Scene1Data');

            // REPLACE: Map character names to portrait texture keys
            const portraitMap = {
                "Macbeth": "macbeth",
                "First Witch": "firstWitch",
                "Second Witch": "secondWitch",
                "Third Witch": "thirdWitch",
                "First Apparition": "firstApparition",
                "Second Apparition": "secondApparition",
                "Third Apparition": "thirdApparition",
                "Lennnox": "lennnox"
            };

            // Use base class method to setup dialogue
            this.setupDialogue(dialogueData, portraitMap, "Macbeth");
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
                frames: [{ key: 'macbeth', frame: 0 }],
                frameRate: 10
            });
        }

        if (!this.anims.exists('walkLeft')) {
            this.anims.create({
                key: 'walkLeft',
                frames: this.anims.generateFrameNumbers('macbeth', {
                    start: 0, end: 3
                }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('walkRight')) {
            this.anims.create({
                key: 'walkRight',
                frames: this.anims.generateFrameNumbers('macbeth', {
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
        if (!this.scene.isActive('Act4Scene1')) return; // REPLACE: Scene key

        const { width, height } = gameSize;

        // Resize background
        if (this.background?.active) {
            this.background.setDisplaySize(width, height);
        }

        // The rest of NPC repositioning is now handled by super.updateNametags()
    }
}