import { BaseScene } from './BaseScene';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs, orderBy, limit } from "firebase/firestore";

// Initialize Firebase --- Is this the best way to do this?
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

let app;
if (!app) {
    app = initializeApp(firebaseConfig);
}
const db = getFirestore(app);

// Initialize the leaderboard data.
const leaderboardData = {};

// Query our Players collection for the top 10 scores.
try {
    const q = query(collection(db, "Players"), orderBy("SaveData.score",'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    const docSnapshots = querySnapshot.docs;

    // load the top players into the leaderboardData object
    for (var i in docSnapshots) {
        const doc = docSnapshots[i].data();
        console.log(doc);
        let player = { 
            Username: doc.Username,
            Score: doc.SaveData.score
        }
        leaderboardData[i] = player;
    }
} catch (error) {
    console.error("Error loading the :", error);
}

export class Leaderboard extends BaseScene {
    constructor() {
        super('Leaderboard');
    }

    create() {
        super.create();
        const { width, height } = this.scale;
        
        // Back button using the image-based implementation.
        this.backButton = this.add.image(width * 0.1, height * 0.1, 'backButton')
            .setInteractive();
        // Set initial scale using a larger factor.
        this.fitToScreen(this.backButton, 0.8);
        this.backButton.on('pointerdown', () => {
            this.switchScene('MainMenu');
        });

        // Title text.
        this.title = this.add.text(width / 2, height * 0.1, 'Leaderboard', {
            fontFamily: 'Canterbury',
            fontSize: `${Math.floor(height * 0.08)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        // If theres is no data in the leaderboard, display a message.
        if(Object.keys(leaderboardData).length === 0) {
            this.add.text(width / 2, height * 0.3, "Failed to load leaderboard...", {
                fontFamily: 'Inknut Antiqua',
                fontSize: `${Math.floor(height * 0.05)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);
             console.log("Leaderboard data is empty")
        }

        else {// Leaderboard entries.
            this.entries = Object.values(leaderboardData).map((player, index) => {
                return leaderboardEntry(index + 1, player.Username, player.Score, this, width/2, this.title.y + 30);
                // return this.add.text(width / 2, height * (0.3 + index * 0.1), `${index + 1}. ${player}`, {
                //     fontFamily: 'Inknut Antiqua',
                //     fontSize: `${Math.floor(height * 0.05)}px`,
                //     color: '#ffffff',
                //     stroke: '#000000',
                //     strokeThickness: 8,
                //     align: 'center'
                // }).setOrigin(0.5);
            });

            console.log("Leaderboard data populated")
        }

        // Register resize event.
        this.scale.on('resize', this.repositionUI, this);
    }

    repositionUI({ width, height }) {
        setTimeout(() => {
            super.repositionUI({ width, height });
            // Update title.
            if (this.title && this.title.active && this.title.context) {
                this.title.setPosition(width / 2, height * 0.15);
                try {
                    this.title.setFontSize(`${Math.floor(height * 0.08)}px`);
                } catch (error) {
                    console.error("Error updating title font size:", error);
                }
            }
            // Update back button.
            if (this.backButton && this.backButton.active) {
                this.backButton.setPosition(width * 0.1, height * 0.1);
                this.fitToScreen(this.backButton, 0.8);
            }
            // Update leaderboard entries.
            if (this.entries && Array.isArray(this.entries)) {
                this.entries.forEach((entry, index) => {
                    if (entry && entry.active && entry.context) {
                        entry.setPosition(width / 2, height * (0.3 + index * 0.1));
                        try {
                            entry.setFontSize(`${Math.floor(height * 0.05)}px`);
                        } catch (error) {
                            console.error(`Error updating font size for entry ${index}:`, error);
                        }
                    }
                });
            }
        }, 50);
    }
}

var leaderboardEntry = function (rank, username, score, scene, x, y) {
    const panelWidth = 500;
    const panelHeight = 50;
    // A fun idea might be to change the background color based on the rank.
    let backgroundColor;
    switch (rank) {
        case 1:
            backgroundColor = 0xC9B037; // Gold for 1st place
            break;
        case 2:
            backgroundColor = 0xB4B4B4; // Silver for 2nd place
            break;
        case 3:
            backgroundColor = 0xA0522D; // Bronze for 3rd place
            break;
        default:
            backgroundColor = 0x4e342e; // Default color for other ranks
            break;
    }
    var background = scene.rexUI.add.roundRectangle(0, 0, panelWidth, panelHeight, 20, backgroundColor);
    var rankText = scene.add.text(0, 0, `${rank}.`, { fontFamily: 'Inknut Antiqua', fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 2});
    var usernameText = scene.add.text(0, 0, username, { fontFamily: 'Inknut Antiqua', fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 2});
    var scoreText = scene.add.text(0, 0, score, { fontFamily: 'Inknut Antiqua', fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 2});
    var entry = scene.rexUI.add.sizer({
        orientation: 'y',
        x: x,
        y: y + panelHeight * (rank * 1.1),
        width: panelWidth,
        height: panelHeight, 
      })
      .addBackground(background)
      .add(rankText, 0, 'left', { top: 12, left: 20, }, false)
      .add(usernameText, 0, 'left', { top: -26, left: 50}, false)
      .add(scoreText, 0, 'right', { top: -26, right: 20}, false)
      .layout();

      return entry;
}