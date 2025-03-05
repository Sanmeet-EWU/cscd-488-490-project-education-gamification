export default class CountdownController {

    /**@type {Phaser.Scene} */
    scene
    /**@type {number} */
    time
    /**@type {Phaser.GameObjects.Text} */
    label
    /**@type {Phaser.Time.TimerEvent} */
    timerEvent
    /**@type {() => void} callback */
    timedCallback
    /**@type {number} */
    duration = 0

    /**
     * @param {Phaser.Scene} scene 
     * @param {number} startingTime 
     * @param {Phaser.GameObjects.Text} label 
     */    
    constructor(scene, label) {
        this.scene = scene;
        this.label = label;
    }

    /**
     * 
     * @param {() => void} callback - null will not call to a function
     * @param {number} duration - default is 60 seconds
     */
    start(callback, duration = 60000) {
        //If a time is already running, remove it
        this.stop();

        this.duration = duration;
        this.timedCallback = callback;

        //Start the countdown
        this.timerEvent = this.scene.time.addEvent({
            delay: duration,
            callback: () => {
                this.label.setText("0");

                //if the callback function is passed, call it
                if(callback) {
                    console.log("Timer is out of time");
                    callback();
                }
                this.stop();
            }
        });
    }

    stop() {
        if(this.timerEvent) {
            this.timerEvent.destroy();
            this.timerEvent = undefined;
        }
    }

    update() {//This will need to be called within the gamescene

        //Check if a timer is even running
        if (!this.timerEvent || this.duration <= 0) {
            return;
        }

        //Handel the pause state
        this.timerEvent.paused = this.scene.isPaused;
        
        //Update the displayed time
        const elapsed = this.timerEvent.getElapsed();
        const remaining = this.duration - elapsed;
        const seconds = Math.ceil(remaining / 1000);

        this.label.setText(seconds);
    }

    /**
     * @param {number} time - adding negatives is safe
     */
    addTime(time) {
        if(!this.timerEvent || this.duration <= 0) {
            console.log("Can't add time to a timer that is not running");
            return;
        }

        //Add to whats currently left on the timer
        this.start(this.timedCallback, this.duration - this.timerEvent.getElapsed() + time);
    }


}