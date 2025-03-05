import { BaseGameScene } from '../BaseGameScene.js';
import CountdownController from '../../CountdownController.js';
import { DialogueManager } from '../../DialogueManager.js';
import { count } from 'firebase/firestore';

export class Act1Minigame extends BaseGameScene {

    /**@type {audioController} */
    audioController;
    
    /**@type {CountdownController} */
    countdown;

    /**@type {DialogueManager} */
    dialogueManager;

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
        if (!this.textures.exists('background')) {
            this.load.svg('background', '../assets/act1/act1scene1.svg', { width: 2560, height: 1440 });
        }
        if (!this.cache.json.exists('Act1MinigameData')) {
            this.load.json('Act1MinigameData', 'SceneDialogue/Act1Minigame.json');
        }
        if (!this.cache.json.exists('Act1QuestionsData')) {
            this.load.json('Act1Questions', 'QuestionSets/Act1Questions.json');
        }
        this.load.image('witch1portrait', 'assets/portraits/witch1portrait.png');
        this.load.image('witch2portrait', 'assets/portraits/witch2portrait.png');
        this.load.image('witch3portrait', 'assets/portraits/witch3portrait.png');
        this.load.spritesheet('WitchIdle', 'assets/characters/B_witch_idle.png', {
            frameWidth: 24, frameHeight: 36
        });
        this.load.image('greenGas1', 'assets/effects/greenGas1.svg');
        this.load.image('greenGas2', 'assets/effects/greenGas2.svg');
        this.load.image('redGas1', 'assets/effects/redGas1.svg');
        this.load.image('redGas2', 'assets/effects/redGas2.svg');

        this.load.audio('correct', 'assets/audio/CauldronMixing.mp3');
        this.load.audio('incorrect', 'assets/audio/explosion.mp3');
        this.load.audio('pickup', 'assets/audio/swoosh.mp3');

        this.load.image('ingredient1', 'assets/act1/ingredient1.png');
        this.load.image('ingredient2', 'assets/act1/ingredient2.png');
        this.load.image('ingredient3', 'assets/act1/ingredient3.png');
        this.load.image('ingredient4', 'assets/act1/ingredient4.png');
        this.load.image('ingredient5', 'assets/act1/ingredient5.png');

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

        this.background = this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setDepth(-5);

        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.audioController = this.sys.game.globals.audioController;
        if (this.audioController) {
          this.audioController.stopMusic();
        }

        this.physics.world.setBounds(0, 0, width, height * .8);//Im setting the Y higher up to act as the floor
        this.physics.world.gravity.y = 1000;

        this.player = this.physics.add.sprite(width * 0.1, height * 0.8, 'witchIdle', 'sprite1');
        this.player.setScale(1.5);
        this.player.setOrigin(0.5, 1.0);
        this.player.setCollideWorldBounds(true);
        this.physics.add.existing(this.player, false);
        this.physics.world.enable(this.player);
        this.player.depth = 10; // Ensure player is above other elements
        

        //Position the player
        this.player.x = width / 2;
        this.player.y = height * 4 / 5;
        this.player.setDepth(1);
        

        //Load the questionSet
        this.questionSet = this.cache.json.get('Act1Questions').Act1Questions;
        
        //Set the starting time
        const startingTime = 30;
        
        //Handle the introduction to the minigame rules etc, then start
        this.introduction();

        //Start the countdown clock
        const countdownText = this.add.text(width *0.9, height * 0.1, startingTime, {
            fontFamily: "Inknut Antiqua",
            fontSize: '48px',
            color: '#fcd12a',
            stroke: 'black',
            strokeThickness: 8
        }).setOrigin(0.5);
        this.countdown = new CountdownController(this, countdownText);
        this.countdown.start(this.handleOutOfTime.bind(this),startingTime*1000);


        //Initialize the cauldron
        this.cauldron = this.add.rectangle(this.scale.width * 0.5, this.scale.height * 0.6, 60, 60, 0xFF0000).setOrigin(0.5);
        this.physics.add.existing(this.cauldron, true);
        this.physics.world.enable(this.cauldron);
        this.cauldron.enableBody = true;
        this.cauldron.setDepth(1);
        //You need to define the body size as well, its not set automatically based on sprite size
        this.cauldron.body.setSize(60, 60);
        this.cauldron.body.setOffset(0, 0);


        //Set up the overlap collision between the player and the cauldron
        this.physics.add.overlap(this.player, this.cauldron, this.handleCauldronOverlap, null, this);

        //Load the first question
        this.loadNextQuestion();
        
        //Game starts
        this.gameActive = true;
        console.log(this.gameActive);

    }

    //Handle the introduction to the minigame rules etc
    introduction() {

        // Create and load dialogue data
        try {
            if (!this.cache.json.exists('Act1MinigameData')) {
            throw new Error("Dialogue data not found");
            }
            const portraitMap = {
            "First Witch": "witch1portrait",
            "Second Witch": "witch2portrait",
            "Third Witch": "witch3portrait"
            };
            const dialogueData = this.cache.json.get('Act1MinigameData');
            if (!dialogueData || Object.keys(dialogueData).length === 0) {
            throw new Error("Dialogue data is empty");
            }
            this.dialogueManager = new DialogueManager(this, dialogueData, portraitMap, true);
        } catch (error) {
            this.add.text(width / 2, height / 2, `Error: ${error.message}`, {
            fontSize: '32px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
            }).setOrigin(0.5);
            return;
        }

    }

    loadNextQuestion() {
        console.log('loading next question');

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

            this.spawnIngredients(this.questionSet);
            

            //display the answers
                //Need to randomize the order of the answers
                //Need to randomize the ingredients tied to the answers

        } else {
            console.log('No more questions');
            //End the game
            this.countdown.stop();
            this.gameActive = false;
            
        }
    }

    //Spawn new ingredients for each question
    spawnIngredients(questionSet) {

        //need to destroy old ingredients if thsy exist
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

        //Spawn new ingredients
        this.ingredients = {
            ingredient1: this.add.image(this.scale.width  * 0.1, this.scale.height * 0.8, 'ingredient1').setDepth(2),
            ingredient2: this.add.image(this.scale.width  * 0.3, this.scale.height * 0.8, 'ingredient2').setDepth(2),
            ingredient3: this.add.image(this.scale.width  * 0.7, this.scale.height * 0.8, 'ingredient3').setDepth(2),
            ingredient4: this.add.image(this.scale.width  * 0.9, this.scale.height * 0.8, 'ingredient4').setDepth(2)
        }

        ////////////////////////////////////////////////
        //There is probably a better way to do this...//
        ////////////////////////////////////////////////

        this.physics.add.existing(this.ingredients.ingredient1, true);
        this.physics.world.enable(this.ingredients.ingredient1);
        this.ingredients.ingredient1.enableBody = true;
        this.ingredients.ingredient1.setDepth(1);
        //You need to define the body size as well, its not set automatically based on sprite size
        this.ingredients.ingredient1.body.setSize(60, 60);
        this.ingredients.ingredient1.body.setOffset(0, 0);

        this.physics.add.existing(this.ingredients.ingredient2, true);
        this.physics.world.enable(this.ingredients.ingredient2);
        this.ingredients.ingredient2.enableBody = true;
        this.ingredients.ingredient2.setDepth(1);
        //You need to define the body size as well, its not set automatically based on sprite size
        this.ingredients.ingredient2.body.setSize(60, 60);
        this.ingredients.ingredient2.body.setOffset(0, 0);

        this.physics.add.existing(this.ingredients.ingredient3, true);
        this.physics.world.enable(this.ingredients.ingredient3);
        this.ingredients.ingredient3.enableBody = true;
        this.ingredients.ingredient3.setDepth(1);
        //You need to define the body size as well, its not set automatically based on sprite size
        this.ingredients.ingredient3.body.setSize(60, 60);
        this.ingredients.ingredient3.body.setOffset(0, 0);

        this.physics.add.existing(this.ingredients.ingredient4, true);
        this.physics.world.enable(this.ingredients.ingredient4);
        this.ingredients.ingredient4.enableBody = true;
        this.ingredients.ingredient4.setDepth(1);
        //You need to define the body size as well, its not set automatically based on sprite size
        this.ingredients.ingredient4.body.setSize(60, 60);
        this.ingredients.ingredient4.body.setOffset(0, 0);

        //Need to set overlap collision between the player and each ingredient as well
        this.physics.add.overlap(this.player, this.ingredients.ingredient1, this.handleIngredientPickup.bind(this), null, this);
        this.physics.add.overlap(this.player, this.ingredients.ingredient2, this.handleIngredientPickup.bind(this), null, this);
        this.physics.add.overlap(this.player, this.ingredients.ingredient3, this.handleIngredientPickup.bind(this), null, this);
        this.physics.add.overlap(this.player, this.ingredients.ingredient4, this.handleIngredientPickup.bind(this), null, this);

        //Set the correct ingredient
        this.correctIngredient = this.ingredients.ingredient1;//for now
        
    }

    handleIngredientPickup(scene,ingredient) {
        console.log("pickup" + ingredient);

        //Early exit if they are not trying to pick up an ingredient
        if(!this.keys.interact.isDown)
            return

        console.log("pickup2");
        this.sound.add('pickup').play({ loop: false, volume: this.audioController.soundVolume });
        if(this.heldIngredient){//Swap
            let temp = this.heldIngredient;
            this.heldIngredient = ingredient;
            ingredient = temp;
        }
        else{
            this.heldIngredient = ingredient;
            //this.heldIngredient = this.ingredients.ingredient1;
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
            this.countdown.addTime(5*1000);
            this.score += 100 * this.multiplier;
            this.multiplier += 0.25 + this.multiplier;
            //Then load the next question, respawn new ingredients
            this.loadNextQuestion();
            //Play a correct sound effect and use the green gas for animation
            this.sound.add('correct').play({ loop: false, volume: this.audioController.soundVolume*1.5});//kinda quiet 
        }
        else {
            console.log("incorrect ingredient");
            //Else the player loses time, and the multiplier is reset
            this.countdown.addTime(-2*1000);
            this.multiplier = 1;
            //Play an incorrect sound effect and use the red gas for animation
            this.sound.add('incorrect').play({ loop: false, volume: this.audioController.soundVolume*1.5});//kinda quiet
        }

        //Set the held ingredient to null
        this.heldIngredient.destroy();
        this.heldIngredient = null;
    }

    //Handle when the player runs out of time
    handleOutOfTime() {
        this.gameActive = false;
        console.log(this.gameActive);
        console.log("out of time called");
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'Game Over', {
            fontFamily: 'Inknut Antiqua',
            fontSize: '48px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        //Need to lock player movement
        //Clean up
        //add score to their account
        //prompt them to either play again, return to main menu, or continue to the next scene
        
    }

    update() {
        super.update();
        this.countdown.update();

        if(!this.gameActive || this.isPaused) {
            return;//Should probably lock player movement here
        }

        const speed = 300;

        // Handle player movement
        if (this.keys.left.isDown) {
            this.player.setVelocityX(-speed);
            //this.player.anims.play('left', true);
        } else if (this.keys.right.isDown) {
            this.player.setVelocityX(speed);
            //this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            //this.player.anims.play('idle', true);
        }
        //Jump
        if (this.keys.up.isDown) {
            this.player.setVelocityY(-speed);
        }

        //Handle the position of the held ingredient
        if(this.heldIngredient){
            this.heldIngredient.x = this.player.x;
            //this.heldIngredient.body.x = this.player.x;
            this.heldIngredient.y = this.player.y;
            //this.heldIngredient.body.y = this.player.y;
        }




    }

}