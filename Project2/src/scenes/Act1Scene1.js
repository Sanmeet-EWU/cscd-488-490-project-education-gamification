import { BaseGameScene } from './BaseGameScene';

export class Act1Scene1 extends BaseGameScene {
    constructor() {
        super('Act1Scene1');
    }

    preload() {
        this.load.svg('background', 'assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
        this.load.json('Act1Scene1Dialog', 'SceneDialog/Act1Scene1.json');
    }

    create(data) {
        super.create();

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
    }

}
