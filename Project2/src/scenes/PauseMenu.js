import { BaseScene } from './BaseScene';
import { saveGameData } from '../../firebase/firebase';

const DEPTH = 20;

export class PauseMenu extends BaseScene {
  constructor() {
    super('PauseMenu');
  }

  /**
   * Expects data: { gameScene: <reference> }
   */
  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    console.log("PauseMenu created");
    const { width, height } = this.scale;

    // Create a full-screen dim background.
    this.dimBackground = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
      .setScrollFactor(0);

    // Create a container for the pause menu UI elements.
    this.container = this.add.container(width / 2, height / 2);
    this.container.setDepth(DEPTH);

    // Create a menu background using rexUI's roundRectangle.
    // (Assuming a container size of 340×440.)
    this.optionsBg = this.rexUI.add.roundRectangle(0, 0, 340, 440, 20, 0x4E342E);
    this.optionsBg.setStrokeStyle(3, 0x674F49);

    // --- Close Button (Resume) ---
    // Place the close button in the top-right area of the container. 
    // We move it left and down so it appears at (130, -180).)
    this.closeButton = this.add.image(130, -180, 'closeMenuButton')
      .setInteractive();
    this.closeButton.on('pointerdown', () => {
      this.closeMenu();
    });
    this.closeButton.on('pointerover', () => {
      this.closeButton.setScale(1.1);
    });
    this.closeButton.on('pointerout', () => {
      this.closeButton.setScale(1);
    });

    // --- Main Buttons (Vertical Column) ---
    this.settingsMenuButton = this.add.image(0, -120, 'settingsMenuButton')
      .setInteractive();
    this.settingsMenuButton.on('pointerdown', () => {
      this.container.setVisible(false);
      let subMenu = CreateSettingsPanel(this, width / 2, height / 2);
      subMenu.layout().popUp(500);
    });
    this.settingsMenuButton.on('pointerover', () => {
      this.settingsMenuButton.setScale(1.1);
    });
    this.settingsMenuButton.on('pointerout', () => {
      this.settingsMenuButton.setScale(1);
    });

    this.saveGameButton = this.add.image(0, -40, "saveGameButton")
    .setInteractive()
    .on("pointerdown", async () => {
        if (this.gameScene && this.gameScene.saveProgress) {
            console.log("📝 Saving game progress...");
            await this.gameScene.saveProgress();  //Call saveProgress() from the game scene
            alert("Game saved!");
        } else {
            console.error("Error: No active game scene found or saveProgress() not defined.");
            alert("Could not save game. Try again.");
        }
    })
    .on("pointerover", () => this.saveGameButton.setScale(1.1))
    .on("pointerout", () => this.saveGameButton.setScale(1));

    this.controlsButton = this.add.image(0, 40, 'controlsButton')
      .setInteractive();
    this.controlsButton.on('pointerdown', () => {
      console.log("Controls button pressed");
      this.container.setVisible(false);
      let subMenu = CreateControlsPanel(this, width / 2, height / 2);
      subMenu.layout().popUp(500);
    });
    this.controlsButton.on('pointerover', () => {
      this.controlsButton.setScale(1.1);
    });
    this.controlsButton.on('pointerout', () => {
      this.controlsButton.setScale(1);
    });

    this.toMainMenuButton = this.add.image(0, 120, 'toMainMenuButton')
      .setInteractive();
    this.toMainMenuButton.on('pointerdown', () => {
      this.gameScene.scene.stop();
      this.scene.start('MainMenu');
    });
    this.toMainMenuButton.on('pointerover', () => {
      this.toMainMenuButton.setScale(1.1);
    });
    this.toMainMenuButton.on('pointerout', () => {
      this.toMainMenuButton.setScale(1);
    });

    // Add all UI elements to the container.
    this.container.add([
      this.optionsBg,
      this.settingsMenuButton,
      this.saveGameButton,
      this.controlsButton,
      this.toMainMenuButton,
      this.closeButton
    ]);

    // --- ESC Key Handling with Debounce ---
    // This listener prevents rapid re-triggering of ESC.
    this.escDebounce = false;
    this.input.keyboard.on('keydown-ESC', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (!this.escDebounce) {
        this.escDebounce = true;
        this.closeMenu();
        this.time.delayedCall(300, () => {
          this.escDebounce = false;
        });
      }
    });

    // --- Keep the menu centered on resize ---
    this.scale.on('resize', this.repositionUI, this);
  }

  /**
   * Closes the pause menu by calling the game scene's togglePause() (which resumes the game)
   * and stops this PauseMenu scene.
   */
  closeMenu() {
    if (this.gameScene && typeof this.gameScene.togglePause === 'function') {
      this.gameScene.togglePause();
    }
    this.scene.stop();
  }

  /**
   * Repositions the container and the dim background so that the menu stays centered.
   * Called on a resize event.
   */
  repositionUI({ width, height }) {
    if (this.container) {
      this.container.setPosition(width / 2, height / 2);
    }
    if (this.dimBackground) {
      this.dimBackground.setPosition(width / 2, height / 2);
      this.dimBackground.setSize(width, height);
    }
  }

  // Volume updates ========================================================
  updateMusicVolume(value) {
    console.log("updateVolume: " + value);
    this.audioController.bgVolume = value;
    this.sys.game.globals.bgMusic.setVolume(this.audioController.bgVolume);
  }

  updateSoundVolume(value) {
      this.audioController.soundVolume = value;
  }

  updateMusic(scene,musicButton) {
      if (scene.audioController.musicOn === false) {
          musicButton.setTexture('uncheckedBox');
          scene.sys.game.globals.bgMusic.pause();
          scene.audioController.bgMusicPlaying = false;
          console.log(scene.audioController.bgMusicPlaying);
      } else {
          musicButton.setTexture('checkedBox');

          if (scene.audioController.bgMusicPlaying === false) {
              scene.sys.game.globals.bgMusic.resume();
              scene.audioController.bgMusicPlaying = true;
              console.log(scene.audioController.bgMusicPlaying);
          }
          
      }

  }

  updateSound(scene,soundButton) {
      if (scene.audioController.soundOn === false) {
          soundButton.setTexture('uncheckedBox');
      } else {
          soundButton.setTexture('checkedBox');
      }
  }
}

/* ----------------------------------------------------------------------------
   Helper Functions
---------------------------------------------------------------------------- */



var CreateSettingsPanel = function (scene, x, y) {
  const { width, height } = scene.scale;
  const panelWidth = 340;
  const panelHeight = 440;
  var background = scene.rexUI.add.roundRectangle(0, 0, panelWidth, panelHeight, 20, 0x260e04);
  var backButton = createBackButton(scene);
  var menuTittle = scene.add.text(0, 0, 'Audio Settings:', { fontSize: 20 });
  menuTittle.setOrigin(0.5);
  scene.audioController = scene.sys.game.globals.audioController;

  var musicToggleLabel = scene.add.text(0, 0, 'Music Enabled:', { fontSize: 16 });
  var soundToggleLabel = scene.add.text(0, 0, 'SFX Enabled:', { fontSize: 16 });

  var musicCheckBox = scene.audioController.musicOn
    ? createCheckBox(scene, true)
    : createCheckBox(scene, false);
  var soundCheckBox = scene.audioController.soundOn
    ? createCheckBox(scene, true)
    : createCheckBox(scene, false);

  var musicSliderLabel = scene.add.text(0, 0, 'Music Volume:', { fontSize: 16 });
  var soundSliderLabel = scene.add.text(0, 0, 'SFX Volume:', { fontSize: 16 });

  var musicSlider = createSlider(scene);
  var soundSlider = createSlider(scene);

  var settingsPanel = scene.rexUI.add.sizer({
    orientation: 'y',
    x: x,
    y: y,
  })
    .addBackground(background)
    .add(backButton, 0, 'left', { top: 20, left: 20, bottom: 10 }, false)
    .add(menuTittle, 0, 'center', { top: 0, left: 100, right: 20, bottom: 20 }, true)
    .add(musicToggleLabel, 0, 'center', { top: 10, left: 80, right: 20, bottom: 0 }, true)
    .add(musicCheckBox, 0, 'center', { top: -25, left: 250, right: 100, bottom: 10 }, true)
    .add(soundToggleLabel, 0, 'center', { top: 10, left: 80, right: 20, bottom: 0 }, true)
    .add(soundCheckBox, 0, 'center', { top: -30, left: 250, right: 100, bottom: 10 }, true)
    .add(musicSliderLabel, 0, 'center', { top: 20, left: 20, right: 20, bottom: 10 }, true)
    .add(musicSlider, 0, 'center', { top: 0, left: 20, right: 20, bottom: 10 }, true)
    .add(soundSliderLabel, 0, 'center', { top: 10, left: 20, right: 20, bottom: 10 }, true)
    .add(soundSlider, 0, 'center', { top: 0, left: 20, right: 20, bottom: 20 }, true);

  musicCheckBox.on('pointerdown', function () {
    scene.audioController.musicOn = !scene.audioController.musicOn;
    scene.updateMusic(scene, musicCheckBox);
  }.bind(scene));

  soundCheckBox.on('pointerdown', function () {
    scene.audioController.soundOn = !scene.audioController.soundOn;
    scene.updateSound(scene, soundCheckBox);
  }.bind(scene));

  musicSlider.setValue(scene.audioController.bgVolume * 100, 0, 100);
  musicSlider.on('valuechange', function () {
    scene.updateMusicVolume(musicSlider.getValue());
  }.bind(scene));

  soundSlider.setValue(scene.audioController.soundVolume * 100, 0, 100);
  soundSlider.on('valuechange', function () {
    scene.updateSoundVolume(soundSlider.getValue());
  }.bind(scene));

  backButton.setScale(0.7);
  backButton.on('pointerdown', () => {
    // Use scene.container instead of scene.optionsModal.
    scene.container.setVisible(true);
    settingsPanel.hide();
  });
  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', function () {
    settingsPanel.hide();
  });

  return settingsPanel;
};

var CreateControlsPanel = function (scene, x, y) {
  const { width, height } = scene.scale;
  const panelWidth = 300;
  var background = scene.rexUI.add.roundRectangle(1000, 1000, 0, 0, 20, 0x260e04);
  var backButton = createBackButton(scene);
  var menuTittle = scene.add.text(0, 0, 'Controls:', { fontSize: 28 });
  menuTittle.setOrigin(0.5);
  var controlsText = scene.add.text(0, 0, 'Move with WASD\n \nE to interact\n \nTab to open inventory\n\nEsc to pause', { fontSize: 20 });
  var controlsPanel = scene.rexUI.add.sizer({
    orientation: 'y',
    x: x,
    y: y,
    width: panelWidth,
  })
    .addBackground(background)
    .add(backButton, 0, 'left', { top: 20, left: 20 }, false)
    .add(menuTittle, 0, 'center', { top: 20, left: panelWidth / 2, right: panelWidth / 2, bottom: 30 }, false)
    .add(controlsText, 0, 'left', { top: 20, left: panelWidth / 3, bottom: 30 }, true);

  backButton.setScale(0.7);
  backButton.on('pointerdown', () => {
    // Use scene.container instead of scene.optionsModal.
    scene.container.setVisible(true);
    controlsPanel.hide();
  });
  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', function () {
    controlsPanel.hide();
  });

  return controlsPanel;
};

var createCheckBox = function (scene, checked) {
  return scene.add.image(50, 50, checked ? 'checkedBox' : 'uncheckedBox').setInteractive();
};

var createSlider = function (scene) {
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
};

var createBackButton = function (scene) {
  let backButton = scene.add.image(0, 0, 'backButton').setInteractive();
  backButton.on('pointerover', () => {
    backButton.setScale(0.8);
  });
  backButton.on('pointerout', () => {
    backButton.setScale(0.7);
  });
  return backButton;
};
