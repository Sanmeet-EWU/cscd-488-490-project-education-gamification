import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js';

export class Act1Scene2 extends BaseGameScene {
    constructor() {
        super('Act1Scene2');
        this.isCutscene = false;
    }

    preload() {
        this.load.svg('background_act1scene2', 'assets/act1/act1scene2.svg', { width: 2560, height: 1440 });
        this.load.json('Act1Scene2Data', 'SceneDialogue/Act1Scene2.json');
        this.load.audio('act1scene2Music', 'assets/audio/act1scene1.mp3');
    }

    create(data) {
        // Set up proper player config with horizontal movement
        data = data || {};
        data.playerConfig = {
            movementConstraint: 'horizontal',  // This restricts to left/right movement
            scale: 2                           // Scale the player
        };
        
        // Call base create method
        super.create(data);
        
        const { width, height } = this.scale;

        // Create background (fallback first)
        this.background = this.add.rectangle(0, 0, width, height, 0x333333)
            .setOrigin(0, 0)
            .setDepth(-1);
        
        // Replace with image if available
        if (this.textures.exists('background_act1scene2')) {
            this.background.destroy();
            this.background = this.add.image(0, 0, 'background_act1scene2')
                .setOrigin(0, 0)
                .setDisplaySize(width, height)
                .setDepth(-1);
        }

        // Make sure camera doesn't follow player
        this.cameras.main.stopFollow();
        
        // Set up physics world with gravity
        this.physics.world.setBounds(0, 0, width, height);
        this.physics.world.gravity.y = 300;
        
        // Make sure the floor exists
        this.createFloor();
        
        // If player exists, set up physics properly
        if (this.player) {
            // Set gravity
            if (this.player.body) {
                if (typeof this.player.body.setGravityY === 'function') {
                    this.player.body.setGravityY(300);
                } else {
                    this.player.body.gravity.y = 300;
                }
                
                // Make sure player collides with floor
                this.physics.add.collider(this.player, this.floor);
            }
        }
        
        // Create simple NPCs as colored rectangles
        this.npcs = {
            Malcolm: this.add.rectangle(width * 0.25, height * 0.8, 32, 48, 0xFF0000)
                .setInteractive()
                .on('pointerdown', () => this.startDialogue("Malcolm")),
            
            Captain: this.add.rectangle(width * 0.6, height * 0.8, 32, 48, 0x00FF00)
                .setInteractive()
                .on('pointerdown', () => this.startDialogue("Captain")),
            
            Ross: this.add.rectangle(width * 0.8, height * 0.8, 32, 48, 0x0000FF)
                .setInteractive()
                .on('pointerdown', () => this.startDialogue("Ross"))
        };
        
        // Setup dialogue system
        if (this.cache.json.exists('Act1Scene2Data')) {
            try {
                const dialogueData = this.cache.json.get('Act1Scene2Data');
                if (dialogueData) {
                    this.dialogueManager = new DialogueManager(this, dialogueData, {}, false, "Duncan");
                }
            } catch (error) {
                console.error("Error setting up dialogue:", error);
            }
        }
        
        // Play music
        if (this.audioController) {
            this.audioController.pauseMainMenuMusic();
            if (this.cache.audio.exists('act1scene2Music')) {
                this.audioController.playSceneMusic(this, 'act1scene2Music');
            }
        }
    }
    
    // Create a floor for the player to stand on
    createFloor() {
        const { width, height } = this.scale;
        const groundY = height * 0.9;
        
        // Create physics group for floor
        this.floor = this.physics.add.staticGroup();
        
        // Add a rectangle to the floor group
        const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
        this.floor.add(ground);
        
        // Make it invisible but still collidable
        ground.setVisible(false);
    }
    
    startDialogue(npcKey) {
        if (this.dialogueManager && !this.dialogueManager.isActive) {
            // Stop player movement during dialogue
            if (this.player && this.player.body) {
                this.player.body.setVelocity(0, 0);
            }
            
            this.dialogueManager.startDialogue(npcKey, () => {
                console.log(`Dialogue with ${npcKey} completed`);
            });
        }
    }
    
    update() {
        super.update();
        
        // Make sure player can only move left/right
        if (this.player && this.player.body && !this.isPaused) {
            const speed = 200;
            
            // Reset horizontal velocity
            if (typeof this.player.body.setVelocityX === 'function') {
                this.player.body.setVelocityX(0);
            } else if (this.player.body.velocity) {
                this.player.body.velocity.x = 0;
            }
            
            // Apply movement based on input
            if (this.keys.left.isDown) {
                if (typeof this.player.body.setVelocityX === 'function') {
                    this.player.body.setVelocityX(-speed);
                } else if (this.player.body.velocity) {
                    this.player.body.velocity.x = -speed;
                }
            } else if (this.keys.right.isDown) {
                if (typeof this.player.body.setVelocityX === 'function') {
                    this.player.body.setVelocityX(speed);
                } else if (this.player.body.velocity) {
                    this.player.body.velocity.x = speed;
                }
            }
        }
    }
    
    // Required method for scaling
    repositionUI({ width, height }) {
        // Update background
        if (this.background) {
            if (this.background.type === 'Image') {
                this.background.setDisplaySize(width, height);
            } else {
                this.background.width = width;
                this.background.height = height;
            }
        }
        
        // Update NPCs
        if (this.npcs) {
            if (this.npcs.Malcolm) this.npcs.Malcolm.setPosition(width * 0.25, height * 0.8);
            if (this.npcs.Captain) this.npcs.Captain.setPosition(width * 0.6, height * 0.8);
            if (this.npcs.Ross) this.npcs.Ross.setPosition(width * 0.8, height * 0.8);
        }
        
        // Update floor and physics world
        this.physics.world.setBounds(0, 0, width, height);
        if (this.floor && this.floor.clear) {
            this.floor.clear();
            const groundY = height * 0.9;
            const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
            this.floor.add(ground);
            ground.setVisible(false);
        }
        
        // Update dialogue position if active
        if (this.dialogueManager && this.dialogueManager.isActive && this.dialogueManager.adjustBoxSize) {
            this.dialogueManager.adjustBoxSize(width, height);
        }
    }
}