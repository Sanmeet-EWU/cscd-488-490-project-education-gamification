import { BaseGameScene } from '../BaseGameScene.js';
import { DialogueManager } from '../../DialogueManager.js'; // Adjust path as needed

export class Act1Scene1 extends BaseGameScene {
    constructor() {
        super('Act1Scene1');
    }

    preload() {
        this.load.svg('background', 'assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
        this.load.json('Act1Scene1Data', 'SceneDialogue/Act1Scene1.json');

        // Load placeholder NPC boxes
        this.load.image('npcBox', 'assets/ui/npcBox.png'); // Placeholder box image
    }

    create(data) {
        super.create(data);
        const { width, height } = this.scale;

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

        // Create NPC placeholders
        this.createNPCs();

        // Create Start Button
        this.createStartButton();
    }

    createNPCs() {
        const { width, height } = this.scale;
        
        const npcPositions = [
            { key: "Witch1", x: width * 0.3, y: height * 0.5 },
            { key: "Witch2", x: width * 0.5, y: height * 0.5 },
            { key: "Witch3", x: width * 0.7, y: height * 0.5 }
        ];

        npcPositions.forEach(npc => {
            this.add.rectangle(npc.x, npc.y, 120, 50, 0x333333, 0.8).setOrigin(0.5);
            this.add.text(npc.x, npc.y, npc.key, {
                font: "20px Arial",
                fill: "#ffffff",
                align: "center"
            }).setOrigin(0.5);
        });
    }

    createStartButton() {
        const { width, height } = this.scale;

        const startButton = this.add.rectangle(width / 2, height * 0.8, 200, 50, 0x4444ff, 0.8)
            .setOrigin(0.5)
            .setInteractive();

        const startText = this.add.text(width / 2, height * 0.8, "Start", {
            font: "24px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);

        startButton.on("pointerdown", () => {
            console.log("Start button clicked!"); // Debug log

            // Remove the button
            startButton.destroy();
            startText.destroy();

            // Start the dialogue system
            if (this.dialogueManager) {
                console.log("Starting dialogue with Witch2...");
                this.dialogueManager.startDialogue("Act1Scene1");
            } else {
                console.error("DialogueManager is not initialized!");
            }
        });
    }
}
