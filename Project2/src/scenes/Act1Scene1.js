import { BaseGameScene } from './BaseGameScene';

export class Act1Scene1 extends BaseGameScene {
    constructor() {
        super('Act1Scene1');
    }

    preload() {
        this.load.svg('background', 'assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
        this.load.json('act1scene1-dialogue', 'SceneDialogue/Act1Scene1.json');
    }

    create(data) {
        super.create();
        this.dialogueData = this.cache.json.get('act1scene1-dialogue') || {};

        const { width, height } = this.scale;

        // White Background (Ensures it's behind everything)
        this.whiteBg = this.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0, 0).setDepth(-1);

        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
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

        // Set player position
        const startX = data.position ? data.position.x : 100;
        const startY = data.position ? data.position.y : 100;

        if (this.player) {
            this.player.destroy();
        }

        this.player = this.physics.add.sprite(startX, startY, null)
            .setDisplaySize(100, 100)
            .setOrigin(0.5);
        this.player.body.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);

        this.createInteractBox();
    }

    update() {
        super.update();

        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.interactBox.x, this.interactBox.y
        );

        if (distance < 150) {
            this.interactText.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
                this.startDialogue();
            }
        } else {
            this.interactText.setVisible(false);
        }
    }

    createInteractBox() {
        const { width, height } = this.scale;
        
        this.interactBox = this.add.rectangle(width / 2, height * 0.2, 200, 80, 0x666666, 0.5)
            .setOrigin(0.5)
            .setInteractive();

        this.interactText = this.add.text(width / 2, height * 0.15, "[E] Start Dialogue", {
            fontSize: "18px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 5, y: 5 }
        }).setOrigin(0.5);

        this.interactText.setVisible(false);
        this.physics.add.existing(this.interactBox, true);
    }

    startDialogue() {
        console.log("Starting Dialogue in Act1Scene1...");
        this.interactBox.setVisible(false);
        this.interactText.setVisible(false);
        this.toggleDialogue("Witch2");
    }
}
