import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js'; // Adjust path as needed

export class Act1Scene1 extends BaseGameScene {
    constructor() {
        super('Act1Scene1');
    }

    preload() {
        this.load.svg('background', 'assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
        this.load.json('Act1Scene1Data', 'SceneDialogue/Act1Scene1.json');

        // Load witch idle sprite sheet
        this.load.spritesheet('WitchIdle', 'assets/characters/B_witch_idle.png', {
            frameWidth: 32, 
            frameHeight: 48
        });

        // Load lightning effects
        this.load.image('lightning1', 'assets/effects/lightning1.svg');
        this.load.image('lightning2', 'assets/effects/lightning2.svg');
        this.load.image('lightning3', 'assets/effects/lightning3.svg');
        this.load.image('lightning4', 'assets/effects/lightning4.svg');

        // Load thunder sound effect
        this.load.audio('thunder', 'assets/audio/thunder.mp3');
        this.load.audio('sceneMusic', 'assets/audio/act1scene1.mp3');

        // Load portraits
        this.load.image('witch1portrait', 'assets/portraits/witch1portrait.png');
        this.load.image('witch2portrait', 'assets/portraits/witch2portrait.png');
        this.load.image('witch3portrait', 'assets/portraits/witch3portrait.png');
   
    }

    create(data) {
        super.create(data);
        const { width, height } = this.scale;

        // Fade in effect from the main menu
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Stop background music
        if (this.game.globals.bgMusic) {
            this.game.globals.bgMusic.stop();
            this.game.globals.bgMusic = null;
        }

        // Background
        this.whiteBg = this.add.rectangle(0, 0, width, height, 0xffffff)
            .setOrigin(0, 0)
            .setDepth(-1);
    
        this.background = this.add.image(0, 0, 'background')
            .setOrigin(0, 0);
        this.background.setDisplaySize(width, height);

        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);

        this.scale.on('resize', (gameSize) => {
            const newWidth = gameSize.width;
            const newHeight = gameSize.height;
            this.whiteBg.setSize(newWidth, newHeight);
            this.background.setDisplaySize(newWidth, newHeight);
            this.physics.world.setBounds(0, 0, newWidth, newHeight);
            this.cameras.main.setBounds(0, 0, newWidth, newHeight);
        });

        // Ensure dialogue JSON is loaded before using it
        if (!this.cache.json.exists('Act1Scene1Data')) {
            console.error("Error: Dialogue data not found. Cannot initialize DialogueManager.");
            return;
        }

        // Initialize DialogueManager
        const dialogueData = this.cache.json.get('Act1Scene1Data');
        this.dialogueManager = new DialogueManager(this, dialogueData, null);

        // Create animation for witches
        this.createAnimations();



        // Start cutscene
        this.playLightningEffect();
    }

    createAnimations() {
        this.anims.create({
            key: 'witchIdle',
            frames: this.anims.generateFrameNumbers('WitchIdle', { start: 0, end: 5 }), // Adjust based on sprite frames
            frameRate: 6,
            repeat: -1 // Loop animation
        });
    }

createNPCs() {
    const { width, height } = this.scale;
    
    const npcPositions = [
        { key: "Witch1", x: width * 0.25, y: height * 0.8, scale: 7 }, 
        { key: "Witch2", x: width * 0.4, y: height * 0.55, scale: 7 },  
        { key: "Witch3", x: width * 0.75, y: height * 0.8, scale: 7 } 
    ];

    npcPositions.forEach(npc => {
        this.add.sprite(npc.x, npc.y, 'WitchIdle')
            .setOrigin(0.5)
            .setScale(npc.scale) // Adjust scale for depth effect
            .play('witchIdle');  // Play animation
    });
}


    playLightningEffect() {
        const { width, height } = this.scale;
        const lightningScale = 1.5; // Increase size (70% of screen width)
        const lightningYStart = -height * 0.2; // Start off-screen
        const lightningYEnd = height * 0.4; // Crash position
    
        // Create lightning sprites off-screen with depth 5 (behind witches, in front of background)
        const lightning = this.add.image(width / 2, lightningYStart, 'lightning1')
            .setOrigin(0.5)
            .setDisplaySize(width * 1, height * 1)
            .setAlpha(0)
            .setDepth(5);
    
        // Play thunder sound effect
        this.sound.play('thunder', { volume: 1 });
    
        // Lightning crash animation (fast)
        this.tweens.add({
            targets: lightning,
            y: lightningYEnd,
            alpha: 1,
            duration: 200, // Quick crash effect
            ease: 'Bounce.easeOut',
            onComplete: () => {
                // Flash effect (make it blink rapidly)
                this.time.delayedCall(100, () => { lightning.setAlpha(0); }, [], this);
                this.time.delayedCall(200, () => { lightning.setAlpha(1); }, [], this);
                this.time.delayedCall(300, () => { lightning.setAlpha(0); }, [], this);
                this.time.delayedCall(400, () => { lightning.setAlpha(1); }, [], this);
                this.time.delayedCall(600, () => { lightning.setAlpha(0); }, [], this);
    
                this.time.delayedCall(800, () => {
                    this.createNPCs(); 
                }, [], this);
                
                // Start background music AFTER witches appear
                this.time.delayedCall(1000, () => {
                    this.playSceneMusic();
                }, [], this);
                
                // Start dialogue AFTER music starts
                this.time.delayedCall(1400, () => {
                    if (this.dialogueManager) {
                        this.dialogueManager.startDialogue("Act1Scene1");
                    }
                });
                
            }
        });
    }
    playSceneMusic() {
        if (!this.sound.get('sceneMusic')) { // Prevent multiple instances
            this.sceneMusic = this.sound.add('sceneMusic', { volume: 0.8, loop: true });
            this.sceneMusic.play();
        }
    }
    
    
}
