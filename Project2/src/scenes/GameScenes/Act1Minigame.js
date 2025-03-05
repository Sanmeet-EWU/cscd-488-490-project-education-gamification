import { BaseGameScene } from '../BaseGameScene.js';
import CountdownController from '../../CountdownController.js';
import { DialogueManager } from '../../DialogueManager.js';
import { QuestionDisplayer } from '../../QuestionDisplayer.js';
import { count } from 'firebase/firestore';

export class Act1Minigame extends BaseGameScene {
    
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

    player;

    questionDisplay;

    questionSet = [];

    constructor() {
        super('Act1Minigame');
        this.isCutscene = true;
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

        this.physics.world.setBounds(0, 0, width, height * .8);//Im setting the Y higher up to act as the floor
        this.physics.world.gravity.y = 300;

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
        this.cauldron = this.add.rectangle(this.scale.width * 0.5, this.scale.height * 0.6, 60, 60, 0xFF0000);
        this.cauldron = this.physics.add.staticGroup();

        //Set up the overlap collision between the player and the cauldron
        this.physics.add.overlap(this.player.body, this.cauldron.body, this.handleCauldronOverlap.bind(this), null, this);

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
        console.log(this.questionSet);
        if(this.questionSet.length > 0) {
            console.log('There are questions left');
            let randomIndex = Math.floor(Math.random() * this.questionSet.length);
            let question = this.questionSet.splice(randomIndex, 1)[0];
                console.log('Question: ' + question.question);
                console.log('Answer1: ' + question.answers[0]);
                console.log('Answer2: ' + question.answers[1]);
                console.log('Answer3: ' + question.answers[2]);
                console.log('Answer4: ' + question.answers[3]);
                console.log('Correct Answer: ' + question.correct);
            //display the question
            console.log(this.questionSet);

            this.spawnIngredients();
            

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
    spawnIngredients() {

        //need to destroy old ingredients

        //then spawn in new ingredients
        this.ingredients = {//These will be randomized each time
            ingredient1: this.add.rectangle(this.scale.width  * 0.1, this.scale.height * 0.8, 32, 48, 0xFFFF00).setDepth(2),
            ingredient2: this.add.rectangle(this.scale.width  * 0.3, this.scale.height * 0.8, 32, 48, 0xFF00FF).setDepth(2),
            ingredient3: this.add.rectangle(this.scale.width  * 0.7, this.scale.height * 0.8, 32, 48, 0x00FFFF).setDepth(2),
            ingredient4: this.add.rectangle(this.scale.width  * 0.9, this.scale.height * 0.8, 32, 48, 0x00FF00).setDepth(2)
        }

        //Need to set overlap collision between the player and each ingredient as well
        
    }

    handleCauldronOverlap() {
        console.log("overlap");

        //Need to check if the player is holding an ingredient


        //Need to check if the player has the correct ingredient and answer
            //If so, add to the score, time, and multiplier
            //Then load the next question, respawn new ingredients
            //Set the held ingredient to null
            //Play a correct sound effect and use the green gas for animation

            //Else the player loses time, and the multiplier is reset
            //Set the held ingredient to null
            //Play an incorrect sound effect and use the red gas for animation
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


        if(this.keys.interact.isDown) {//pickup the ingredient
            console.log("interact");
        }

    }

}


