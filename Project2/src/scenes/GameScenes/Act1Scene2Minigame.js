import { BaseGameScene } from '../BaseGameScene.js';
import CountdownController from '../../CountdownController.js';

export class Act1Scene2Minigame extends BaseGameScene {
  constructor() {
    super('Act1Scene2Minigame');
    this.isMinigame = true; // Flag to indicate this is a minigame scene
    this.isCutscene = false;
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.timePerQuestion = 20000; // 20 seconds per question
    this.bonusTimeThreshold = 8000; // 8 seconds for bonus
    this.standardPoints = 20;
    this.bonusPoints = 10;
    this.penaltyPoints = -5;
    this.questionStartTime = 0;
    this.questionBank = []; // Initialize with empty array
  }

  preload() {
    // Load background and UI assets
    // this.load.svg('parchment_bg', 'assets/minigames/parchment_bg.svg', { width: 1200, height: 800 });
    this.load.json('MinigameQuestions', 'SceneDialogue/Act1Minigame.json');
    
    // Load sound effects
    // this.load.audio('correct_sound', 'assets/audio/correct.mp3');
    // this.load.audio('wrong_sound', 'assets/audio/wrong.mp3');
    // this.load.audio('timer_sound', 'assets/audio/tick.mp3');
    // this.load.audio('minigame_music', 'assets/audio/minigame_music.mp3');
    
    // Fallback handling for missing assets
    this.load.on('loaderror', (fileObj) => {
      console.warn(`Failed to load asset: ${fileObj.key}. Using fallback.`);
    });
  }

  create(data) {
    super.create(data);
    const { width, height } = this.scale;
    
    // Setup background
    this.createBackground(width, height);
    
    // Initialize the question bank
    this.initializeQuestions();
    
    // Create UI elements
    this.createUI(width, height);
    
    // Setup timer
    this.setupTimer(width, height);
    
    // Play background music
    this.playBackgroundMusic();
    
    // Make sure we have questions before trying to display
    if (this.questionBank && this.questionBank.length > 0) {
      // Start the first question
      this.displayQuestion(0);
    } else {
      console.error("Question bank is empty or undefined!");
      this.showErrorMessage(width, height);
    }
  }
  
  showErrorMessage(width, height) {
    // Display an error message if questions couldn't be loaded
    this.errorMessage = this.add.text(width / 2, height / 2, 
      "Error: Could not load questions.\nPlease try again later.", {
      fontFamily: 'Inknut Antiqua',
      fontSize: '28px',
      color: '#FF0000',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Create return button
    this.errorButton = this.add.rectangle(width / 2, height * 0.6, 200, 60, 0xF44336)
      .setStrokeStyle(2, 0xD32F2F)
      .setInteractive()
      .on('pointerdown', () => {
        this.endMinigame();
      });
    
    this.errorButtonText = this.add.text(width / 2, height * 0.6, "Return to Game", {
      fontFamily: 'Inknut Antiqua',
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
  }
  
  createBackground(width, height) {
    // Background color
    this.background = this.add.rectangle(0, 0, width, height, 0x2c3e50)
      .setOrigin(0, 0)
      .setDepth(-1);
      
    // Parchment texture if available
    if (this.textures.exists('parchment_bg')) {
      this.parchment = this.add.image(width / 2, height / 2, 'parchment_bg')
        .setDisplaySize(width * 0.8, height * 0.8)
        .setDepth(0);
    }
  }
  
  initializeQuestions() {
    // Fallback questions in case JSON fails to load
    const fallbackQuestions = [
      {
        original: "What bloody man is that? He can report, As seemeth by his plight, of the revolt The newest state.",
        answers: [
          { text: "Who's that bloody man? He can probably tell us the latest battle news.", correct: true },
          { text: "The man is covered in blood because of his crimes.", correct: false },
          { text: "We need more soldiers to join the revolt.", correct: false }
        ]
      },
      {
        original: "Doubtful it stood, As two spent swimmers that do cling together And choke their art. The merciless Macdonwald from the Western Isles Of kerns and gallowglasses is supplied.",
        answers: [
          { text: "The battle was uncertain, like two tired swimmers clinging to each other. The cruel Macdonwald had reinforcements from the Western Isles.", correct: true },
          { text: "The outcome was certain, and Macdonwald's forces easily defeated our soldiers from the Western Isles.", correct: false },
          { text: "The swimmers doubted their swimming abilities. Macdonwald showed mercy to his Western Isle soldiers.", correct: false }
        ]
      },
      {
        original: "No sooner justice had, with valor armed, compelled these skipping kerns to trust their heels, but the Norweyan lord, surveying vantage, with furbished arms and new supplies of men, began a fresh assault.",
        answers: [
          { text: "The Norwegian king fled with his soldiers when he saw our army approaching.", correct: false },
          { text: "Justice was served to the enemy soldiers who were caught running away.", correct: false },
          { text: "Just as we thought the battle was over, the Norwegian king launched a fresh assault.", correct: true }
        ]
      },
      {
        original: "From Fife, great king, Norway himself, with terrible numbers, assisted by that most disloyal traitor, The Thane of Cawdor, began a dismal conflict, till that Bellona's bridegroom, lapped in proof, confronted him, curbing his lavish spirit.",
        answers: [
          { text: "From Fife, we sent numerous soldiers to help Norway fight against traitors until the wedding celebration was disrupted.", correct: false },
          { text: "The King of Norway personally led a large army, helped by the traitorous Thane of Cawdor, until Macbeth confronted and defeated him.", correct: true },
          { text: "The battle was terrible because the Thane of Cawdor betrayed Norway's forces, and our general was unable to stop him.", correct: false }
        ]
      },
      {
        original: "No more that Thane of Cawdor shall deceive our bosom interest. Go, pronounce his present death, and with his former title greet Macbeth.",
        answers: [
          { text: "The Thane of Cawdor will no longer betray us. Execute him and give his title to Macbeth.", correct: true },
          { text: "The Thane of Cawdor must explain his actions before we punish him.", correct: false },
          { text: "Macbeth should personally execute the Thane of Cawdor for his betrayal.", correct: false }
        ]
      }
    ];
    
    try {
      // If we have JSON data, use it; otherwise, use hardcoded questions
      if (this.cache.json.exists('MinigameQuestions')) {
        console.log("Loading questions from JSON...");
        const jsonData = this.cache.json.get('MinigameQuestions');
        if (jsonData && jsonData.questions && Array.isArray(jsonData.questions) && jsonData.questions.length > 0) {
          this.questionBank = jsonData.questions;
          console.log(`Loaded ${this.questionBank.length} questions from JSON`);
        } else {
          console.warn("JSON loaded but questions data is invalid, using fallback");
          this.questionBank = fallbackQuestions;
        }
      } else {
        console.warn("MinigameQuestions JSON not found, using fallback");
        this.questionBank = fallbackQuestions;
      }
      
      // Always shuffle the questions for variety
      if (this.questionBank && this.questionBank.length > 0) {
        this.questionBank = Phaser.Utils.Array.Shuffle([...this.questionBank]);
      }
    } catch (error) {
      console.error("Error initializing questions:", error);
      this.questionBank = fallbackQuestions;
    }
  }
  
  createUI(width, height) {
    // Title
    this.title = this.add.text(width / 2, height * 0.1, "Battle Report Translator", {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#5D4037',
      align: 'center',
      stroke: '#3E2723',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Score display
    this.scoreText = this.add.text(width * 0.1, height * 0.05, "Score: 0", {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#5D4037'
    }).setOrigin(0, 0.5);
    
    // Instructions
    this.instructionsText = this.add.text(width / 2, height * 0.2, 
      "Match the original Shakespeare text with its modern translation.\n(5 questions total)", {
      fontFamily: 'Arial',
      fontSize: '000',
      color: '#5D4037',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);
    
    // Original text container
    this.originalTextBox = this.add.rectangle(width / 2, height * 0.35, width * 0.7, height * 0.15, 0xECEFF1, 0.8)
      .setStrokeStyle(2, 0x795548);
    
    this.originalText = this.add.text(width / 2, height * 0.35, "", {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#000000',
      align: 'center',
      wordWrap: { width: width * 0.65 }
    }).setOrigin(0.5);
    
    // Answer containers
    this.answerBoxes = [];
    this.answerTexts = [];
    
    const startY = height * 0.55;
    const spacing = height * 0.12;
    
    for (let i = 0; i < 3; i++) {
      const answerBox = this.add.rectangle(width / 2, startY + (i * spacing), width * 0.7, height * 0.09, 0xFFEBEE, 0.8)
        .setStrokeStyle(2, 0xD7CCC8)
        .setInteractive()
        .on('pointerover', () => {
          answerBox.setFillStyle(0xFFCDD2, 0.9);
        })
        .on('pointerout', () => {
          answerBox.setFillStyle(0xFFEBEE, 0.8);
        })
        .on('pointerdown', () => {
          this.checkAnswer(i);
        });
      
      const answerText = this.add.text(width / 2, startY + (i * spacing), "", {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#5D4037',
        align: 'center',
        wordWrap: { width: width * 0.65 }
      }).setOrigin(0.5);
      
      this.answerBoxes.push(answerBox);
      this.answerTexts.push(answerText);
      
      // Add A, B, C labels
      this.add.text(width * 0.2, startY + (i * spacing), String.fromCharCode(65 + i) + ")", {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#5D4037',
        align: 'center'
      }).setOrigin(0.5);
    }
    
    // Next button (hidden initially)
    this.nextButton = this.add.rectangle(width / 2, height * 0.9, 200, 60, 0x4CAF50)
      .setStrokeStyle(2, 0x388E3C)
      .setInteractive()
      .on('pointerover', () => {
        this.nextButton.setFillStyle(0x81C784);
      })
      .on('pointerout', () => {
        this.nextButton.setFillStyle(0x4CAF50);
      })
      .on('pointerdown', () => {
        this.nextQuestion();
      })
      .setVisible(false);
    
    this.nextButtonText = this.add.text(width / 2, height * 0.9, "Next Question", {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setVisible(false);
    
    // Exit button
    this.exitButton = this.add.rectangle(width * 0.9, height * 0.05, 120, 40, 0xF44336)
      .setStrokeStyle(2, 0xD32F2F)
      .setInteractive()
      .on('pointerover', () => {
        this.exitButton.setFillStyle(0xE57373);
      })
      .on('pointerout', () => {
        this.exitButton.setFillStyle(0xF44336);
      })
      .on('pointerdown', () => {
        this.endMinigame();
      });
    
    this.exitButtonText = this.add.text(width * 0.9, height * 0.05, "Exit", {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Results text (initially hidden)
    this.resultText = this.add.text(width / 2, height * 0.85, "", {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#4CAF50',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);
  }
  
  setupTimer(width, height) {
    // Timer bar background
    this.timerBg = this.add.rectangle(width / 2, height * 0.15, width * 0.3, 30, 0xE0E0E0)
      .setStrokeStyle(2, 0x9E9E9E);
    
    // Timer bar fill
    this.timerBar = this.add.rectangle(
      width / 2 - (width * 0.3 / 2), 
      height * 0.15, 
      width * 0.3, 
      30, 
      0x2196F3
    ).setOrigin(0, 0.5);
    
    // Timer text
    this.timerText = this.add.text(width / 2, height * 0.15, "20", {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Create countdown controller
    this.countdownController = new CountdownController(this, this.timerText);
  }
  
  playBackgroundMusic() {
    // Play background music if available
    if (this.audioController && this.cache.audio.exists('minigame_music')) {
      this.audioController.playMusic('minigame_music', this, { volume: 0.6, loop: true });
    }
  }
  
  displayQuestion(index) {
    if (!this.questionBank || !Array.isArray(this.questionBank)) {
      console.error("Question bank is not an array");
      return;
    }
    
    if (index >= this.questionBank.length) {
      this.gameOver();
      return;
    }
    
    // Reset UI elements
    this.resetUI();
    
    // Get current question
    const question = this.questionBank[this.currentQuestionIndex];
    
    if (!question) {
      console.error(`No question found at index ${index}`);
      return;
    }
    
    // Display the original text
    this.originalText.setText(question.original);
    
    // Shuffle answers
    const shuffledAnswers = Phaser.Utils.Array.Shuffle([...question.answers]);
    
    // Display answers
    shuffledAnswers.forEach((answer, i) => {
      this.answerTexts[i].setText(answer.text);
      // Store correct state on the text object for reference
      this.answerTexts[i].correct = answer.correct;
    });
    
    // Record start time for bonus calculation
    this.questionStartTime = new Date().getTime();
    
    // Start timer
    this.startTimer();
  }
  
  resetUI() {
    // Reset answer boxes
    this.answerBoxes.forEach(box => {
      box.setFillStyle(0xFFEBEE, 0.8);
      box.setStrokeStyle(2, 0xD7CCC8);
      box.setInteractive();
    });
    
    // Hide next button
    this.nextButton.setVisible(false);
    this.nextButtonText.setVisible(false);
    
    // Hide result text
    this.resultText.setVisible(false);
    
    // Reset timer visual
    this.timerBar.width = this.timerBg.width;
  }
  
  startTimer() {
    // Stop any existing timer
    if (this.countdownController) {
      this.countdownController.stop();
    }
    
    // Start countdown
    this.countdownController.start(() => {
      // Time's up!
      this.timeUp();
    }, this.timePerQuestion);
    
    // Start the timer bar animation
    this.tweens.add({
      targets: this.timerBar,
      width: 0,
      duration: this.timePerQuestion,
      ease: 'Linear'
    });
  }
  
  checkAnswer(index) {
    // Stop timer
    this.countdownController.stop();
    if (this.timerBar.tween) {
      this.timerBar.tween.stop();
    }
    
    // Calculate response time
    const responseTime = new Date().getTime() - this.questionStartTime;
    
    // Disable all answer boxes
    this.answerBoxes.forEach(box => box.disableInteractive());
    
    // Check if answer is correct
    const isCorrect = this.answerTexts[index].correct;
    
    if (isCorrect) {
      // Correct answer
      this.answerBoxes[index].setFillStyle(0xC8E6C9, 1);
      this.answerBoxes[index].setStrokeStyle(2, 0x4CAF50);
      
      // Calculate points
      let points = this.standardPoints;
      
      // Add bonus for fast answers
      if (responseTime < this.bonusTimeThreshold) {
        points += this.bonusPoints;
        this.resultText.setText(`Correct! +${points} points (Speed bonus!)`);
      } else {
        this.resultText.setText(`Correct! +${points} points`);
      }
      
      // Play sound
      if (this.sound.get('correct_sound')) {
        this.sound.play('correct_sound', { volume: 0.5 });
      }
      
      // Update score
      this.score += points;
      this.scoreText.setText(`Score: ${this.score}`);
    } else {
      // Wrong answer
      this.answerBoxes[index].setFillStyle(0xFFCDD2, 1);
      this.answerBoxes[index].setStrokeStyle(2, 0xF44336);
      
      // Highlight correct answer
      this.answerTexts.forEach((text, i) => {
        if (text.correct) {
          this.answerBoxes[i].setFillStyle(0xC8E6C9, 1);
          this.answerBoxes[i].setStrokeStyle(2, 0x4CAF50);
        }
      });
      
      // Apply penalty
      this.score += this.penaltyPoints;
      this.score = Math.max(0, this.score); // Prevent negative score
      this.scoreText.setText(`Score: ${this.score}`);
      
      // Play sound
      if (this.sound.get('wrong_sound')) {
        this.sound.play('wrong_sound', { volume: 0.5 });
      }
      
      this.resultText.setText(`Incorrect! ${this.penaltyPoints} points`);
    }
    
    // Show result text
    this.resultText.setColor(isCorrect ? '#4CAF50' : '#F44336');
    this.resultText.setVisible(true);
    
    // Show next button
    this.nextButton.setVisible(true);
    this.nextButtonText.setVisible(true);
  }
  
  timeUp() {
    // Disable all answer boxes
    this.answerBoxes.forEach(box => box.disableInteractive());
    
    // Highlight correct answer
    this.answerTexts.forEach((text, i) => {
      if (text.correct) {
        this.answerBoxes[i].setFillStyle(0xC8E6C9, 1);
        this.answerBoxes[i].setStrokeStyle(2, 0x4CAF50);
      }
    });
    
    // Show result text
    this.resultText.setText("Time's up!");
    this.resultText.setColor('#F44336');
    this.resultText.setVisible(true);
    
    // Play sound
    if (this.sound.get('wrong_sound')) {
      this.sound.play('wrong_sound', { volume: 0.5 });
    }
    
    // Show next button
    this.nextButton.setVisible(true);
    this.nextButtonText.setVisible(true);
  }
  
  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questionBank.length) {
      this.displayQuestion(this.currentQuestionIndex);
    } else {
      this.gameOver();
    }
  }
  
  gameOver() {
    // Stop any active timer
    if (this.countdownController) {
      this.countdownController.stop();
    }
    
    // Stop any running tweens
    this.tweens.killAll();
    
    // Clear the UI
    this.answerBoxes.forEach(box => box.setVisible(false));
    this.answerTexts.forEach(text => text.setVisible(false));
    this.originalTextBox.setVisible(false);
    this.originalText.setVisible(false);
    this.timerBg.setVisible(false);
    this.timerBar.setVisible(false);
    this.timerText.setVisible(false);
    this.nextButton.setVisible(false);
    this.nextButtonText.setVisible(false);
    
    // Display final score
    this.instructionsText.setText("Game Over!");
    this.resultText.setText(`Final Score: ${this.score}`);
    this.resultText.setColor('#5D4037');
    this.resultText.setVisible(true);
    
    // Create return to main scene button
    const { width, height } = this.scale;
    this.continueButton = this.add.rectangle(width / 2, height * 0.7, 240, 60, 0x4CAF50)
      .setStrokeStyle(2, 0x388E3C)
      .setInteractive()
      .on('pointerover', () => {
        this.continueButton.setFillStyle(0x81C784);
      })
      .on('pointerout', () => {
        this.continueButton.setFillStyle(0x4CAF50);
      })
      .on('pointerdown', () => {
        this.endMinigame();
      });
    
    this.continueButtonText = this.add.text(width / 2, height * 0.7, "Continue Adventure", {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Save score to player progress
    this.saveMinigameScore();
  }
  
  saveMinigameScore() {
    // Call saveGameData or update player state as appropriate
    this.saveProgress();
  }
  
  endMinigame() {
    // Return to main game - optionally pass score back
    this.switchScene('Act1Scene3Part1', { score: this.score });
  }
  
  update(time, delta) {
    if (this.isPaused) return;
    
    // Skip standard BaseGameScene update handling for player
    // Since we're a minigame without a player character
    
    // Update timer
    if (this.countdownController) {
      this.countdownController.update();
    }
    
    // Check for pause key 
    if (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
    }
  }
  
  repositionUI({ width, height }) {
    // Handle window resize
    if (this.background) {
      this.background.setSize(width, height);
    }
    
    if (this.parchment) {
      this.parchment.setPosition(width / 2, height / 2);
      this.parchment.setDisplaySize(width * 0.8, height * 0.8);
    }
    
    // Reposition UI elements
    if (this.title) {
      this.title.setPosition(width / 2, height * 0.1);
    }
    
    if (this.scoreText) {
      this.scoreText.setPosition(width * 0.1, height * 0.05);
    }
    
    if (this.instructionsText) {
      this.instructionsText.setPosition(width / 2, height * 0.2);
      this.instructionsText.setWordWrapWidth(width * 0.8);
    }
    
    if (this.originalTextBox) {
      this.originalTextBox.setPosition(width / 2, height * 0.35);
      this.originalTextBox.setSize(width * 0.7, height * 0.15);
    }
    
    if (this.originalText) {
      this.originalText.setPosition(width / 2, height * 0.35);
      this.originalText.setWordWrapWidth(width * 0.65);
    }
    
    // Reposition answer options
    const startY = height * 0.55;
    const spacing = height * 0.12;
    
    this.answerBoxes.forEach((box, i) => {
      box.setPosition(width / 2, startY + (i * spacing));
      box.setSize(width * 0.7, height * 0.09);
      
      if (this.answerTexts[i]) {
        this.answerTexts[i].setPosition(width / 2, startY + (i * spacing));
        this.answerTexts[i].setWordWrapWidth(width * 0.65);
      }
    });
    
    // Reposition timer
    if (this.timerBg) {
      this.timerBg.setPosition(width / 2, height * 0.15);
      this.timerBg.setSize(width * 0.3, 30);
    }
    
    if (this.timerBar) {
      // Preserve timer progress on resize
      const progress = this.timerBar.width / this.timerBar.displayWidth;
      this.timerBar.setPosition(width / 2 - (width * 0.3 / 2), height * 0.15);
      this.timerBar.setSize(width * 0.3 * progress, 30);
    }
    
    if (this.timerText) {
      this.timerText.setPosition(width / 2, height * 0.15);
    }
    
    // Reposition buttons
    if (this.nextButton) {
      this.nextButton.setPosition(width / 2, height * 0.9);
    }
    
    if (this.nextButtonText) {
      this.nextButtonText.setPosition(width / 2, height * 0.9);
    }
    
    if (this.exitButton) {
      this.exitButton.setPosition(width * 0.9, height * 0.05);
    }
    
    if (this.exitButtonText) {
      this.exitButtonText.setPosition(width * 0.9, height * 0.05);
    }
    
    if (this.resultText) {
      this.resultText.setPosition(width / 2, height * 0.85);
    }
    
    if (this.continueButton) {
      this.continueButton.setPosition(width / 2, height * 0.7);
    }
    
    if (this.continueButtonText) {
      this.continueButtonText.setPosition(width / 2, height * 0.7);
    }
    
    if (this.errorMessage) {
      this.errorMessage.setPosition(width / 2, height / 2);
    }
    
    if (this.errorButton) {
      this.errorButton.setPosition(width / 2, height * 0.6);
    }
    
    if (this.errorButtonText) {
      this.errorButtonText.setPosition(width / 2, height * 0.6);
    }
  }
}