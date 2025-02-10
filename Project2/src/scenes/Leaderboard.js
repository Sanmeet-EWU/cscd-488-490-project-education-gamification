import { BaseScene } from './BaseScene';

const leaderboardData = {
    First: 'GravyTrain369',
    Second: 'SaucySally',
    Third: 'ButterBiscuit',
};

export class Leaderboard extends BaseScene {
    constructor() {
        super('Leaderboard');
    }

    create() {
        super.create();
        const { width, height } = this.scale;
        
        // Back button using the image-based implementation.
        this.backButton = this.add.image(width * 0.1, height * 0.1, 'backButton')
            .setInteractive();
        // Set initial scale using a larger factor.
        this.fitToScreen(this.backButton, 0.8);
        this.backButton.on('pointerdown', () => {
            this.switchScene('MainMenu');
        });

        // Title text.
        this.title = this.add.text(width / 2, height * 0.15, 'Leaderboard', {
            fontFamily: 'Inknut Antiqua',
            fontSize: `${Math.floor(height * 0.08)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Leaderboard entries.
        this.entries = Object.values(leaderboardData).map((name, index) => {
            return this.add.text(width / 2, height * (0.3 + index * 0.1), `${index + 1}. ${name}`, {
                fontFamily: 'Inknut Antiqua',
                fontSize: `${Math.floor(height * 0.05)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);
        });

        // Register resize event.
        this.scale.on('resize', this.repositionUI, this);
    }

    repositionUI({ width, height }) {
        setTimeout(() => {
            super.repositionUI({ width, height });
            // Update title.
            if (this.title && this.title.active && this.title.context) {
                this.title.setPosition(width / 2, height * 0.15);
                try {
                    this.title.setFontSize(`${Math.floor(height * 0.08)}px`);
                } catch (error) {
                    console.error("Error updating title font size:", error);
                }
            }
            // Update back button.
            if (this.backButton && this.backButton.active) {
                this.backButton.setPosition(width * 0.1, height * 0.1);
                this.fitToScreen(this.backButton, 0.8);
            }
            // Update leaderboard entries.
            if (this.entries && Array.isArray(this.entries)) {
                this.entries.forEach((entry, index) => {
                    if (entry && entry.active && entry.context) {
                        entry.setPosition(width / 2, height * (0.3 + index * 0.1));
                        try {
                            entry.setFontSize(`${Math.floor(height * 0.05)}px`);
                        } catch (error) {
                            console.error(`Error updating font size for entry ${index}:`, error);
                        }
                    }
                });
            }
        }, 50);
    }
}
