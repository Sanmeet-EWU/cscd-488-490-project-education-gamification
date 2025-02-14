import { Scene } from 'phaser';

export class BaseScene extends Scene {
    constructor(key) {
        super(key);
        this.sceneKey = key;
    }

    create() {
        // Listen for Phaser's built-in resize events.
        this.scale.on('resize', this.handleResize, this);

        // Add a global window resize listener to catch maximize/unmaximize events.
        this._onWindowResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            // Force the game to use the current window dimensions:
            this.scale.setGameSize(newWidth, newHeight);
            // Call repositionUI so that child scenes can update their layout.
            if (this.repositionUI) {
                this.repositionUI({ width: newWidth, height: newHeight });
            }
        };
        window.addEventListener('resize', this._onWindowResize);

        // Remove listeners when the scene shuts down.
        this.events.on('shutdown', () => {
            window.removeEventListener('resize', this._onWindowResize);
            this.scale.off('resize', this.handleResize, this);
        });
    }

    switchScene(targetScene) {
        
        if (!this.scene.get(targetScene)) {
            console.error(`Scene "${targetScene}" does not exist!`);
            return;
        }
        
        // Fade out the current scene over 500ms
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        // Once the fade-out completes, stop the current scene and start the target scene.
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop(this.scene.key);
            this.scene.start(targetScene);
        });
    }
    

    /**
     * Called by Phaser's scale manager when a resize event occurs.
     * This method updates the camera and forces a UI reposition.
     */
    handleResize(gameSize) {
        if (!this.scene.isActive(this.sceneKey)) return;

        let newWidth = gameSize?.width ?? window.innerWidth;
        let newHeight = gameSize?.height ?? window.innerHeight;


        // Ensure we get the actual window dimensions.
        newWidth = Math.max(newWidth, window.innerWidth);
        newHeight = Math.max(newHeight, window.innerHeight);

        if (this.cameras && this.cameras.main) {
            this.cameras.main.setSize(newWidth, newHeight);
        } else {
            console.warn("Camera not initialized yet.");
            return;
        }

        // If dimensions are unchanged, do nothing.
        if (this.scale.width === newWidth && this.scale.height === newHeight) {
            return;
        }

        // Update the game size.
        this.scale.setGameSize(newWidth, newHeight);

        // Use a short delay to allow Phaser to update its internals, then refresh.
        setTimeout(() => {
            this.scale.refresh();
            this.scale.updateScale();
            this.cameras.main.setSize(newWidth, newHeight);
            if (this.repositionUI) {
                this.repositionUI({ width: newWidth, height: newHeight });
            }
        }, 50);
    }

    /**
     * Helper: Scales an image while maintaining its aspect ratio.
     */
    fitToScreen(image, scaleFactor) {
        if (!image.texture || image.width === 0 || image.height === 0) return;
        
        // Calculate a base scale relative to the smaller screen dimension.
        let baseScale = Math.min(this.scale.width, this.scale.height) * scaleFactor / 1000;
        image.setScale(baseScale);
    }

    /**
     * Helper: Creates a menu button with consistent styling.
     */
    createButton(text, positionFactor, callback) {
        const button = this.add.text(
            this.scale.width * 0.5, 
            this.scale.height * positionFactor, 
            text, 
            {
                fontFamily: 'Inknut Antiqua',
                fontSize: `${Math.floor(this.scale.height * 0.05)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            }
        ).setOrigin(0.5).setInteractive();

        button.on('pointerover', () => button.setColor('#ff0'));
        button.on('pointerout', () => button.setColor('#fff'));
        button.on('pointerdown', callback);

        return button;
    }

    /**
     * Placeholder for repositioning UI elements on window resize.
     */
    repositionUI({ width, height }) {
        // To be overridden by child scenes.
    }
}
