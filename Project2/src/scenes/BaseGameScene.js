import { BaseScene } from './BaseScene';
import { saveGameData, loadGameData } from "../../firebase/firebase.js";

export class BaseGameScene extends BaseScene {
    constructor(key = 'BaseGameScene') {
        super(key);
        this.playerConfig = {
            texture: 'player',
            scale: 1,
            animationKey: null,
            movementConstraint: 'free' // 'free', 'horizontal', 'none'
        };
    }

    init(data) {
        this.viewOnly = data?.viewOnly || false;
        this.isCutscene = data?.isCutscene || false;
        if (data.position) this.startingPosition = data.position;
        
        // Apply player config if provided
        if (data.playerConfig) {
            this.playerConfig = { ...this.playerConfig, ...data.playerConfig };
        }
    }

    create() {
        super.create();

        this.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.ESC]);
        if (this.game.canvas) this.game.canvas.focus();

        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            interact: Phaser.Input.Keyboard.KeyCodes.E,
            pause: Phaser.Input.Keyboard.KeyCodes.ESC
        });

        if (!this.isCutscene) {
            // Create floor for horizontal movement if needed
            if (this.playerConfig.movementConstraint === 'horizontal') {
                this.createFloor();
            }
            
            // Create player with specified texture and frame
            this.player = this.physics.add.sprite(
                this.startingPosition?.x || 100,
                this.startingPosition?.y || 100,
                this.playerConfig.texture,
                this.playerConfig.frame
            );
            
            // Apply scale if specified
            if (this.playerConfig.scale && this.playerConfig.scale !== 1) {
                this.player.setScale(this.playerConfig.scale);
            }
            
            // Apply animation if specified
            if (this.playerConfig.animations?.idle) {
                this.player.play(this.playerConfig.animations.idle);
            }
            
            this.player.setCollideWorldBounds(true);
            
            // Add gravity if horizontal movement
            if (this.playerConfig.movementConstraint === 'horizontal') {
                this.physics.world.gravity.y = 300;
                this.player.setGravityY(300);
                
                // Add collision between player and floor
                if (this.floor) {
                    this.physics.add.collider(this.player, this.floor);
                }
            }
            
            this.cameras.main.startFollow(this.player);
        }

        this.isPaused = false;
        
        // Initialize audio controller
        this.audioController = this.sys.game.globals.audioController;
        if (this.audioController) {
            this.audioController._currentSceneKey = this.scene.key;
            this.audioController._gameScenePaused = false;
            this.audioController._pausedSceneKey = null;
        }
    }

    createFloor() {
        const { width, height } = this.scale;
        // Create an invisible platform at the bottom of the screen
        const groundY = height * 0.9; // Position the floor at 90% of the screen height
        
        this.floor = this.physics.add.staticGroup();
        this.floor.create(width / 2, groundY, 'ground')
            .setDisplaySize(width, 20)
            .refreshBody()
            .setVisible(false); // Make it invisible
    }

    update(time, delta) {
        if (this.isPaused) return;
        super.update();

        if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
            this.togglePause();
            return;
        }

        if (!this.isCutscene && this.player) {
            const speed = 500;
            let vx = 0, vy = 0;
            
            // Handle movement based on constraint type
            if (this.playerConfig.movementConstraint === 'free') {
                // Full movement
                if (this.keys.left.isDown) vx = -speed;
                else if (this.keys.right.isDown) vx = speed;
                if (this.keys.up.isDown) vy = -speed;
                else if (this.keys.down.isDown) vy = speed;
                this.player.setVelocity(vx, vy);
            } 
            else if (this.playerConfig.movementConstraint === 'horizontal') {
                // Only left/right movement (gravity handles vertical)
                if (this.keys.left.isDown) vx = -speed;
                else if (this.keys.right.isDown) vx = speed;
                this.player.setVelocityX(vx);
                
                // Add idle/walking animations if configured
                if (this.playerConfig.animations) {
                    if (vx === 0 && this.playerConfig.animations.idle) {
                        this.player.play(this.playerConfig.animations.idle, true);
                    } else if (vx < 0 && this.playerConfig.animations.walkLeft) {
                        this.player.play(this.playerConfig.animations.walkLeft, true);
                    } else if (vx > 0 && this.playerConfig.animations.walkRight) {
                        this.player.play(this.playerConfig.animations.walkRight, true);
                    }
                }
            }
            else if (this.playerConfig.movementConstraint === 'none') {
                // No movement allowed (for cutscenes where player is displayed but can't move)
                this.player.setVelocity(0, 0);
            }
        }
    }

    createNPCs(npcDefs) {
        this.npcs = {};
        npcDefs.forEach(def => {
            const npc = this.add.sprite(def.x, def.y, def.texture, def.frame).setOrigin(0.5);
            if (def.scale) npc.setScale(def.scale);
            if (def.animationKey) npc.play(def.animationKey);
            if (def.interactive) {
                npc.setInteractive();
                npc.on("pointerdown", () => {
                    if (def.onClick) def.onClick.call(this, def.key);
                    else this.handleInteraction(def.key);
                });
            }
            this.npcs[def.key] = npc;
        });
    }

    handleInteraction(npcKey) {
        // Override in derived classes
    }

    async saveProgress() {
        if (this.viewOnly) {
            return;
        }
        try {
            const saveData = {
                scene: this.scene.key,
                position: this.player ? { x: this.player.x, y: this.player.y } : null,
                score: this.score || 0,
                inventory: this.inventory || []
            };
            await saveGameData(saveData);
        } catch (error) {
            // Silent fail
        }
    }

    async loadProgress() {
        try {
            const saveData = await loadGameData();
            if (saveData) {
                this.scene.start(saveData.scene, { position: saveData.position });
            }
        } catch (error) {
            // Silent fail
        }
    }

    togglePause() {
        if (this.ignoreNextESC) return;
        this.audioController = this.sys.game.globals.audioController;

        if (this.isPaused) {
            this.isPaused = false;
            this.physics.world.resume();
            this.scene.stop('PauseMenu');
            
            if (this.audioController) {
                this.audioController.setGameSceneResumed();
            }
            
            this.ignoreNextESC = true;
            this.time.delayedCall(300, () => this.ignoreNextESC = false);
        } else {
            this.isPaused = true;
            this.physics.world.pause();
            if (this.player) this.player.setVelocity(0);
            this.scene.launch('PauseMenu', { gameScene: this });
        }
    }
}