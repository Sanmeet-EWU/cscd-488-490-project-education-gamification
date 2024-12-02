import { Scene } from 'phaser';  

export class Settings extends Scene
{
    constructor ()
    {
        super('Settings');
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('bg', 'background.png');

        this.add.image(512, 384, 'bg');
    }

    create ()
    {
        this.add.text(500, 100, 'Settings', {// Title of the settings menu
            fontFamily: 'Inknut Antiqua', fontSize: 60, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const closeOut = this.add.text(50, 50, 'X', {// temp X button to close the settings menu
            fontFamily: 'Inknut Antiqua', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'right'
        }).setInteractive().setOrigin(0.5);

    //  Add a hover effect to the closeOut button
        closeOut.on('pointerover', () => {
            closeOut.setColor('#ff0');
        })
        closeOut.on('pointerout', () => {
            closeOut.setColor('#fff');
        })
        closeOut.on('pointerdown', () => {//Return to main menu
            this.scene.start('MainMenu');
        });
        

        
    }

    update ()
    {
        //  Update logic here
        
    }
}
