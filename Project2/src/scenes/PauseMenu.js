import { BaseScene } from './BaseScene';
import { saveGameData } from '../../firebase/firebase';

const DEPTH = 20;

export class PauseMenu extends BaseScene {
  constructor() {
    super('PauseMenu');
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.audioController = this.sys.game.globals.audioController;
  }

  create() {
    const { width, height } = this.scale;
    this.dimBackground = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setScrollFactor(0);
    this.container = this.add.container(width / 2, height / 2).setDepth(DEPTH);

    this.optionsBg = this.rexUI.add.roundRectangle(0, 0, 340, 440, 20, 0x4E342E).setStrokeStyle(3, 0x674F49);

    this.closeButton = this.add.image(130, -180, 'closeMenuButton').setInteractive();
    this.closeButton.on('pointerdown', () => this.closeMenu());
    this.closeButton.on('pointerover', () => this.closeButton.setScale(1.1));
    this.closeButton.on('pointerout', () => this.closeButton.setScale(1));

    this.settingsMenuButton = this.add.image(0, -120, 'settingsMenuButton').setInteractive();
    this.settingsMenuButton.on('pointerdown', () => {
      this.container.setVisible(false);
      let subMenu = CreateSettingsPanel(this, width / 2, height / 2);
      subMenu.layout().popUp(500);
    });
    this.settingsMenuButton.on('pointerover', () => this.settingsMenuButton.setScale(1.1));
    this.settingsMenuButton.on('pointerout', () => this.settingsMenuButton.setScale(1));

    this.saveGameButton = this.add.image(0, -40, "saveGameButton").setInteractive()
      .on("pointerdown", async () => {
        if (this.gameScene?.saveProgress) {
          await this.gameScene.saveProgress();
          alert("Game saved!");
        } else {
          console.error("No active game scene or saveProgress() not defined.");
          alert("Could not save game. Try again.");
        }
      })
      .on("pointerover", () => this.saveGameButton.setScale(1.1))
      .on("pointerout", () => this.saveGameButton.setScale(1));

    this.controlsButton = this.add.image(0, 40, 'controlsButton').setInteractive();
    this.controlsButton.on('pointerdown', () => {
      this.container.setVisible(false);
      let subMenu = CreateControlsPanel(this, width / 2, height / 2);
      subMenu.layout().popUp(500);
    });
    this.controlsButton.on('pointerover', () => this.controlsButton.setScale(1.1));
    this.controlsButton.on('pointerout', () => this.controlsButton.setScale(1));

    this.toMainMenuButton = this.add.image(0, 120, 'toMainMenuButton').setInteractive();
    this.toMainMenuButton.on('pointerdown', () => {
      this.gameScene.scene.stop();
      this.scene.start('MainMenu');
    });
    this.toMainMenuButton.on('pointerover', () => this.toMainMenuButton.setScale(1.1));
    this.toMainMenuButton.on('pointerout', () => this.toMainMenuButton.setScale(1));

    this.container.add([
      this.optionsBg,
      this.settingsMenuButton,
      this.saveGameButton,
      this.controlsButton,
      this.toMainMenuButton,
      this.closeButton
    ]);

    this.escDebounce = false;
    this.input.keyboard.on('keydown-ESC', (event) => {
      event.preventDefault();
      if (!this.escDebounce) {
        this.escDebounce = true;
        this.closeMenu();
        this.time.delayedCall(300, () => (this.escDebounce = false));
      }
    });

    this.scale.on('resize', this.repositionUI, this);
  }

  closeMenu() {
    if (this.gameScene?.togglePause) {
      this.gameScene.togglePause();
    }
    this.scene.stop();
  }

  repositionUI({ width, height }) {
    if (this.container?.active) {
      this.container.setPosition(width / 2, height / 2);
    }
    if (this.dimBackground?.active) {
      this.dimBackground.setPosition(width / 2, height / 2);
      this.dimBackground.setSize(width, height);
    }
  }

  updateMusicVolume(value) {
    if (this.audioController) {
      this.audioController.setBGVolume(value);
    }
  }

  updateSoundVolume(value) {
    if (this.audioController) {
      this.audioController.setSoundVolume(value);
    }
  }

  updateMusic(scene, musicButton) {
    // Replaces old references like pauseMainMenuMusic()
    if (!this.audioController?.musicOn) {
      musicButton.setTexture('uncheckedBox');
      this.audioController.pauseMusic();
    } else {
      musicButton.setTexture('checkedBox');
      this.audioController.resumeMusic();
    }
  }

  updateSound(scene, soundButton) {
    if (!this.audioController) return;
    soundButton.setTexture(this.audioController.soundOn ? 'checkedBox' : 'uncheckedBox');
  }
}

// Sub-panels remain the same as your original:
function CreateSettingsPanel(scene, x, y) {
  const panelWidth = 340;
  const panelHeight = 440;
  var background = scene.rexUI.add.roundRectangle(0, 0, panelWidth, panelHeight, 20, 0x260e04);
  var backButton = createBackButton(scene);
  var menuTittle = scene.add.text(0, 0, 'Audio Settings:', { fontSize: 20 }).setOrigin(0.5);
  scene.audioController = scene.sys.game.globals.audioController;

  var musicToggleLabel = scene.add.text(0, 0, 'Music Enabled:', { fontSize: 16 });
  var soundToggleLabel = scene.add.text(0, 0, 'SFX Enabled:', { fontSize: 16 });

  var musicCheckBox = scene.audioController.musicOn ? createCheckBox(scene, true) : createCheckBox(scene, false);
  var soundCheckBox = scene.audioController.soundOn ? createCheckBox(scene, true) : createCheckBox(scene, false);

  var musicSliderLabel = scene.add.text(0, 0, 'Music Volume:', { fontSize: 16 });
  var soundSliderLabel = scene.add.text(0, 0, 'SFX Volume:', { fontSize: 16 });

  var musicSlider = createSlider(scene);
  var soundSlider = createSlider(scene);

  var settingsPanel = scene.rexUI.add.sizer({
    orientation: 'y',
    x, y
  })
    .addBackground(background)
    .add(backButton, 0, 'left', { top: 20, left: 20, bottom: 10 }, false)
    .add(menuTittle, 0, 'center', { left: 100, right: 20, bottom: 20 }, true)
    .add(musicToggleLabel, 0, 'center', { top: 10, left: 80, bottom: 0 }, true)
    .add(musicCheckBox, 0, 'center', { top: -25, left: 250, bottom: 10 }, true)
    .add(soundToggleLabel, 0, 'center', { top: 10, left: 80, bottom: 0 }, true)
    .add(soundCheckBox, 0, 'center', { top: -30, left: 250, bottom: 10 }, true)
    .add(musicSliderLabel, 0, 'center', { top: 20, bottom: 10 }, true)
    .add(musicSlider, 0, 'center', { bottom: 10 }, true)
    .add(soundSliderLabel, 0, 'center', { top: 10, bottom: 10 }, true)
    .add(soundSlider, 0, 'center', { bottom: 20 }, true);

  musicCheckBox.on('pointerdown', () => {
    scene.audioController.setMusicOn(!scene.audioController.musicOn);
    scene.updateMusic(scene, musicCheckBox);
  });

  soundCheckBox.on('pointerdown', () => {
    scene.audioController.setSoundOn(!scene.audioController.soundOn);
    scene.updateSound(scene, soundCheckBox);
  });

  musicSlider.setValue(scene.audioController.bgVolume * 100, 0, 100);
  musicSlider.on('valuechange', () => {
    scene.updateMusicVolume(musicSlider.getValue());
  });

  soundSlider.setValue(scene.audioController.soundVolume * 100, 0, 100);
  soundSlider.on('valuechange', () => {
    scene.updateSoundVolume(soundSlider.getValue());
  });

  backButton.setScale(0.7);
  backButton.on('pointerdown', () => {
    scene.container.setVisible(true);
    settingsPanel.hide();
  });
  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => {
    settingsPanel.hide();
  });

  return settingsPanel;
}

function CreateControlsPanel(scene, x, y) {
  const panelWidth = 300;
  var background = scene.rexUI.add.roundRectangle(1000, 1000, 0, 0, 20, 0x260e04);
  var backButton = createBackButton(scene);
  var menuTittle = scene.add.text(0, 0, 'Controls:', { fontSize: 28 }).setOrigin(0.5);
  var controlsText = scene.add.text(0, 0, 'Move with WASD\n\nE to interact\n\nTab to open inventory\n\nEsc to pause', { fontSize: 20 });
  var controlsPanel = scene.rexUI.add.sizer({
    orientation: 'y',
    x, y,
    width: panelWidth
  })
    .addBackground(background)
    .add(backButton, 0, 'left', { top: 20, left: 20 }, false)
    .add(menuTittle, 0, 'center', { top: 20, bottom: 30 }, false)
    .add(controlsText, 0, 'left', { top: 20, bottom: 30 }, true);

  backButton.setScale(0.7);
  backButton.on('pointerdown', () => {
    scene.container.setVisible(true);
    controlsPanel.hide();
  });
  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => {
    controlsPanel.hide();
  });

  return controlsPanel;
}

function createCheckBox(scene, checked) {
  return scene.add.image(50, 50, checked ? 'checkedBox' : 'uncheckedBox').setInteractive();
}

function createSlider(scene) {
  return scene.rexUI.add.numberBar({
    width: 300,
    background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x260e04),
    icon: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x7b5e57),
    slider: {
      track: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x4E342E),
      indicator: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x7b5e57),
      input: 'click'
    },
    text: scene.add.text(0, 0, '').setFixedSize(35, 0),
    space: { left: 10, right: 10, top: 10, bottom: 10, icon: 10, slider: 10 },
    valuechangeCallback: function (value, oldValue, numberBar) {
      numberBar.text = Math.round(Phaser.Math.Linear(0, 100, value));
    }
  });
}

function createBackButton(scene) {
  let backButton = scene.add.image(0, 0, 'backButton').setInteractive();
  backButton.on('pointerover', () => backButton.setScale(0.8));
  backButton.on('pointerout', () => backButton.setScale(0.7));
  return backButton;
}
