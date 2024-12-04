import { Scene } from 'phaser'; 
import Label from 'phaser3-rex-plugins/templates/ui/label/Label';

// Color pallet for sliders
const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

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

        this.load.audio('sfxTest', 'sfxTest_delete.ogg');//This is temporary, replace with actual sfx
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


    //  Music stuff
        this.add.text(500, 250, 'Music Volume', {// Label for the music volume slider
            fontFamily: 'Inknut Antiqua', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        //  Add a slider for the music volume
        var musicSlider = this.rexUI.add.numberBar({
            x: 500,
            y: 200,
            width: 300, // Fixed width

            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),

            icon: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),

            slider: {
                // width: 120, // Fixed width
                track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY),
                indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),
                input: 'click',
            },

            text: this.add.text(0, 0, '').setFixedSize(35, 0),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,

                icon: 10,
                slider: 10,
            },

            value : 0.75, // default value

            valuechangeCallback: function (value, oldValue, numberBar) {
                numberBar.text = Math.round(Phaser.Math.Linear(0, 100, value));
                
                value = numberBar.text;
            },
        }).layout();

        musicSlider.setValue(75, 0, 100);
        

    //  SFX stuff
        var sfxLable = this.add.text(500, 350, 'SFX Volume', {// Label for the SFX volume slider
            fontFamily: 'Inknut Antiqua', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setInteractive().setOrigin(0.5);


        //  Add a slider for the SFX volume
        var sfxSlider = this.rexUI.add.numberBar({
            x: 500,
            y: 300,
            width: 300, // Fixed width

            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),

            icon: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),

            slider: {
                // width: 120, // Fixed width
                track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY),
                indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),
                input: 'click',
            },

            text: this.add.text(0, 0, '').setFixedSize(35, 0),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,

                icon: 10,
                slider: 10,
            },

            value : 0.75, // default value

            valuechangeCallback: function (value, oldValue, numberBar) {
                numberBar.text = Math.round(Phaser.Math.Linear(0, 100, value));
                
                value = numberBar.text;
                
            },
        })
        .layout();

        //sfxSlider.setValue(75, 0, 100);
        


        // Play SFX button
        sfxLable.on('pointerover', () => {
            sfxLable.setColor('#ff0');
        })
        sfxLable.on('pointerout', () => {
            sfxLable.setColor('#fff');
        })
        sfxLable.on('pointerdown', () => {//Return to main menu
            this.sound.add('sfxTest').play({volume: .01 * sfxSlider.value});
        });


        
    }

    update ()
    {
        //  Update logic here

    }
}
