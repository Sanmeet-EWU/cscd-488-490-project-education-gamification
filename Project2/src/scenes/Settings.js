import { BaseScene } from './BaseScene';
import { getFirestore, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export class Settings extends BaseScene {
    constructor() {
        super('Settings');
    }

    preload() {
        // Load assets for the scene.
        this.load.setPath('assets');
        this.load.setPath('assets/audio');
        this.load.audio('swoosh', 'swoosh.mp3');
    }

    create() {
        super.create();
        const { width, height } = this.scale;
        this.db = getFirestore();
        this.auth = getAuth();
        this.audioController = this.sys.game.globals.audioController;
        this.bgMusic = this.sys.game.globals.bgMusic;

        // Create UI elements.
        this.createTitle(width, height);
        this.createBackButton(width, height);
        this.createToggles(width, height);
        this.createVolumeSliders(width, height);
        this.createPlaySFXButton(width, height);
        this.createChangeUsername(width, height);
        
        // Register resize event.
        this.scale.on('resize', this.repositionUI, this);
    }

    createTitle(width, height) {
        this.title = this.add.text(width / 2, height * 0.1, 'Settings', {
            fontFamily: 'Inknut Antiqua',
            fontSize: `${Math.floor(height * 0.08)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
    }

    createBackButton(width, height) {
        // Create the back button as an image.
        this.backButton = this.add.image(width * 0.1, height * 0.1, 'backButton')
            .setInteractive();
        // Use a larger scale factor (0.8) so it appears bigger.
        this.fitToScreen(this.backButton, 0.8);
        this.backButton.on('pointerdown', () => {
            this.switchScene('MainMenu');
        });
    }

    createToggles(width, height) {
        // Music toggle.
        this.musicButton = this.add.image(width * 0.4, height * 0.25,
            this.audioController.musicOn ? 'checkedBox' : 'uncheckedBox')
            .setInteractive();
        this.musicText = this.add.text(width * 0.45, height * 0.25, 'Music Enabled', {
            fontSize: `${Math.floor(height * 0.05)}px`
        }).setOrigin(0, 0.5);
        
        // Sound toggle.
        this.soundButton = this.add.image(width * 0.4, height * 0.35,
            this.audioController.soundOn ? 'checkedBox' : 'uncheckedBox')
            .setInteractive();
        this.soundText = this.add.text(width * 0.45, height * 0.35, 'Sound Enabled', {
            fontSize: `${Math.floor(height * 0.05)}px`
        }).setOrigin(0, 0.5);

        // Toggle callbacks.
        this.musicButton.on('pointerdown', () => {
            this.audioController.musicOn = !this.audioController.musicOn;
            this.musicButton.setTexture(this.audioController.musicOn ? 'checkedBox' : 'uncheckedBox');
            this.updateAudio();
        });
        this.soundButton.on('pointerdown', () => {
            this.audioController.soundOn = !this.audioController.soundOn;
            this.soundButton.setTexture(this.audioController.soundOn ? 'checkedBox' : 'uncheckedBox');
            this.updateAudio();
        });

        this.updateAudio();
    }

    createVolumeSliders(width, height) {
        const sliderWidth = width * 0.4;
        // Music volume slider.
        this.musicSlider = this.rexUI.add.slider({
            x: width / 2,
            y: height * 0.50,
            width: sliderWidth,
            height: 20,
            orientation: 'horizontal',
            track: this.rexUI.add.roundRectangle(0, 0, sliderWidth, 10, 5, 0x4e342e),
            indicator: this.rexUI.add.roundRectangle(0, 0, 10, 20, 5, 0x7b5e57),
            thumb: this.rexUI.add.roundRectangle(0, 0, 20, 20, 10, 0xffffff),
            value: this.audioController.bgVolume,
            valuechangeCallback: (value) => {
                this.updateVolume(value);
            }
        }).layout();

        // Enable clicking on the slider track to set the value.
        this.musicSlider.getElement('track')
            .setInteractive()
            .on('pointerdown', function (pointer) {
                let track = this.getElement('track');
                let topLeft = track.getTopLeft();
                let localX = pointer.x - topLeft.x;
                let newValue = Phaser.Math.Clamp(localX / track.width, 0, 1);
                this.setValue(newValue);
            }, this.musicSlider);

        // SFX volume slider.
        this.soundSlider = this.rexUI.add.slider({
            x: width / 2,
            y: height * 0.60,
            width: sliderWidth,
            height: 20,
            orientation: 'horizontal',
            track: this.rexUI.add.roundRectangle(0, 0, sliderWidth, 10, 5, 0x4e342e),
            indicator: this.rexUI.add.roundRectangle(0, 0, 10, 20, 5, 0x7b5e57),
            thumb: this.rexUI.add.roundRectangle(0, 0, 20, 20, 10, 0xffffff),
            value: this.audioController.soundVolume,
            valuechangeCallback: (value) => {
                this.updateSoundVolume(value);
            }
        }).layout();
        
        this.soundSlider.getElement('track')
            .setInteractive()
            .on('pointerdown', function (pointer) {
                let track = this.getElement('track');
                let topLeft = track.getTopLeft();
                let localX = pointer.x - topLeft.x;
                let newValue = Phaser.Math.Clamp(localX / track.width, 0, 1);
                this.setValue(newValue);
            }, this.soundSlider);
    }

    createPlaySFXButton(width, height) {
        this.playButton = this.add.image(this.soundSlider.x + 50, this.soundSlider.y + 60, 'playButton')
            .setInteractive();
        this.playButtonText = this.add.text(this.playButton.x - 160, this.playButton.y - 10, 'Play SFX', {
            fontSize: 24
        });
        this.playButton.on('pointerdown', () => {
            if (!this.audioController.soundOn) return;
            this.sound.add('swoosh').play({ loop: false, volume: this.soundSlider.getValue() });
            this.playButton.setScale(0.9);
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
    }

    createChangeUsername(width, height) {
        // Use the BaseScene's createButton helper for consistent styling.
        this.changeUsername = this.createButton("Change Username", 0.80, async () => {
            const user = this.auth.currentUser;
            if (!user) {
                alert("You need to be logged in to change your username.");
                return;
            }
            const newUsername = prompt("Enter your new username:");
            if (!newUsername || newUsername.trim() === '') return;
            try {
                const playersRef = collection(this.db, "Players");
                const q = query(playersRef, where("SchoolEmail", "==", user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    await updateDoc(querySnapshot.docs[0].ref, { Username: newUsername });
                    alert("Username updated successfully!");
                }
            } catch (error) {
                alert("Error updating username.");
            }
        });
    }

    updateVolume(value) {
        this.audioController.bgVolume = value;
        if (this.bgMusic) {
            this.bgMusic.setVolume(this.audioController.bgVolume);
        }
    }

    updateSoundVolume(value) {
        this.audioController.soundVolume = value;
    }

    updateAudio() {
        this.musicButton.setTexture(this.audioController.musicOn ? 'checkedBox' : 'uncheckedBox');
        this.soundButton.setTexture(this.audioController.soundOn ? 'checkedBox' : 'uncheckedBox');
        if (this.bgMusic) {
            if (this.audioController.musicOn) {
                this.bgMusic.resume();
            } else {
                this.bgMusic.pause();
            }
        }
    }

    /**
     * Repositions UI elements on window resize.
     */
    repositionUI({ width, height }) {
        setTimeout(() => {
            super.repositionUI({ width, height });
            // Update title.
            if (this.title && this.title.active && this.title.context) {
                this.title.setPosition(width / 2, height * 0.1);
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
            // Update toggles.
            if (this.musicButton && this.musicButton.active) {
                this.musicButton.setPosition(width * 0.4, height * 0.25);
            }
            if (this.musicText && this.musicText.active && this.musicText.context) {
                this.musicText.setPosition(width * 0.45, height * 0.25);
                try {
                    this.musicText.setFontSize(`${Math.floor(height * 0.05)}px`);
                } catch (error) {
                    console.error("Error updating music text font size:", error);
                }
            }
            if (this.soundButton && this.soundButton.active) {
                this.soundButton.setPosition(width * 0.4, height * 0.35);
            }
            if (this.soundText && this.soundText.active && this.soundText.context) {
                this.soundText.setPosition(width * 0.45, height * 0.35);
                try {
                    this.soundText.setFontSize(`${Math.floor(height * 0.05)}px`);
                } catch (error) {
                    console.error("Error updating sound text font size:", error);
                }
            }
            // Update volume slider labels.
            if (this.musicSliderLabel && this.musicSliderLabel.active && this.musicSliderLabel.context) {
                this.musicSliderLabel.setPosition(width / 2, height * 0.45);
                try {
                    this.musicSliderLabel.setFontSize(`${Math.floor(height * 0.04)}px`);
                } catch (error) {
                    console.error("Error updating music slider label font size:", error);
                }
            }
            // Update Music Slider.
            if (this.musicSlider && this.musicSlider.active) {
                this.musicSlider.setPosition(width / 2, height * 0.50);
                let newSliderWidth = width * 0.4;
                // Instead of manually setting the track size, call resize on the slider.
                if (this.musicSlider.resize) {
                    this.musicSlider.resize(newSliderWidth, 20);
                } else {
                    let track = this.musicSlider.getElement('track');
                    if (track) {
                        track.setSize(newSliderWidth, 10);
                    }
                }
                this.musicSlider.setValue(this.audioController.bgVolume);
                this.musicSlider.layout();
            }
            if (this.soundSliderLabel && this.soundSliderLabel.active && this.soundSliderLabel.context) {
                this.soundSliderLabel.setPosition(width / 2, height * 0.55);
                try {
                    this.soundSliderLabel.setFontSize(`${Math.floor(height * 0.04)}px`);
                } catch (error) {
                    console.error("Error updating sound slider label font size:", error);
                }
            }
            // Update Sound Slider.
            if (this.soundSlider && this.soundSlider.active) {
                this.soundSlider.setPosition(width / 2, height * 0.60);
                let newSliderWidth = width * 0.4;
                if (this.soundSlider.resize) {
                    this.soundSlider.resize(newSliderWidth, 20);
                } else {
                    let track = this.soundSlider.getElement('track');
                    if (track) {
                        track.setSize(newSliderWidth, 10);
                    }
                }
                this.soundSlider.setValue(this.audioController.soundVolume);
                this.soundSlider.layout();
            }
            // Update play SFX button.
            if (this.playButton && this.playButton.active) {
                this.playButton.setPosition(this.soundSlider.x + 50, this.soundSlider.y + 60);
            }
            if (this.playButtonText && this.playButtonText.active && this.playButtonText.context) {
                this.playButtonText.setPosition(this.playButton.x - 160, this.playButton.y - 10);
            }
            // Update change username button.
            if (this.changeUsername && this.changeUsername.active && this.changeUsername.context) {
                this.changeUsername.setPosition(width / 2, height * 0.80);
                try {
                    this.changeUsername.setFontSize(`${Math.floor(height * 0.05)}px`);
                } catch (error) {
                    console.error("Error updating change username button font size:", error);
                }
            }
        }, 50);
    }
}
