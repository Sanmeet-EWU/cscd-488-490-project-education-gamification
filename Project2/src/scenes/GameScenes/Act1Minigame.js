import { BaseGameScene } from '../BaseGameScene.js';
import CountdownController from '../../CountdownController.js';
import { getFirestore, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";


export class Act1Minigame extends BaseGameScene {

    /**@type {audioController} */
    audioController;
    
    /**@type {CountdownController} */
    countdown;

    /**@type {Phaser.GameObjects.Text} */
    multiplierDisplay;

    /**@type {Phaser.GameObjects.Text} */
    scoreDisplay;

    /**@type {number} */
    multiplier = 1;

    /**@type {number} */
    score = 0;

    /**@type {boolean} */
    gameActive = false;

    /**@type {Phaser.GameObjects.Image} */
    cauldron;

    /**@type {Phaser.GameObjects.Image{}} */
    ingredients = {};

    /**@type {Phaser.GameObjects.Text{}} */
    tags = {};

    /**@type {Phaser.GameObjects.Image} */
    heldIngredient = null;

    /**@type {Phaser.GameObjects.Image} */
    correctIngredient = null;

    player;

    quizOverlay;

    questionSet = [];

    constructor() {
        super('Act1Minigame');
        this.isCutscene = false;
    }

    preload() {
        this.load.svg('bg', '../assets/act1/Act1Scene1EmptyBg.svg', { width: 2560, height: 1440 });
        if (!this.cache.json.exists('Act1MinigameData')) {
            this.load.json('Act1MinigameData', 'SceneDialogue/Act1Minigame.json');
        }
        if (!this.cache.json.exists('Act1QuestionsData')) {
            this.load.json('Act1Questions', 'QuestionSets/Act1Questions.json');
        }
        this.load.image('witch1portrait', 'assets/portraits/witch1portrait.png');
        this.load.image('witch2portrait', 'assets/portraits/witch2portrait.png');
        this.load.image('witch3portrait', 'assets/portraits/witch3portrait.png');

        this.load.image('cauldron', 'assets/act1/witchPot.png');
        this.load.image('cauldronGas', 'assets/effects/cauldronGas.svg');

        this.load.audio('correct', 'assets/audio/CauldronMixing.mp3');
        this.load.audio('incorrect', 'assets/audio/explosion.mp3');
        this.load.audio('pickup', 'assets/audio/swoosh.mp3');

        this.load.image('ingredient1', 'assets/act1/ingredient1.png');
        this.load.image('ingredient2', 'assets/act1/ingredient2.png');
        this.load.image('ingredient3', 'assets/act1/ingredient3.png');
        this.load.image('ingredient4', 'assets/act1/ingredient4.png');
        this.load.image('ingredient5', 'assets/act1/ingredient5.png');
        this.load.image('ingredient6', 'assets/act1/ingredient6.png');
        this.load.image('ingredient7', 'assets/act1/ingredient7.png');

        this.load.on('loaderror', (fileObj) => {
            console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
          });
    }

    /*
    * The idea is to help the other witches brew up something in the cauldron
    * The player will need to add the correct ingredients to the cauldron
    * The player will need to answer questions correctly to get the correct ingredients
    * Each correct asnwer will add time to the countdown, and add to their score, and increase the multipler
    * Getting it wrong will reset the multipler back to 1
    * The game ends when the countdown reaches 0, or there are no more questions
    */

    create(data) {
        super.create(data);
        const { width, height } = this.scale;

        //For saving the score later
        this.db = getFirestore();
        this.auth = getAuth();

        this.gameActive = false;//lock out player movement until the game starts

        this.background = this.add.image(0, 0, 'bg')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setDepth(-5);

        this.createFloor();

        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.audioController = this.sys.game.globals.audioController;
        if (this.audioController) {
          this.audioController.stopMusic();
        }

        this.physics.world.setBounds(0, 0, width, height * .85);//Im setting the Y higher up to act as the floor
        this.physics.world.gravity.y = 1000;

        this.player = this.physics.add.sprite(width * 0.1, height * 0.8, 'witchIdle', 'sprite1');

        //this.setupPlayer();
        this.player.setScale(1.5);
        this.player.setOrigin(0.5, 1.0);
        this.player.setCollideWorldBounds(true);
        this.physics.add.existing(this.player, false);
        this.physics.world.enable(this.player);

        //Position the player
        this.player.x = width / 2;
        this.player.y = height * 4 / 5;
        this.player.setDepth(1);
        this.physics.add.collider(this.player, this.floor);

        //Load the questionSet, and make a deep copy of it
        this.questionSet = this.cache.json.get('Act1Questions').Act1Questions.map(a => {return {...a}})
        if(this.quizOverlay){
            console.log("destroying quiz overlay");
            this.quizOverlay.destroy();
            this.quizOverlay = null;
        }

        //Esure score is reset
        this.score = 0;
        this.multiplier = 1;

        //Set the starting time
        const startingTime = 30;
        
        //Start the countdown clock
        const countdownText = this.add.text(width *0.9, height * 0.1, startingTime, {
            fontFamily: "Inknut Antiqua",
            fontSize: '48px',
            color: '#fcd12a',
            stroke: 'black',
            strokeThickness: 8
        }).setOrigin(0.5);
        this.countdown = new CountdownController(this, countdownText);
        
        this.createIntro(width,height,startingTime);
        
        //Display the multiplier and score
        this.multiplierDisplay = this.add.text(width * 0.9, height * 0.2, 'Multiplier: \n' + this.multiplier, {
            fontFamily: 'Inknut Antiqua',
            fontSize: '24px',
            color: '#fcd12a',
            stroke: 'black',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(.5);
        this.scoreDisplay = this.add.text(width * 0.9, height * 0.3, 'Score: \n' + this.score, {
            fontFamily: 'Inknut Antiqua',
            fontSize: '24px',
            color: '#fcd12a',
            stroke: 'black',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(.5);

    }

    //Displays the rules and start button
    createIntro(width,height,startingTime) {
        const introX = width / 2;
        const introY = height / 2;
        const introWidth = width / 4;
        const introHeight = height*3 / 4;
        const cam = this.cameras.main;
        const titleSize = Math.round(height * .036);
        const rulesSize = Math.round(height * .024);
        const startSize = Math.round(height * .05);
        const rulesText = `Rules:
        - Move left and right with 'A' and 'D'
        - Tap the spacebar or 'W' to jump
        - Press 'E' to pick up ingredients\n
        However choose wisely, as the wrong ingredient will cost you time and reset your multipler!`;

        this.introContainer = this.add.container(introX, introY);
        this.introContainer.add([
            this.rexUI.add.roundRectangle(0, 0, introWidth, introHeight, 20, 0x3B2823).setStrokeStyle(3, 0x674F49).setOrigin(0.5),
            this.title = this.add.text(0, -introHeight*3/8, 'Help the witches brew up something in the cauldron!', {
                fontFamily: 'Inknut Antiqua',
                fontSize: `${titleSize}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center',
                wordWrap: { width: introWidth - 20, useAdvancedWrap: true }
            }).setOrigin(0.5),
            this.portraitContainer = this.add.container(0, this.title.y + height/7),
            this.portraitContainer.add([
                this.subBg = this.rexUI.add.roundRectangle(0, 0, introWidth*7/8, introHeight/8, 10, 0x1A0F0D).setStrokeStyle(3, 0x674F49).setOrigin(0.5),
                this.portrait3 = this.add.image(0, 0, 'witch3portrait')
                    .setOrigin(0.5)
                    .setDisplaySize(this.subBg.height - this.subBg.height*.2, this.subBg.height - 20),
                this.portrait2 = this.add.image(this.portrait3.x-this.portrait3.width*.2, this.portrait3.y, 'witch2portrait')
                    .setOrigin(0.5)
                    .setDisplaySize(this.subBg.height - this.subBg.height*.2, this.subBg.height - 20),
                this.portrait1 = this.add.image(this.portrait3.x+this.portrait3.width*.2, this.portrait3.y, 'witch1portrait')
                    .setOrigin(0.5)
                    .setDisplaySize(this.subBg.height - this.subBg.height*.2, this.subBg.height - 20)
                    .setFlipX(true),
                ]),
            this.rules = this.add.text(0, +50, rulesText, {
                fontFamily: 'Inknut Antiqua',
                fontSize: `${rulesSize}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'left',
                wordWrap: { width: introWidth - 20, useAdvancedWrap: true }
            }).setOrigin(0.5),
            this.startButton = this.add.text(0,introHeight / 2 -50, '- START -', {
                    fontFamily: 'Inknut Antiqua',
                    fontSize: `${startSize}px`,
                    color: '#fcd12a',
                    stroke: 'black',
                    strokeThickness: 8
                }).setOrigin(0.5).setInteractive().setDepth(9)
        ]).setDepth(8);

        this.startButton.on('pointerover', () => {
            this.startButton.setScale(1.1);
        });
        this.startButton.on('pointerout', () => {
            this.startButton.setScale(1);
        });

        //Start the game when the player clicks start
        this.startButton.on('pointerdown', () => {
            this.countdown.start(this.handleOutOfTime.bind(this),startingTime*1000);
                //Game starts
                this.gameActive = true;
                console.log(this.gameActive);
                this.spawnCauldron();
                //Load the first question
                this.loadNextQuestion();
                this.introContainer.destroy();
                this.startButton.destroy();
        });
    }

    // setupPlayer() {
    //     // REPLACE: Define player configuration
    //     const playerConfig = {
    //       texture: 'WitchIdle',
    //       frame: 0,
    //       scale: 1.5,
    //       displayName: 'Player',
    //       animation: 'idleAnim',
    //       movementConstraint: 'horizontal' // or 'topdown'
    //     };
        
    //     // Use the base class method to create player
    //     this.player = this.createPlayer(playerConfig);
    // }

    spawnCauldron() {
        //Initialize the cauldron
        //this.cauldron = this.add.rectangle(this.scale.width * 0.5, this.scale.height * 0.6, 60, 60, 0xFF0000).setOrigin(0.5);
        this.cauldron = this.add.image(this.scale.width * 0.5, this.scale.height * 0.6, 'cauldron')
            .setOrigin(0.5)
            .setDepth(1)
            .setScale(0.5);
        this.physics.add.existing(this.cauldron, true);
        this.physics.world.enable(this.cauldron);
        //You need to define the body size as well, its not set automatically based on sprite size
        this.cauldron.body.setSize(80, 60);
        this.cauldron.body.setOffset(40,0);//have to set a weird offset to make it work with the sprite
        
        //Set up the overlap collision between the player and the cauldron
        this.physics.add.overlap(this.player, this.cauldron, this.handleCauldronOverlap, null, this);
    }

    //Handles loading the next question and displaying it, and spawning the ingredients
    loadNextQuestion() {
        console.log('loading next question');
        console.log(this.questionSet);
        if(!this.quizOverlay) {//Create the quiz overlay if it doesn't exist
            const width = this.scale.width;
            const height = this.scale.height;
            const containX = width / 2;
            const containY = height / 8;
            const containWidth = width * 3/5;
            const containHeight = height * 1/4;
            const questionSize = Math.round(height * .032);
            const answerSize = Math.round(height * .024);

            this.quizOverlay = this.add.container(containX, containY);
            this.quizOverlay.add([
                this.quizBg = this.rexUI.add.roundRectangle(0, 0, containWidth, containHeight, 20, 0x4E342E)
                    .setStrokeStyle(3, 0x674F49)
                    .setOrigin(0.5),
                this.question = this.add.text(-containWidth/2 + 20,-containHeight/2 + 20, '', {
                    fontFamily: 'Inknut Antiqua',
                    fontSize: `${questionSize}px`,
                    color: '#FFDD86',
                    stroke: 'black',
                    strokeThickness: 5,
                    align: 'left',
                    wordWrap: { width: containWidth - 20, useAdvancedWrap: true }
                }).setOrigin(0,0),
                this.answer1 = this.add.text(-containWidth/2 + 25, this.question.y + questionSize*2.5, '', {
                    fontFamily: 'Inknut Antiqua',
                    fontSize: `${answerSize}px`,
                    color: '#FFDD86',
                    stroke: 'black',
                    strokeThickness: 4,
                    wordWrap: { width: containWidth/2 - 20, useAdvancedWrap: true }
                }).setOrigin(0,0),
                this.answer2 = this.add.text(-containWidth/2 + 25, this.answer1.y + questionSize*2, '', {
                    fontFamily: 'Inknut Antiqua',
                    fontSize: `${answerSize}px`,
                    color: '#FFDD86',
                    stroke: 'black',
                    strokeThickness: 4,
                    wordWrap: { width: containWidth/2 - 20, useAdvancedWrap: true }
                }).setOrigin(0,0),
                this.answer3 = this.add.text(5, this.question.y + questionSize*2.5, '', {
                    fontFamily: 'Inknut Antiqua',
                    fontSize: `${answerSize}px`,
                    color: '#FFDD86',
                    stroke: 'black',
                    strokeThickness: 4,
                    wordWrap: { width: containWidth/2 - 20, useAdvancedWrap: true }
                }).setOrigin(0,0),
                this.answer4 = this.add.text(5, this.answer3.y + questionSize*2, '', {
                    fontFamily: 'Inknut Antiqua',
                    fontSize: `${answerSize}px`,
                    color: '#FFDD86',
                    stroke: 'black',
                    strokeThickness: 4,
                    wordWrap: { width: containWidth/2 - 20, useAdvancedWrap: true }
                }).setOrigin(0,0), 
            ]);
        }

        //console.log(this.questionSet);
        if(this.questionSet.length > 0) {
            console.log('There are questions left');
            let randomIndex = Math.floor(Math.random() * this.questionSet.length);
            let question = this.questionSet.splice(randomIndex, 1)[0];
                // console.log('Question: ' + question.question);
                // console.log('Answer1: ' + question.answers[0]);
                // console.log('Answer2: ' + question.answers[1]);
                // console.log('Answer3: ' + question.answers[2]);
                // console.log('Answer4: ' + question.answers[3]);
                // console.log('Correct Answer: ' + question.correct);
            //display the question
            //console.log(this.questionSet);
            this.quizOverlay.getAt(1).setText(question.question);

            //shuffle the answers
            question.answers = Phaser.Utils.Array.Shuffle([...question.answers]);
            let setCorrect = question.answers.indexOf(question.correct);
            this.spawnIngredients(setCorrect);

            //Update the answers on the overlay
            this.quizOverlay.getAt(2).setText('1. ' + question.answers[0]);
            this.quizOverlay.getAt(3).setText('2. ' + question.answers[1]);
            this.quizOverlay.getAt(4).setText('3. ' + question.answers[2]);
            this.quizOverlay.getAt(5).setText('4. ' + question.answers[3]);
            //this.spawnIngredients(question);

        } else {
            console.log('No more questions');
            //End the game
            this.countdown.stop();
            this.quizOverlay.destroy();
            this.gameActive = false;
            this.add.text(this.scale.width / 2, this.scale.height / 12, 'You got through all the questions!', {
                fontFamily: 'Inknut Antiqua',
                fontSize: '48px',
                color: '#0DB500',
                stroke: 'black',
                strokeThickness: 8
            }).setOrigin(0.5);
            this.endGame();
        }
    }

    //Spawn new ingredients for each question
    spawnIngredients(setCorrect) {

        //Need to destroy old ingredients if they exist
        if(this.ingredients.ingredient1) {
            this.ingredients.ingredient1.destroy();
        }
        if(this.ingredients.ingredient2) {
            this.ingredients.ingredient2.destroy();
        }
        if(this.ingredients.ingredient3) {
            this.ingredients.ingredient3.destroy();
        }
        if(this.ingredients.ingredient4) {
            this.ingredients.ingredient4.destroy();
        }

        //Randomize which ingredients sprites to use
        let possibleSprites = ['ingredient1', 'ingredient2', 'ingredient3', 'ingredient4', 'ingredient5', 'ingredient6', 'ingredient7'];
        let usingSprties = [];
        for(let i = 0; i < 4; i++) {
            let randomIndex = Math.floor(Math.random() * possibleSprites.length);
            usingSprties.push(possibleSprites.splice(randomIndex, 1)[0]);
        }

        //Spawn new ingredients
        this.ingredients = {
            ingredient1: this.add.image(this.scale.width  * 0.1, this.scale.height * 0.85, usingSprties[0]).setDepth(2),
            ingredient2: this.add.image(this.scale.width  * 0.3, this.scale.height * 0.85, usingSprties[1]).setDepth(2),
            ingredient3: this.add.image(this.scale.width  * 0.7, this.scale.height * 0.85, usingSprties[2]).setDepth(2),
            ingredient4: this.add.image(this.scale.width  * 0.9, this.scale.height * 0.85, usingSprties[3]).setDepth(2)
        }

        switch(setCorrect) {
            case 0:
                this.correctIngredient = this.ingredients.ingredient1;
                break;
            case 1:
                this.correctIngredient = this.ingredients.ingredient2;
                break;
            case 2:
                this.correctIngredient = this.ingredients.ingredient3;
                break;
            case 3:
                this.correctIngredient = this.ingredients.ingredient4;
                break;
        }


        // this.tags = {
        //     ingredient1: this.add.text(0,0,question.answers[0], {align: 'center'}),
        //     ingredient2: this.add.text(0,0,question.answers[1], {align: 'center'}),
        //     ingredient3: this.add.text(0,0,question.answers[2], {align: 'center'}),
        //     ingredient4: this.add.text(0,0,question.answers[3], {align: 'center'})
        // }

        


        
        ////////////////////////////////////////////////
        //There is probably a better way to do this...//
        ////////////////////////////////////////////////

        //1
        this.physics.add.existing(this.ingredients.ingredient1, true);
        this.physics.world.enable(this.ingredients.ingredient1);
        this.ingredients.ingredient1.enableBody = true;
        this.ingredients.ingredient1.body.setSize(60, 60);
        this.ingredients.ingredient1.body.setOffset(0.5);
        //2
        this.physics.add.existing(this.ingredients.ingredient2, true);
        this.physics.world.enable(this.ingredients.ingredient2);
        this.ingredients.ingredient2.enableBody = true;
        this.ingredients.ingredient2.body.setSize(60, 60);
        this.ingredients.ingredient2.body.setOffset(0.5);
        //3
        this.physics.add.existing(this.ingredients.ingredient3, true);
        this.physics.world.enable(this.ingredients.ingredient3);
        this.ingredients.ingredient3.enableBody = true;
        this.ingredients.ingredient3.body.setSize(60, 60);
        this.ingredients.ingredient3.body.setOffset(0.5);
        //4
        this.physics.add.existing(this.ingredients.ingredient4, true);
        this.physics.world.enable(this.ingredients.ingredient4);
        this.ingredients.ingredient4.enableBody = true;
        this.ingredients.ingredient4.body.setSize(60, 60);
        this.ingredients.ingredient4.body.setOffset(0.5);
        //Need to set overlap collision between the player and each ingredient as well
        this.physics.add.overlap(this.player, this.ingredients.ingredient1, this.handleIngredientPickup.bind(this));
        this.physics.add.overlap(this.player, this.ingredients.ingredient2, this.handleIngredientPickup.bind(this));
        this.physics.add.overlap(this.player, this.ingredients.ingredient3, this.handleIngredientPickup.bind(this));
        this.physics.add.overlap(this.player, this.ingredients.ingredient4, this.handleIngredientPickup.bind(this));

    }

    handleIngredientPickup(scene,ingredient) {
        //Early exit if they are not trying to pick up an ingredient
        if(!this.keys.interact.isDown)
            return

        //If the player is already holding an ingredient, swap it with the new one
        if(this.heldIngredient){//Swap the ingredients
            return;//I'm giving up on swaping, it was causing too many issues with bodies
            // let temp = this.heldIngredient;
            // this.heldIngredient = ingredient;
            // ingredient = temp;
            //ingredient.body.reset(ingredient.x, ingredient.y);
            //this.heldIngredient.body.reset(this.heldIngredient.x, this.heldIngredient.y);
        }
        else{
            //No swaps needed
            this.heldIngredient = ingredient;
            //Play a sound effect
            this.sound.add('pickup').play({ loop: false, volume: this.audioController.soundVolume });
        }
    }

    handleCauldronOverlap() {
        //Need to check if the player is holding an ingredient
        if(!this.heldIngredient) {
            console.log("overlap - not holding ingredient");
            //If not, early exit
            return;
        }

        console.log("overlap - holding ingredient");
        //Need to check if the player has the correct ingredient and answer
        if(this.heldIngredient  == this.correctIngredient) {
            console.log("correct ingredient");
            //If so, add to the score, time, and multiplier
            this.countdown.addTime(3*1000);
            this.score += 100 * this.multiplier;
            this.multiplier += 0.25;
            //Then load the next question, respawn new ingredients
            this.loadNextQuestion();
            //Play a correct sound effect and use the green gas for animation
            this.sound.add('correct').play({ loop: false, volume: this.audioController.soundVolume*1.5});//kinda quiet 

            const gas = this.add.image(this.cauldron.x, this.cauldron.y - 130, 'cauldronGas')
                .setOrigin(0.5)
                .setAlpha(1)
                .setDepth(5)
                .setScale(0.5);

            this.time.delayedCall(100, () => { if (gas.active) gas.setAlpha(0); });
            this.time.delayedCall(200, () => { if (gas.active) gas.setAlpha(1); });
            this.time.delayedCall(300, () => { if (gas.active) gas.setAlpha(0); });
            this.time.delayedCall(400, () => { if (gas.active) gas.setAlpha(1); });
            this.time.delayedCall(600, () => { if (gas.active) gas.setAlpha(0); });
        }
        else {
            console.log("incorrect ingredient");
            //Else the player loses time, and the multiplier is reset
            this.countdown.addTime(-2*1000);
            this.multiplier = 1;
            //Play an incorrect sound effect and use the red gas for animation
            this.sound.add('incorrect').play({ loop: false, volume: this.audioController.soundVolume*1.5});//kinda quiet

            const gas = this.add.image(this.cauldron.x, this.cauldron.y - 130, 'cauldronGas')
                .setOrigin(0.5)
                .setAlpha(1)
                .setDepth(5)
                .setScale(0.5)
                .setTint(0xff1100);

            this.time.delayedCall(100, () => { if (gas.active) gas.setAlpha(0); });
            this.time.delayedCall(200, () => { if (gas.active) gas.setAlpha(1); });
            this.time.delayedCall(300, () => { if (gas.active) gas.setAlpha(0); });
            this.time.delayedCall(400, () => { if (gas.active) gas.setAlpha(1); });
            this.time.delayedCall(600, () => { if (gas.active) gas.setAlpha(0); });  
        }

        //Update the score display
        this.scoreDisplay.setText('Score: \n' + this.score);
        this.multiplierDisplay.setText('Multiplier: \n' + this.multiplier);

        //Set the held ingredient to null
        this.heldIngredient.destroy();
        this.heldIngredient = null;
    }

    //Handle when the player runs out of time
    handleOutOfTime() {
        console.log("out of time called");
        this.add.text(this.scale.width / 2, this.scale.height / 12, 'You ran out of time!', {
            fontFamily: 'Inknut Antiqua',
            fontSize: '48px',
            color: '#FF0000',
            stroke: 'black',
            strokeThickness: 8
        }).setOrigin(0.5);

        //End the game
        this.endGame();
    }

    endGame() {
        //Stop the player from moving
        this.player.setVelocity(0,0);
        //Destroy quiz overlay if it exists
        if(this.quizOverlay){
            this.quizOverlay.destroy();
            this.quizOverlay = null;
        }

        //Ensure game is over
        this.gameActive = false;
        console.log(this.gameActive);

        this.endGameOverlay = this.add.container(this.scale.width / 2, this.scale.height / 2);
        this.endGameOverlay.add([
            this.rexUI.add.roundRectangle(0, 0, 340, 440, 20, 0x4E342E).setStrokeStyle(3, 0x674F49).setOrigin(0.5),
            this.add.text(0, -150, 'Your Score:', {
                fontFamily: 'Inknut Antiqua',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5).setInteractive(),
            this.add.text(0, -100, this.score, {
                fontFamily: 'Inknut Antiqua',
                fontSize: '48px',
                color: '#fcd12a',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5).setInteractive(),
            this.add.image(0, 0, 'playAgainButton').setOrigin(0.5).setInteractive(),
            this.add.image(0, 80, 'toMainMenuButton').setOrigin(0.5).setInteractive(),
            this.add.image(0, 160, 'continueButton').setOrigin(0.5).setInteractive(),
        ]).setDepth(8);

        //Save score to the player's account ------------------------------------------------------
        this.updateScore();

        //Handle the buttons actions
        this.endGameOverlay.getAt(3).on('pointerdown', () => {
            this.switchScene('Act1Minigame');
        });
        this.endGameOverlay.getAt(4).on('pointerdown', () => {
            this.switchScene('MainMenu');
        });
        this.endGameOverlay.getAt(5).on('pointerdown', () => {
            this.switchScene('Act1Scene2');
        });

        //Button animations
        this.endGameOverlay.getAt(3).on('pointerover', () => {
            this.endGameOverlay.getAt(3).setScale(1.1);
        });
        this.endGameOverlay.getAt(3).on('pointerout', () => {
            this.endGameOverlay.getAt(3).setScale(1);
        });
        this.endGameOverlay.getAt(4).on('pointerover', () => {
            this.endGameOverlay.getAt(4).setScale(1.1);
        });
        this.endGameOverlay.getAt(4).on('pointerout', () => {
            this.endGameOverlay.getAt(4).setScale(1);
        });
        this.endGameOverlay.getAt(5).on('pointerover', () => {
            this.endGameOverlay.getAt(5).setScale(1.1);
        });
        this.endGameOverlay.getAt(5).on('pointerout', () => {
            this.endGameOverlay.getAt(5).setScale(1);
        });

    }

    async updateScore() {
        //this.saveProgress();
        console.log("updating score");
        const user = this.auth.currentUser;
        if (!user) {
            alert("You need to be logged in to save your score!");
            return;
        }
        else {
            try { 
                const playersRef = collection(this.db, "Players");
                const q = query(playersRef, where("SchoolEmail", "==", user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    await updateDoc(querySnapshot.docs[0].ref, { Score: this.score + querySnapshot.docs[0].data().Score });
                    alert("Score updated successfully!");
                }
            } catch {
                alert("Error updating your.");
            }
        }
    }

    createFloor() {
        const { width, height } = this.scale;
        const groundY = height * 0.85;
        this.floor = this.physics.add.staticGroup();
        const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
        this.floor.add(ground);
        ground.setVisible(false);
    }

    update() {
        super.update();
        this.countdown.update();

        if(!this.gameActive || this.isPaused) {
            return;//Should probably lock player movement here
        }

        const speed = 300;

        // Handle player movement
        if (this.keys.left.isDown && this.keys.right.isDown) {
            this.player.setVelocityX(0);
        }
        else if(this.keys.left.isDown) {
            this.player.setVelocityX(-speed);
            //this.player.anims.play('left', true);
        } else if (this.keys.right.isDown) {
            this.player.setVelocityX(speed);
            //this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            //this.player.anims.play('idle', true);
        }
        //Jump only when in contact with the floor
        if ((this.keys.up.isDown || this.keys.space.isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-550);
        }

        //Debugging
        // if(this.keys.down.isDown) {
        //     console.log("item 1:  " + this.ingredients.ingredient1.body.x + "," + this.ingredients.ingredient1.body.y);
        //     console.log("item 2:  " + this.ingredients.ingredient2.body.x + "," + this.ingredients.ingredient2.body.y);
        //     console.log("item 3:  " + this.ingredients.ingredient3.body.x + "," + this.ingredients.ingredient3.body.y);
        //     console.log("item 4:  " + this.ingredients.ingredient4.body.x + "," + this.ingredients.ingredient4.body.y);
        //     if(this.heldIngredient) console.log("held: " + this.heldIngredient.body.x + "," + this.heldIngredient.body.y);
        // }

        //Handle the position of the held ingredient
        if(this.heldIngredient){
            this.heldIngredient.x = this.player.x;
            this.heldIngredient.y = this.player.y;
            // this.heldIngredient.body.reset(this.heldIngredient.x, this.heldIngredient.y);
        }

    }

}