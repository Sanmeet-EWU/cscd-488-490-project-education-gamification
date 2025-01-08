import { Scene } from 'phaser'; 

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

        //  Load the audio
        this.load.setPath('assets/audio');
        this.load.audio('swoosh', 'swoosh.mp3');
    }

    create ()
    {   
        // Title of the settings menu
        this.add.text(500, 100, 'Settings', {
            fontFamily: 'Inknut Antiqua', fontSize: 60, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

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


        this.audioController = this.sys.game.globals.audioController;

        //  Check boxes for music and sound
        this.musicButton = this.add.image(200, 200, 'checkedBox').setInteractive();
        this.musicText = this.add.text(250, 190, 'Music Enabled', { fontSize: 24 });
    
        this.soundButton = this.add.image(200, 300, 'checkedBox').setInteractive();
        this.soundText = this.add.text(250, 290, 'Sound Enabled', { fontSize: 24 });
    
        this.musicButton.on('pointerdown', function () {
            this.audioController.musicOn = !this.audioController.musicOn;
            this.updateAudio();
        }.bind(this));
      
        this.soundButton.on('pointerdown', function () {
            this.audioController.soundOn = !this.audioController.soundOn;
            this.updateAudio();
        }.bind(this));


        //  Add a slider for the music volume
        var musicSlider = this.rexUI.add.numberBar({
            x: 700,
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

            valuechangeCallback: function (value, oldValue, numberBar) {
                numberBar.text = Math.round(Phaser.Math.Linear(0, 100, value));
            },

        }).layout();

        //  Set music volume to the current musicSlider value
        musicSlider.setValue(this.audioController.bgVolume*100, 0, 100);
            //^need to convert volume to a percentage^
        musicSlider.on('valuechange', function () {
            this.updateVolume(musicSlider.getValue());
        }.bind(this));


        //  Add a slider for the SFX volume
        var soundSlider = this.rexUI.add.numberBar({
            x: 700,
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

            valuechangeCallback: function (value, oldValue, numberBar) {
                numberBar.text = Math.round(Phaser.Math.Linear(0, 100, value));
            },
        })
        .layout();    

        //  Set SFX volume to the current soundSlider value
        soundSlider.setValue(this.audioController.soundVolume*100, 0, 100);
        //  Update the global sound volume when the soundSlider is changed
        soundSlider.on('valuechange', function () {
            this.updateSoundVolume(soundSlider.getValue());
        }.bind(this));

        //  Play button for testing SFX volume
        this.playButton = this.add.image(500, 400, 'playButton').setInteractive()
        this.playButtonText = this.add.text(200, 400, 'Test SFX Volume', { fontSize: 18 });
        this.playButton.on('pointerdown', () => {
            if(this.audioController.soundOn === false) {
                return;//i dont like this
            }
            this.sound.add('swoosh').play({loop: false, volume: soundSlider.getValue()});
            this.playButton.setScale(.9);
        });
        this.playButton.on('pointerover', () => {
            this.playButton.setScale(1.1);
        });
        this.playButton.on('pointerout', () => {
            this.playButton.setScale(1);
        });
        this.playButton.on('pointerup', () => {
            this.playButton.setScale(1.1);
        });


        // Ensure that the check boxes are updated when the settings menu is opened
        this.updateAudio();
    }

    update ()
    {
        //  Update logic here

    }

    updateVolume(value) {  
        this.audioController.bgVolume = value;
        this.sys.game.globals.bgMusic.setVolume(this.audioController.bgVolume);
    }

    updateSoundVolume(value) {
        this.audioController.soundVolume = value;
    }

    updateAudio() {
        //  Music
        if (this.audioController.musicOn === false) {
            this.musicButton.setTexture('uncheckedBox');
            this.sys.game.globals.bgMusic.pause();
            this.audioController.bgMusicPlaying = false;
            console.log(this.audioController.bgMusicPlaying);
        } else {
            this.musicButton.setTexture('checkedBox');

            if (this.audioController.bgMusicPlaying === false) {
                this.sys.game.globals.bgMusic.resume();
                this.audioController.bgMusicPlaying = true;
                console.log(this.audioController.bgMusicPlaying);
            }
        }
        //  Sound effects
        if (this.audioController.soundOn === false) {
            this.soundButton.setTexture('uncheckedBox');
        } else {
            this.soundButton.setTexture('checkedBox');
        }
      }
}
