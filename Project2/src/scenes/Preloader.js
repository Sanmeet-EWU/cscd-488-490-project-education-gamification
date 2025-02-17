import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(this.scale.width/2, this.scale.height/2, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(this.scale.width/2-230, this.scale.height/2, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload () {
        // Set base path to "assets"
        this.load.setPath('assets');
    
        //this.load.image('Macbeth', 'macbethTitle.png');
        //this.load.image('crown', 'crown.png');
        //this.load.image('dagger', 'daggerSelector.png');
    
        this.load.svg('swordandcrown', 'StartScreen/SwordandCrown.svg', { width: 2000, height: 3400 }); 
        this.load.svg('raven', 'StartScreen/Raven.svg', { width: 1000, height: 1000 });
        this.load.svg('cloud', 'StartScreen/Cloud.svg', { width: 1500, height: 700 });
        this.load.svg('cloud2', 'StartScreen/Cloud2.svg', { width: 1500, height: 700 });
        this.load.svg('cloud3', 'StartScreen/Cloud3.svg', { width: 1500, height: 700 });
        this.load.svg('cloud4', 'StartScreen/Cloud4.svg', { width: 1500, height: 700 });

        //Load audio
        this.load.setPath('assets/audio');
        this.load.audio('testMusic', 'TownTheme.mp3'); // Temp music
    
        //Load UI elements
        this.load.setPath('assets/ui');
        this.load.image('backButton', 'backButton.png');
        this.load.image('checkedBox', 'checkedBox.png');
        this.load.image('options', 'options.png');
        this.load.image('playButton', 'playButton.png');
        this.load.image('uncheckedBox', 'uncheckedBox.png');
        this.load.image('closeMenuButton', 'closeMenuButton.png');
        this.load.image('settingsMenuButton', 'settingsMenuButton.png');
        this.load.image('toMainMenuButton', 'toMainMenuButton.png');
        this.load.image('saveGameButton', 'saveGameButton.png');
        this.load.image('controlsButton', 'controlsButton.png');
    }
    
    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
