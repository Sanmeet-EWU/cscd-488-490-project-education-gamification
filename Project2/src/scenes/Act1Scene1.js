import { GameScene } from './GameScene.js';

export class Act1Scene1 extends GameScene
{
    constructor ()
    {
        super('Act1Scene1');
    }

    init ()
    {

    }

    create ()
    {
        this.text = this.add.text(100, 100, 'Act 1 Scene 1, This is place holder', { fontSize: 40 });

        //this.initializeOptions();
        this.initializePauseMenu(this);
        
    }

    update ()
    {

    }

}