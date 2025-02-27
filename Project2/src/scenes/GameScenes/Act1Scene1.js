import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene1 extends BaseGameScene {
    constructor() {
        super('Act1Scene1');
        this.isCutscene = true; // Prevent player creation
    }

    preload() {
        // Check if assets already exist to prevent duplicate loading
        if (!this.textures.exists('background')) {
            this.load.svg('background', 'assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
        }
        
        if (!this.cache.json.exists('Act1Scene1Data')) {
            this.load.json('Act1Scene1Data', 'SceneDialogue/Act1Scene1.json');
        }
        
        // Load other required assets
        this.load.spritesheet('WitchIdle', 'assets/characters/B_witch_idle.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('lightning1', 'assets/effects/lightning1.svg');
        this.load.image('lightning2', 'assets/effects/lightning2.svg');
        this.load.image('lightning3', 'assets/effects/lightning3.svg');
        this.load.image('lightning4', 'assets/effects/lightning4.svg');
        this.load.audio('thunder', 'assets/audio/thunder.mp3');
        this.load.audio('sceneMusic', 'assets/audio/act1scene1.mp3');
        this.load.image('witch1portrait', 'assets/portraits/witch1portrait.png');
        this.load.image('witch2portrait', 'assets/portraits/witch2portrait.png');
        this.load.image('witch3portrait', 'assets/portraits/witch3portrait.png');
        
        // Add loading error handler
        this.load.on('loaderror', (fileObj) => {
            console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
        });
    }

    create(data) {
        super.create(data);
        const { width, height } = this.scale;

        // Verify critical assets are loaded
        const requiredAssets = [
            'background',
            'WitchIdle',
            'lightning1',
            'lightning2',
            'lightning3',
            'lightning4',
            'thunder',
            'sceneMusic',
            'witch1portrait',
            'witch2portrait',
            'witch3portrait'
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

        this.audioController = this.sys.game.globals.audioController;
        if (this.audioController) {
            this.audioController.pauseMainMenuMusic();
        } else {
            console.error("AudioController not initialized");
        }

        this.whiteBg = this.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0, 0).setDepth(-1);
        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(width, height);

        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);

        this.npcDefs = [
            { key: "Witch1", xRatio: 0.25, yRatio: 0.8, scale: 7, animationKey: 'witchIdle', texture: 'WitchIdle', interactive: false },
            { key: "Witch2", xRatio: 0.4, yRatio: 0.55, scale: 7, animationKey: 'witchIdle', texture: 'WitchIdle', interactive: false },
            { key: "Witch3", xRatio: 0.75, yRatio: 0.8, scale: 7, animationKey: 'witchIdle', texture: 'WitchIdle', interactive: false }
        ];

        this.scale.on('resize', this.onResize, this);

        try {
            if (!this.cache.json.exists('Act1Scene1Data')) {
                throw new Error("Dialogue data not found");
            }
            
            const portraitMap = {
                "First Witch": "witch1portrait",
                "Second Witch": "witch2portrait",
                "Third Witch": "witch3portrait"
            };
            
            const dialogueData = this.cache.json.get('Act1Scene1Data');
            if (!dialogueData || Object.keys(dialogueData).length === 0) {
                throw new Error("Dialogue data is empty");
            }
            
            this.dialogueManager = new DialogueManager(this, dialogueData, portraitMap, true);
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

        this.createAnimations();
        this.playLightningEffect();

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
    }

    createAnimations() {
        if (!this.anims.exists('witchIdle')) {
            this.anims.create({
                key: 'witchIdle',
                frames: this.anims.generateFrameNumbers('WitchIdle', { start: 0, end: 5 }),
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
            scale: def.scale,
            animationKey: def.animationKey,
            interactive: def.interactive
        }));
        
        // Safeguard against multiple calls
        if (!this.npcs) {
            this.createNPCs(npcDefsForCreation);
        }
    }

    playLightningEffect() {
        const { width, height } = this.scale;
        const lightningYStart = -height * 0.2;
        const lightningYEnd = height * 0.4;

        // Make sure the texture exists
        if (!this.textures.exists('lightning1')) {
            console.error("Lightning texture not found");
            // Continue with dialogue anyway
            this.spawnNPCs();
            if (this.audioController) {
                this.audioController.playSceneMusic(this, 'sceneMusic');
            }
            if (this.dialogueManager) {
                this.dialogueManager.startDialogue("Act1Scene1", () => this.switchScene('Act1Scene2'));
            }
            return;
        }

        const lightning = this.add.image(width / 2, lightningYStart, 'lightning1')
            .setOrigin(0.5)
            .setDisplaySize(width, height)
            .setAlpha(0)
            .setDepth(5);

        // Play thunder sound with error handling
        try {
            if (this.sound.locked) {
                console.log("Sound system is locked, waiting for user interaction");
                const unlockAudio = () => {
                    this.sound.play('thunder', { volume: this.audioController ? this.audioController.soundVolume : 0.5 });
                    this.input.off('pointerdown', unlockAudio);
                };
                this.input.once('pointerdown', unlockAudio);
            } else {
                this.sound.play('thunder', { volume: this.audioController ? this.audioController.soundVolume : 0.5 });
            }
        } catch (error) {
            console.error("Failed to play thunder sound:", error);
        }

        // Create lightning animation with tweens
        this.tweens.add({
            targets: lightning,
            y: lightningYEnd,
            alpha: 1,
            duration: 200,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                // Lightning flicker effect
                this.time.delayedCall(100, () => {
                    if (lightning.active) lightning.setAlpha(0);
                });
                this.time.delayedCall(200, () => {
                    if (lightning.active) lightning.setAlpha(1);
                });
                this.time.delayedCall(300, () => {
                    if (lightning.active) lightning.setAlpha(0);
                });
                this.time.delayedCall(400, () => {
                    if (lightning.active) lightning.setAlpha(1);
                });
                this.time.delayedCall(600, () => {
                    if (lightning.active) lightning.setAlpha(0);
                });
                
                // Spawn NPCs and start music
                this.time.delayedCall(800, () => this.spawnNPCs());
                this.time.delayedCall(1000, () => {
                    if (this.audioController) {
                        this.audioController.playSceneMusic(this, 'sceneMusic');
                    }
                });
                
                // Start dialogue sequence
                this.time.delayedCall(1400, () => {
                    if (this.dialogueManager) {
                        this.dialogueManager.startDialogue("Act1Scene1", () => {
                            console.log("Dialogue complete, switching to Act1Scene2");
                            this.switchToAct1Scene2();
                        });
                    } else {
                        console.error("DialogueManager not initialized, cannot start dialogue");
                        // Fallback to next scene anyway
                        this.switchToAct1Scene2();
                    }
                });
            }
        });
    }

    // Improved resize handler
    onResize(gameSize) {
        if (!this.scene.isActive('Act1Scene1')) return;
        
        const { width, height } = gameSize;
        
        // Update background elements
        if (this.whiteBg && this.whiteBg.active) this.whiteBg.setSize(width, height);
        if (this.background && this.background.active) this.background.setDisplaySize(width, height);
        
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
    
    // Method to handle scene transition issues
    switchToAct1Scene2() {
        try {
            // Check if Act1Scene2 exists
            if (this.scene.get('Act1Scene2')) {
                this.switchScene('Act1Scene2');
            } else {
                console.error("Act1Scene2 scene not found");
                this.switchScene('MainMenu');
            }
        } catch (error) {
            console.error("Failed to switch to Act1Scene2:", error);
            // Fallback to main menu
            this.switchScene('MainMenu');
        }
    }
}