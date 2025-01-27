import { Scene } from 'phaser'; 
const leaderboardData = { First: 'GravyTrain369', Second: 'SaucySally', Third: 'ButterBiscuit', Fourth: 'BiscuitButter', Fifth: 'SallySaucy' };//Great names copiolt 
export class Leaderboard extends Scene
{
    constructor ()
    {
        super('Leaderboard');
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        // this.load.image('leaderboard', 'leaderboard.png');
        // this.add.image(512, 384, 'leaderboard');

        this.load.image('bg', 'background.png');
        this.add.image(512, 384, 'bg');

    }

    create ()
    {

        //  Button for returning to the main menu
        this.backButton = this.add.image(50, 50, 'backButton').setInteractive();
        this.backButton.on('pointerover', () => {
            this.backButton.setScale(1.1);
        });
        this.backButton.on('pointerout', () => {
            this.backButton.setScale(1);
        });
        this.backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        this.add.text(500, 100, 'Leaderboard', {// Title of page
            fontFamily: 'Inknut Antiqua', fontSize: 60, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // This would need to be refactored to be dynamic based on the data
        this.add.text(500, 200, '1. ' + leaderboardData.First, {
            fontFamily: 'Inknut Antiqua', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(500, 300, '2. ' + leaderboardData.Second, {
            fontFamily: 'Inknut Antiqua', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(500, 400, '3. ' + leaderboardData.Third, {
            fontFamily: 'Inknut Antiqua', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);  

    }

    update ()
    {
        //  Update logic here
        
    }
}