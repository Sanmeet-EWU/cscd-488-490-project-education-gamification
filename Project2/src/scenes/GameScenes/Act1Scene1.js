import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js'; // Adjust path as needed

export class Act1Scene1 extends BaseGameScene {
    constructor() {
        super('Act1Scene1');
    }

    preload() {
        // Load background SVG and dialogue JSON
        this.load.svg('background', 'assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
        this.load.json('Act1Scene1Data', 'SceneDialogue/Act1Scene1.json');
        // Load assets for the dialogue (sample assets)
        this.load.image('witch2', 'assets/characters/witch2.png');
        this.load.image('player', 'assets/characters/player.png');
    }

    create(data) {
        super.create(data);
        const { width, height } = this.scale;
    
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
    
        const dialogueData = this.cache.json.get('Act1Scene1Data');
        this.dialogueManager = new DialogueManager(this, dialogueData);
    
        const startX = data && data.position ? data.position.x : 100;
        const startY = data && data.position ? data.position.y : 100;
    
        if (this.player) {
            this.player.destroy();
        }
    
        this.player = this.physics.add.sprite(startX, startY, 'player')
            .setDisplaySize(100, 100)
            .setOrigin(0.5);
        this.player.body.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);
    
        const interactBox = this.add.rectangle(width / 2, height - 50, 200, 50, 0x000000, 0.7)
            .setOrigin(0.5)
            .setInteractive();
        
        const interactText = this.add.text(width / 2, height - 50, 'Interact', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
    
        interactBox.on('pointerdown', () => {
            if (!this.inDialogue) {
                this.dialogueManager.startDialogue('Witch2');
            }
        });
    }
    
}
