import { Scene } from 'phaser';
import { getFirestore, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Color pallet for sliders
const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export class Settings extends Scene {
    constructor() {
        super('Settings');
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('bg', 'background.png');
        this.add.image(512, 384, 'bg');

        //  Load the audio
        this.load.setPath('assets/audio');
        this.load.audio('swoosh', 'swoosh.mp3');
    }

    create() {   
        const db = getFirestore(); // Initialize Firestore
        const auth = getAuth(); // Initialize Firebase Auth

        const dagger = this.add.image(170, 1000, 'dagger').setOrigin(0.5); // Active but off screen
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

        //  Change username logic
        const changeUsername = this.add.text(512, 520, 'Change Username', {
            fontFamily: 'Inknut Antiqua', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'left'
        }).setInteractive().setOrigin(0.5);
        changeUsername.on('pointerover', () => {
            changeUsername.setColor('#ff0');
            dagger.x = changeUsername.x - 190;
            dagger.y = changeUsername.y + 2.5;
            dagger.setVisible(true);
        });
        changeUsername.on('pointerout', () => {
            changeUsername.setColor('#fff');
            //dagger.y = 1000;
            dagger.setVisible(false);
        });
        changeUsername.on('pointerdown', async () => {
            const user = auth.currentUser;
            if (!user) {
                alert("You need to be logged in to change your username.");
                return;
            }
        
            const newUsername = prompt("Enter your new username:");
            if (!newUsername || newUsername.trim() === '') {
                alert("Username cannot be empty.");
                return;
            }
        
            try {
                // Query the Players collection to find the document for the logged-in user
                const playersRef = collection(db, "Players");
                const q = query(playersRef, where("SchoolEmail", "==", user.email));
                const querySnapshot = await getDocs(q);
        
                if (querySnapshot.empty) {
                    alert("No player data found for the current user.");
                    console.error("No document found for email:", user.email);
                    return;
                }
        
                // Assume only one document matches (email should be unique)
                const docRef = querySnapshot.docs[0].ref;
        
                // Update the Username field
                await updateDoc(docRef, { Username: newUsername });
                alert("Username updated successfully!");
                console.log("Updated Username to:", newUsername);
            } catch (error) {
                console.error("Error updating username:", error);
                alert("An error occurred while updating your username.");
            }
        });
        this.audioController = this.sys.game.globals.audioController;

        //  Check boxes for music and sound
        this.musicButton = this.add.image(200, 250, 'checkedBox').setInteractive();
        this.musicText = this.add.text(250, this.musicButton.y-10, 'Music Enabled', { fontSize: 30 });
    
        this.soundButton = this.add.image(200, 350, 'checkedBox').setInteractive();
        this.soundText = this.add.text(250, this.soundButton.y-10, 'Sound Enabled', { fontSize: 30 });
    
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
            y: 250,
            width: 300, // Fixed width
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),
            icon: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),
            slider: {
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

        this.musicSliderLabel = this.add.text(musicSlider.x - 140, musicSlider.y - 45, 'Music Volume:', { fontSize: 20 });

        //  Set music volume to the current musicSlider value
        musicSlider.setValue(this.audioController.bgVolume * 100, 0, 100);
        musicSlider.on('valuechange', function () {
            this.updateVolume(musicSlider.getValue());
        }.bind(this));

        //  Add a slider for the SFX volume
        var soundSlider = this.rexUI.add.numberBar({
            x: 700,
            y: 350,
            width: 300, // Fixed width
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),
            icon: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),
            slider: {
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

        //  Set SFX volume to the current soundSlider value
        soundSlider.setValue(this.audioController.soundVolume * 100, 0, 100);
        soundSlider.on('valuechange', function () {
            this.updateSoundVolume(soundSlider.getValue());
        }.bind(this));

        this.soundSliderLabel = this.add.text(soundSlider.x - 140, soundSlider.y - 45, 'SFX Volume:', { fontSize: 20 });

        //  Play button for testing SFX volume
        this.playButton = this.add.image(soundSlider.x+50, soundSlider.y+60, 'playButton').setInteractive();//690, 360,
        this.playButtonText = this.add.text(this.playButton.x-160, this.playButton.y-10, 'Play SFX', { fontSize: 24 });
        this.playButton.on('pointerdown', () => {
            if (this.audioController.soundOn === false) {
                return;
            }
            this.sound.add('swoosh').play({ loop: false, volume: soundSlider.getValue() });
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

    update() {
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
