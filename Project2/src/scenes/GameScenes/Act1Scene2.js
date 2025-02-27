import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene2 extends BaseGameScene {
    constructor() {
        super('Act1Scene2');
        
        // Set Duncan as the player character for this scene (older bearded king - row 5)
        this.playerConfig = {
            texture: 'characters',        // Spritesheet key
            frame: 48,                    // Frame number for Duncan (adjust based on your spritesheet)
            scale: 2,                     // Scale factor
            movementConstraint: 'horizontal', // Restrict to left/right movement
            animations: {
                idle: 'duncanIdle',       // Animation key for idle
                walkLeft: 'duncanWalkLeft',  // Animation key for walking left
                walkRight: 'duncanWalkRight' // Animation key for walking right
            }
        };
    }

    preload() {
        // Check if assets already exist to prevent duplicate loading
        if (!this.textures.exists('background_act1scene2')) {
            this.load.svg('background_act1scene2', 'assets/act1/act1scene2.svg', { width: 2560, height: 1440 });
        }
        
        if (!this.cache.json.exists('Act1Scene2Data')) {
            this.load.json('Act1Scene2Data', 'SceneDialogue/Act1Scene2.json');
        }
        
        // Load character sprites as a spritesheet
        this.load.spritesheet('characters', 'assets/characters/characters.png', { 
            frameWidth: 32,  // Adjust to match your actual sprite width
            frameHeight: 48  // Adjust to match your actual sprite height
        });
        
        // Load character portraits
        this.load.image('duncanPortrait', 'assets/portraits/duncanPortrait.png');
        this.load.image('malcolmPortrait', 'assets/portraits/malcolmPortrait.png');
        this.load.image('captainPortrait', 'assets/portraits/captainPortrait.png');
        this.load.image('rossPortrait', 'assets/portraits/rossPortrait.png');
        
        // Load ground/platform texture
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xFFFFFF, 0);  // Transparent fill
        graphics.fillRect(0, 0, 1, 1);
        graphics.generateTexture('ground', 1, 1);
        
        // Load audio
        this.load.audio('act1scene2Music', 'assets/audio/act1scene1.mp3');
        
        // Add loading error handler
        this.load.on('loaderror', (fileObj) => {
            console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
        });
    }

    create(data) {
        try {
            // If the player needs to be Duncan, set it before calling super.create()
            if (!data.playerConfig) {
                data.playerConfig = this.playerConfig;
            }
            
            super.create(data);
            const { width, height } = this.scale;

            // Create array of assets that MUST exist
            const requiredAssets = [
                'background_act1scene2',
                'characters',
                'ground',
                'act1scene2Music'
            ];
            
            const missingAssets = requiredAssets.filter(asset => 
                !(this.textures.exists(asset) || this.cache.audio.exists(asset))
            );
            
            if (missingAssets.length > 0) {
                console.error("Missing required assets:", missingAssets);
                this.add.text(width / 2, height / 2, "Error: Missing assets\n" + missingAssets.join(', '), { 
                    fontSize: '32px', 
                    color: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 4,
                    align: 'center'
                }).setOrigin(0.5);
                return;
            }

            this.cameras.main.fadeIn(1000, 0, 0, 0);

            // Setup audio
            this.audioController = this.sys.game.globals.audioController;
            if (this.audioController) {
                this.audioController.pauseMainMenuMusic();
                this.audioController.playSceneMusic(this, 'act1scene2Music');
            } else {
                console.error("AudioController not initialized");
            }

            // Create background
            this.background = this.add.image(0, 0, 'background_act1scene2')
                .setOrigin(0, 0)
                .setDisplaySize(width, height);

            // Setup physics
            this.physics.world.setBounds(0, 0, width, height);
            this.cameras.main.setBounds(0, 0, width, height);

            // Define the NPCs for this scene
            this.npcDefs = [
                { 
                    key: "Malcolm", 
                    xRatio: 0.25, 
                    yRatio: 0.8, 
                    scale: 2, 
                    animationKey: 'malcolmIdle', 
                    texture: 'characters', 
                    frame: 0,  // Blonde character - first frame
                    interactive: true,
                    onClick: () => this.startDialogue("Malcolm") 
                },
                { 
                    key: "Captain", 
                    xRatio: 0.6, 
                    yRatio: 0.8, 
                    scale: 2, 
                    animationKey: 'captainIdle', 
                    texture: 'characters', 
                    frame: 3,  // Hat character - use appropriate frame number
                    interactive: true,
                    onClick: () => this.startDialogue("Captain") 
                },
                { 
                    key: "Ross", 
                    xRatio: 0.8, 
                    yRatio: 0.8, 
                    scale: 2, 
                    animationKey: 'rossIdle', 
                    texture: 'characters', 
                    frame: 6,  // Armored character - use appropriate frame number
                    interactive: true,
                    onClick: () => this.startDialogue("Ross") 
                }
            ];

            // Create animations
            this.createAnimations();
            
            // Spawn NPCs
            this.spawnNPCs();

            // Setup dialogue system
            try {
                if (!this.cache.json.exists('Act1Scene2Data')) {
                    throw new Error("Dialogue data not found");
                }
                
                const portraitMap = {
                    "Duncan": "duncanPortrait",
                    "Malcolm": "malcolmPortrait",
                    "Captain": "captainPortrait",
                    "Ross": "rossPortrait"
                };
                
                const dialogueData = this.cache.json.get('Act1Scene2Data');
                if (!dialogueData || Object.keys(dialogueData).length === 0) {
                    throw new Error("Dialogue data is empty");
                }
                
                this.dialogueManager = new DialogueManager(this, dialogueData, portraitMap, false, "Duncan");
            } catch (error) {
                console.error("Failed to initialize DialogueManager:", error);
                this.add.text(width / 2, height / 2, `Error: ${error.message}`, { 
                    fontSize: '32px', 
                    color: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0.5);
                return;
            }

            // Setup resize listener
            this.scale.on('resize', this.onResize, this);

            // Start intro dialogue (optional)
            this.time.delayedCall(1000, () => {
                if (this.dialogueManager) {
                    this.dialogueManager.startDialogue("Act1Scene2", () => {
                        console.log("Dialogue complete, player can now move");
                        // Enable player control after dialogue if needed
                    });
                }
            });

            // Add shutdown event handler
            this.events.on('shutdown', () => {
                this.scale.off('resize', this.onResize, this);
                if (this.audioController) {
                    this.audioController.stopSceneMusic();
                }
                if (this.dialogueManager) {
                    this.dialogueManager.destroy();
                }
            });
        } catch (e) {
            console.error("Critical error in Act1Scene2 create():", e);
            const { width, height } = this.scale;
            this.add.text(width / 2, height / 2, `Critical Error: ${e.message}`, { 
                fontSize: '32px', 
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }
    }

    createAnimations() {
        // Create animations for all characters using frame numbers
        console.log("Creating animations for", this.textures.get('characters'));
        // Duncan animations (older bearded king - row 5)
        if (!this.anims.exists('duncanIdle')) {
            this.anims.create({
                key: 'duncanIdle',
                frames: this.anims.generateFrameNumbers('characters', { 
                    start: 48, 
                    end: 50 
                }),
                frameRate: 6,
                repeat: -1
            });
        }
        
        if (!this.anims.exists('duncanWalkRight')) {
            this.anims.create({
                key: 'duncanWalkRight',
                frames: this.anims.generateFrameNumbers('characters', { 
                    start: 63, 
                    end: 65 
                }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (!this.anims.exists('duncanWalkLeft')) {
            this.anims.create({
                key: 'duncanWalkLeft',
                frames: this.anims.generateFrameNumbers('characters', { 
                    start: 66, 
                    end: 68 
                }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Malcolm animations (young blonde character - row 1)
        if (!this.anims.exists('malcolmIdle')) {
            this.anims.create({
                key: 'malcolmIdle',
                frames: this.anims.generateFrameNumbers('characters', { 
                    start: 0, 
                    end: 2 
                }),
                frameRate: 6,
                repeat: -1
            });
        }
        
        // Captain animations (character with hat - row 2)
        if (!this.anims.exists('captainIdle')) {
            this.anims.create({
                key: 'captainIdle',
                frames: this.anims.generateFrameNumbers('characters', { 
                    start: 3, 
                    end: 5 
                }),
                frameRate: 6,
                repeat: -1
            });
        }
        
        // Ross animations (knight character - row 3)
        if (!this.anims.exists('rossIdle')) {
            this.anims.create({
                key: 'rossIdle',
                frames: this.anims.generateFrameNumbers('characters', { 
                    start: 6, 
                    end: 8 
                }),
                frameRate: 6,
                repeat: -1
            });
        }
    }

    spawnNPCs() {
        const { width, height } = this.scale;
        const npcDefsForCreation = this.npcDefs.map(def => ({
            key: def.key,
            x: width * def.xRatio,
            y: height * def.yRatio,
            texture: def.texture,
            frame: def.frame,
            scale: def.scale,
            animationKey: def.animationKey,
            interactive: def.interactive,
            onClick: def.onClick
        }));
        
        // Create NPCs
        this.createNPCs(npcDefsForCreation);
    }

    startDialogue(npcKey) {
        if (this.dialogueManager && !this.dialogueManager.isActive) {
            // Disable player movement during dialogue
            if (this.player) this.player.setVelocity(0, 0);
            
            this.dialogueManager.startDialogue(npcKey, () => {
                console.log(`Dialogue with ${npcKey} completed`);
                // Any post-dialogue actions
            });
        }
    }

    handleInteraction(npcKey) {
        this.startDialogue(npcKey);
    }

    onResize(gameSize) {
        if (!this.scene.isActive('Act1Scene2')) return;
        
        const { width, height } = gameSize;
        
        // Update background
        if (this.background && this.background.active) {
            this.background.setDisplaySize(width, height);
        }
        
        // Update floor position
        if (this.floor) {
            this.floor.clear();
            const groundY = height * 0.9;
            this.floor.create(width / 2, groundY, 'ground')
                .setDisplaySize(width, 20)
                .refreshBody()
                .setVisible(false);
        }
        
        // Update physics and camera bounds
        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);
        
        // Update NPC positions
        if (this.npcs) {
            this.npcDefs.forEach(def => {
                const npc = this.npcs[def.key];
                if (npc && npc.active) {
                    npc.x = width * def.xRatio;
                    npc.y = height * def.yRatio;
                }
            });
        }
        
        // Update dialogue position if active
        if (this.dialogueManager && this.dialogueManager.isActive) {
            this.dialogueManager.adjustBoxSize(width, height);
        }
    }

    // Method to proceed to the next scene
    proceedToNextScene() {
        this.switchScene('Act1Scene3');
    }
}