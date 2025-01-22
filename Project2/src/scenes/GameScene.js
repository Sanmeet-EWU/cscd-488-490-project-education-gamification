import { Scene } from 'phaser';

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

    initializeOptions(){
        this.makeOptionsButton();
        this.optionsModal = this.makeOptionsModal();
        this.optionsModal.depth = 10;//This may need tweaking later, but depth controls the order of rendering
        this.optionsModal.setVisible(false);
    }

    // Makes a button for opening the options menu modal in the corner of the screen
    makeOptionsButton(){
        this.optionsButton = this.add.image(1000, 24, 'options').setInteractive();
        //this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.optionsButton.on('pointerdown', () => {
            this.optionsModal.setVisible(true);
            this.optionsModal.setActive(true);
        });
        this.optionsButton.on('pointerover', () => {
            this.optionsButton.setScale(1.1);
        });
        this.optionsButton.on('pointerout', () => {
            this.optionsButton.setScale(1);
        });
    }

    makeOptionsModal(){
        //var rect = scene.add.rexRoundRectangle(x, y, width, height, radius, fillColor, fillAlpha);

        var container = this.add.container(512, 400);
        this.optionsBg = this.rexUI.add.roundRectangle(0, 0, 340, 440, 20, 0x4E342E);
        this.optionsBg.setStrokeStyle(3, 0x674F49);

        this.optionsTitle = this.add.text(-50, -160, 'Options:', { fontFamily: 'Inknut Antiqua', fontSize: '24px', fill: '#fff' });

        //this.closeButton = this.makeCloseButton(120,-180).setInteractive();

        this.closeButton = this.add.image(120, -180, 'closeMenuButton').setInteractive();
        this.closeButton.on('pointerdown', () => {
            this.optionsModal.setVisible(false);
            this.optionsModal.setActive(false);
        });
        this.closeButton.on('pointerover', () => {
            this.closeButton.setScale(1.1);
        });
        this.closeButton.on('pointerout', () => {
            this.closeButton.setScale(1);
        });

        this.settingsMenuButton = this.add.image(0, -90, 'settingsMenuButton').setInteractive();//Need to create another similar sub menu for settings
        this.settingsMenuButton.on('pointerdown', () => {
            //Ill have to create 
            alert('Settings menu opened');
        });
        this.settingsMenuButton.on('pointerover', () => {
            this.settingsMenuButton.setScale(1.1);
        });
        this.settingsMenuButton.on('pointerout', () => {
            this.settingsMenuButton.setScale(1);
        });

        this.toMainMenuButton = this.add.image(0, 150, 'toMainMenuButton').setInteractive();
        this.toMainMenuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        this.toMainMenuButton.on('pointerover', () => {
            this.toMainMenuButton.setScale(1.1);
        });
        this.toMainMenuButton.on('pointerout', () => {
            this.toMainMenuButton.setScale(1);
        });

        //Put together the menu container
        container.add(this.optionsBg);
        container.add(this.optionsTitle);
        container.add(this.closeButton);
        container.add(this.settingsMenuButton);
        container.add(this.toMainMenuButton);

        return container;
    }

    //This is too much work for being ugly as well
    makeCloseButton(x,y){
        var closeButton = this.add.container(x, y);
        closeButton.setSize(70, 38);
        closeButton.setInteractive();
        this.buttonBg = this.rexUI.add.roundRectangle(0, 0, 70, 38, 10, 0x3B2823);
        this.buttonBg.setStrokeStyle(3, 0x674F49);
        this.buttonText = this.add.text(-20, -5.25, 'Close', { fontFamily: 'Inknut Antiqua', fontSize: '14px', fill: '#fff' });

        closeButton.add(this.buttonBg);
        closeButton.add(this.buttonText);

        closeButton.on('pointerdown', () => {
            this.optionsModal.setVisible(false);
            this.optionsModal.setActive(false);
        });

        return closeButton;
    }

    update ()
    {
        
    }
}