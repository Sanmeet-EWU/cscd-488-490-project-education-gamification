import { Scene } from 'phaser';

// Depth value for menu overlays 
const DEPTH = 20;

// Color pallet for sliders
const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

// This is the base class for all game scenes
export class GameScene extends Phaser.Scene
{
    constructor (key)
    {
        super(key);
    }

    init ()
    {
        
    }

    create ()
    {
        
    }

    //TODO: still needs to lock out player movment when the options menu is open

    /**
     * Creates the pause menu overlay for game scenes.
     *  - Literally just pass the _this_ keyword. _-Trevor_
     * @param {GameScene} scene - The game scene that is playing.
     */
    initializePauseMenu(scene){
        this.scene.launch('PauseMenu', scene);
    }

//     initializeOptions(){
//         this.makeOptionsButton();
//         this.optionsModal = this.makeOptionsModal();
//         this.optionsModal.depth = DEPTH;//This may need tweaking later, but depth controls the order of rendering
//         this.optionsModal.setVisible(false);
//     }

//     // Makes a button for opening the options menu modal in the corner of the screen
//     makeOptionsButton(){
//         this.optionsButton = this.add.image(1000, 24, 'options').setInteractive();
//         //this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

//         this.optionsButton.on('pointerdown', () => {
//             this.optionsModal.setVisible(true);
//             this.optionsButton.setVisible(false);
//             //this.scene.pause();//This will need to grab the current scene running in parallel and pause it
//         });
//         this.optionsButton.on('pointerover', () => {
//             this.optionsButton.setScale(1.1);
//         });
//         this.optionsButton.on('pointerout', () => {
//             this.optionsButton.setScale(1);
//         });
//     }

//     // Makes the options menu overlay
//     makeOptionsModal(){
//         var container = this.add.container(512, 400);
//         this.optionsBg = this.rexUI.add.roundRectangle(0, 0, 340, 440, 20, 0x4E342E);
//         this.optionsBg.setStrokeStyle(3, 0x674F49);

//         this.optionsTitle = this.add.text(-50, -160, 'Options:', { fontFamily: 'Inknut Antiqua', fontSize: '24px', fill: '#fff' });

//         this.closeButton = this.add.image(120, -180, 'closeMenuButton').setInteractive();
//         this.closeButton.on('pointerdown', () => {
//             this.optionsModal.setVisible(false);
//             this.optionsButton.setVisible(true);
//         });
//         this.closeButton.on('pointerover', () => {
//             this.closeButton.setScale(1.1);
//         });
//         this.closeButton.on('pointerout', () => {
//             this.closeButton.setScale(1);
//         });

//         this.settingsMenuButton = this.add.image(0, -80, 'settingsMenuButton').setInteractive();
//         this.settingsMenuButton.on('pointerdown', () => {
//             //Swap which one is visable
//             this.optionsModal.setVisible(false);
//             var mainPanel = CreateMainPanel(this, 512, 400);
//             mainPanel.layout().popUp(500);
//         });
//         this.settingsMenuButton.on('pointerover', () => {
//             this.settingsMenuButton.setScale(1.1);
//         });
//         this.settingsMenuButton.on('pointerout', () => {
//             this.settingsMenuButton.setScale(1);
//         });

//         this.saveGameButton = this.add.image(0, 0, 'saveGameButton').setInteractive();//------------------->  still need to figure out how to save the game
//         this.saveGameButton.on('pointerdown', () => {
//             //Save the game
//         });
//         this.saveGameButton.on('pointerover', () => {
//             this.saveGameButton.setScale(1.1);
//         });
//         this.saveGameButton.on('pointerout', () => {
//             this.saveGameButton.setScale(1);
//         });

//         this.toMainMenuButton = this.add.image(0, 150, 'toMainMenuButton').setInteractive();
//         this.toMainMenuButton.on('pointerdown', () => {
//             this.scene.start('MainMenu');
//         });
//         this.toMainMenuButton.on('pointerover', () => {
//             this.toMainMenuButton.setScale(1.1);
//         });
//         this.toMainMenuButton.on('pointerout', () => {
//             this.toMainMenuButton.setScale(1);
//         });

//         //Put together the menu container
//         container.add(this.optionsBg);
//         container.add(this.optionsTitle);
//         container.add(this.closeButton);
//         container.add(this.settingsMenuButton);
//         container.add(this.saveGameButton);
//         container.add(this.toMainMenuButton);

//         return container;
//     }



//     update ()
//     {
        
//     }

//     // Volume updates ========================================================
//     updateMusicVolume(value) {
//         console.log("updateVolume: " + value);
//         this.audioController.bgVolume = value;
//         this.sys.game.globals.bgMusic.setVolume(this.audioController.bgVolume);
//     }

//     updateSoundVolume(value) {
//         this.audioController.soundVolume = value;
//     }

//     updateMusic(scene,musicButton) {
//         if (scene.audioController.musicOn === false) {
//             musicButton.setTexture('uncheckedBox');
//             scene.sys.game.globals.bgMusic.pause();
//             scene.audioController.bgMusicPlaying = false;
//             console.log(scene.audioController.bgMusicPlaying);
//         } else {
//             musicButton.setTexture('checkedBox');

//             if (scene.audioController.bgMusicPlaying === false) {
//                 scene.sys.game.globals.bgMusic.resume();
//                 scene.audioController.bgMusicPlaying = true;
//                 console.log(scene.audioController.bgMusicPlaying);
//             }
            
//         }

//     }

//     updateSound(scene,soundButton) {
//         if (scene.audioController.soundOn === false) {
//             soundButton.setTexture('uncheckedBox');
//         } else {
//             soundButton.setTexture('checkedBox');
//         }
//     }
}

// var CreateMainPanel = function (scene, x, y) {
//     // Create elements
//     var background = scene.rexUI.add.roundRectangle(1000, 1000, 0, 0, 20, COLOR_DARK);
//     var backButton = createBackButton(scene);
//     var menuTittle = scene.add.text(0, 0, 'Audio Settings:', { fontSize: 20 });

//     scene.audioController = scene.sys.game.globals.audioController;

//     var musicToggleLabel = scene.add.text(0, 0, 'Music Enabled:', { fontSize: 16 });
//     var soundToggleLabel = scene.add.text(0, 0, 'SFX Enabled:', { fontSize: 16 });

//     var musicCheckBox;
//     if(scene.audioController.musicOn){
//         musicCheckBox = createCheckBox(scene, true);
//     } else {
//         musicCheckBox = createCheckBox(scene, false);
//     }

//     var soundCheckBox;
//     if(scene.audioController.soundOn){
//         soundCheckBox = createCheckBox(scene, true);
//     } else {
//         soundCheckBox = createCheckBox(scene, false);
//     }

//     var musicSliderLabel = scene.add.text(0, 0, 'Music Volume:', { fontSize: 16 });
//     var soundSliderLabel = scene.add.text(0, 0, 'SFX Volume:', { fontSize: 16 });
    
//     var musicSlider = createSlider(scene);
//     var soundSlider = createSlider(scene);

//     // Compose elemets
//     var mainPanel = scene.rexUI.add.sizer({
//         orientation: 'y',
//         x: x,
//         y: y,
//     })
//         .addBackground(background)
//         .add(backButton, 0, 'center', { top: 20, left: 20, right: 340, bottom: 10}, true)
//         .add(menuTittle, 0, 'center', { top: 0, left: 100, right: 20, bottom: 20 }, true)
//         .add(musicToggleLabel, 0, 'center', { top: 10, left: 80, right: 20, bottom: 0 }, true)
//         .add(musicCheckBox, 0, 'center', { top: -25, left: 250, right: 100, bottom: 10 }, true)
//         .add(soundToggleLabel, 0, 'center', { top: 10, left: 80, right: 20, bottom: 0 }, true)
//         .add(soundCheckBox, 0, 'center', { top: -30, left: 250, right: 100, bottom: 10 }, true)
//         .add(musicSliderLabel, 0, 'center', { top: 20, left: 20, right: 20, bottom: 10 }, true)
//         .add(musicSlider, 0, 'center', { top: 0, left: 20, right: 20, bottom: 10 }, true)
//         .add(soundSliderLabel, 0, 'center', { top: 10, left: 20, right: 20, bottom: 10 }, true)
//         .add(soundSlider, 0, 'center', { top: 0, left: 20, right: 20, bottom: 20 }, true)

//     //  Music check box toggle
//     musicCheckBox.on('pointerdown', function () {
//         scene.audioController.musicOn = !scene.audioController.musicOn;
//         scene.updateMusic(scene,musicCheckBox);
//     }.bind(scene));

//     //  Sound check box toggle
//     soundCheckBox.on('pointerdown', function () {
//         scene.audioController.soundOn = !scene.audioController.soundOn;
//         scene.updateSound(scene,soundCheckBox);
//     }.bind(scene));

//     //  Set music volume to the current musicSlider value
//     musicSlider.setValue(scene.audioController.bgVolume * 100, 0, 100);
//     musicSlider.on('valuechange', function () {
//         scene.updateMusicVolume(musicSlider.getValue());
//     }.bind(scene));

//     //  Set SFX volume to the current soundSlider value
//     soundSlider.setValue(scene.audioController.soundVolume * 100, 0, 100);
//     soundSlider.on('valuechange', function () {
//         scene.updateSoundVolume(soundSlider.getValue());
//     }.bind(scene));

//     //  Close the audio settings and go back to options menu
//     backButton.setScale(0.7);//make it fit the menu scale better
//     backButton.on('pointerdown', () => {
//         scene.optionsModal.setVisible(true);
//         mainPanel.hide();
//     });

//     return mainPanel;
// }

// var createCheckBox = function (scene, checked) {
//     var checkBox = scene.add.image(50, 50, checked ? 'checkedBox' : 'uncheckedBox').setInteractive();
//     return checkBox;
// } 

// var createSlider = function (scene) {
//     return scene.rexUI.add.numberBar({
//         width: 300, // Fixed width
//         background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x260e04),
//         icon: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x7b5e57),
//         slider: {
//             track: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x4e342e),
//             indicator: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x7b5e57),
//             input: 'click',
//         },
//         text: scene.add.text(0, 0, '').setFixedSize(35, 0),
//         space: {
//             left: 10,
//             right: 10,
//             top: 10,
//             bottom: 10,

//             icon: 10,
//             slider: 10,
//         },
//         valuechangeCallback: function (value, oldValue, numberBar) {
//             numberBar.text = Math.round(Phaser.Math.Linear(0, 100, value));
//         },

//     });
// }

// var createBackButton = function(scene){
//     var backButton = scene.add.image(0,0, 'backButton').setInteractive();
//     backButton.on('pointerover', () => {
//         backButton.setScale(.8);
//     });
//     backButton.on('pointerout', () => {
//         backButton.setScale(.7);
//     });
//     return backButton;
// }