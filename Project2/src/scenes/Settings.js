import { BaseScene } from './BaseScene';
import { getFirestore, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export class Settings extends BaseScene {
  constructor() {
    super('Settings');
  }

  preload() {
    this.load.setPath('assets/audio');
    this.load.audio('swoosh', 'swoosh.mp3');
  }

  create() {
    super.create();
    const { width, height } = this.scale;
    this.db = getFirestore();
    this.auth = getAuth();
    this.audioController = this.sys.game.globals.audioController;

    this.createTitle(width, height);
    this.createBackButton(width, height);
    this.createToggles(width, height);
    this.createVolumeSliders(width, height);
    this.createPlaySFXButton(width, height);
    this.createChangeUsername(width, height);

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
    this.backButton = this.add.image(width * 0.1, height * 0.1, 'backButton').setInteractive();
    this.fitToScreen(this.backButton, 0.8);
    this.backButton.on('pointerdown', () => this.switchScene('MainMenu'));
  }

  createToggles(width, height) {
    this.musicButton = this.add.image(width * 0.4, height * 0.25,
      this.audioController.musicOn ? 'checkedBox' : 'uncheckedBox').setInteractive();
    this.musicText = this.add.text(width * 0.45, height * 0.25, 'Music Enabled', {
      fontSize: `${Math.floor(height * 0.05)}px`
    }).setOrigin(0, 0.5);

    this.soundButton = this.add.image(width * 0.4, height * 0.35,
      this.audioController.soundOn ? 'checkedBox' : 'uncheckedBox').setInteractive();
    this.soundText = this.add.text(width * 0.45, height * 0.35, 'Sound Enabled', {
      fontSize: `${Math.floor(height * 0.05)}px`
    }).setOrigin(0, 0.5);

    this.musicButton.on('pointerdown', () => {
      this.audioController.setMusicOn(!this.audioController.musicOn);
      this.musicButton.setTexture(this.audioController.musicOn ? 'checkedBox' : 'uncheckedBox');
      this.updateAudio();
    });
    this.soundButton.on('pointerdown', () => {
      this.audioController.setSoundOn(!this.audioController.soundOn);
      this.soundButton.setTexture(this.audioController.soundOn ? 'checkedBox' : 'uncheckedBox');
      this.updateAudio();
    });

    this.updateAudio();
  }

  createVolumeSliders(width, height) {
    const sliderWidth = width * 0.4;

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
      valuechangeCallback: (value) => this.updateVolume(value)
    }).layout();

    this.musicSlider.getElement('track').setInteractive()
      .on('pointerdown', (pointer) => {
        let track = this.musicSlider.getElement('track');
        let topLeft = track.getTopLeft();
        let localX = pointer.x - topLeft.x;
        let newValue = Phaser.Math.Clamp(localX / track.width, 0, 1);
        this.musicSlider.setValue(newValue);
      });

    this.musicSliderLabel = this.add.text(this.musicSlider.x - 300, this.musicSlider.y - 45, 'Music Volume:', { align: 'center', fontSize: 24 });

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
      valuechangeCallback: (value) => this.updateSoundVolume(value)
    }).layout();

    this.soundSlider.getElement('track').setInteractive()
      .on('pointerdown', (pointer) => {
        let track = this.soundSlider.getElement('track');
        let topLeft = track.getTopLeft();
        let localX = pointer.x - topLeft.x;
        let newValue = Phaser.Math.Clamp(localX / track.width, 0, 1);
        this.soundSlider.setValue(newValue);
      });

    this.soundSliderLabel = this.add.text(this.soundSlider.x - 300, this.soundSlider.y - 45, 'Sound Volume:', { align: 'center', fontSize: 24 });
  }

  createPlaySFXButton(width, height) {
    this.playButton = this.add.image(this.soundSlider.x + 50, this.soundSlider.y + 60, 'playButton').setInteractive();
    this.playButtonText = this.add.text(this.playButton.x - 160, this.playButton.y - 10, 'Play SFX', { fontSize: 24 });

    this.playButton.on('pointerdown', () => {
      if (this.audioController.soundOn) {
        this.sound.add('swoosh').play({ loop: false, volume: this.soundSlider.getValue() });
        this.playButton.setScale(0.9);
      }
    });
    this.playButton.on('pointerover', () => this.playButton.setScale(1.1));
    this.playButton.on('pointerout', () => this.playButton.setScale(1));
    this.playButton.on('pointerup', () => this.playButton.setScale(1.1));
  }

  createChangeUsername(width, height) {
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
      } catch {
        alert("Error updating username.");
      }
    });
  }

  updateVolume(value) {
    this.audioController.setBGVolume(value);
  }

  updateSoundVolume(value) {
    this.audioController.setSoundVolume(value);
  }

  updateAudio() {
    this.musicButton.setTexture(this.audioController.musicOn ? 'checkedBox' : 'uncheckedBox');
    this.soundButton.setTexture(this.audioController.soundOn ? 'checkedBox' : 'uncheckedBox');
  }

  repositionUI({ width, height }) {
    setTimeout(() => {
      if (this.title?.active) {
        this.title.setPosition(width / 2, height * 0.1);
        this.title.setFontSize(`${Math.floor(height * 0.08)}px`);
      }
      if (this.backButton?.active) {
        this.backButton.setPosition(width * 0.1, height * 0.1);
        this.fitToScreen(this.backButton, 0.8);
      }
      if (this.musicButton?.active) this.musicButton.setPosition(width * 0.4, height * 0.25);
      if (this.musicText?.active) {
        this.musicText.setPosition(width * 0.45, height * 0.25);
        this.musicText.setFontSize(`${Math.floor(height * 0.05)}px`);
      }
      if (this.soundButton?.active) this.soundButton.setPosition(width * 0.4, height * 0.35);
      if (this.soundText?.active) {
        this.soundText.setPosition(width * 0.45, height * 0.35);
        this.soundText.setFontSize(`${Math.floor(height * 0.05)}px`);
      }
      if (this.musicSliderLabel?.active) this.musicSliderLabel.setPosition(width / 2, height * 0.45);
      if (this.musicSlider?.active) {
        this.musicSlider.setPosition(width / 2, height * 0.50);
        this.musicSlider.resize(width * 0.4, 20);
        this.musicSlider.setValue(this.audioController.bgVolume);
        this.musicSlider.layout();
      }
      if (this.soundSliderLabel?.active) this.soundSliderLabel.setPosition(width / 2, height * 0.55);
      if (this.soundSlider?.active) {
        this.soundSlider.setPosition(width / 2, height * 0.60);
        this.soundSlider.resize(width * 0.4, 20);
        this.soundSlider.setValue(this.audioController.soundVolume);
        this.soundSlider.layout();
      }
      if (this.playButton?.active) {
        this.playButton.setPosition(this.soundSlider.x + 50, this.soundSlider.y + 60);
      }
      if (this.playButtonText?.active) {
        this.playButtonText.setPosition(this.playButton.x - 160, this.playButton.y - 10);
      }
      if (this.changeUsername?.active) {
        this.changeUsername.setPosition(width / 2, height * 0.80);
        this.changeUsername.setFontSize(`${Math.floor(height * 0.05)}px`);
      }
    }, 50);
  }
}
