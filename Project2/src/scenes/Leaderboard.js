import { BaseScene } from './BaseScene';
import { fetchLeaderboardData } from "../../firebase/firebase.js"
import { getFirestore, collection, query, getDocs, orderBy, limit } from "firebase/firestore";

export class Leaderboard extends BaseScene {
  constructor() {
    super('Leaderboard');
  }

  async create() {
    super.create();
    const { width, height } = this.scale;

    this.backButton = this.add.image(width * 0.1, height * 0.1, 'backButton').setInteractive();
    this.fitToScreen(this.backButton, 0.8);
    this.backButton.on('pointerdown', () => this.switchScene('MainMenu'));

    this.title = this.add.text(width / 2, height * 0.1, 'Leaderboard', {
      fontFamily: 'Canterbury',
      fontSize: `${Math.floor(height * 0.08)}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);
    
    try {
      console.log("Fetching leaderboard data");
      const leaderboardData = await fetchLeaderboardData();
      console.log("Leaderboard data fetched");
      if (Object.keys(leaderboardData).length === 0) {
        this.add.text(width / 2, height * 0.3, "No leaderboard data available", {
          fontFamily: 'Inknut Antiqua',
          fontSize: `${Math.floor(height * 0.05)}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 8,
          align: 'center'
        }).setOrigin(0.5);
      } else {
        this.entries = Object.values(leaderboardData).map((player, index) =>
          leaderboardEntry(index + 1, player.Username, player.Score, this, width / 2, this.title.y + 30)
        );
      }
    } catch {
      this.add.text(width / 2, height * 0.3, "Error loading leaderboard", {
        fontFamily: 'Inknut Antiqua',
        fontSize: `${Math.floor(height * 0.05)}px`,
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
      }).setOrigin(0.5);
    }

    this.scale.on('resize', this.repositionUI, this);
  }


  repositionUI({ width, height }) {
    setTimeout(() => {
      if (this.title?.active) {
        this.title.setPosition(width / 2, height * 0.15);
        this.title.setFontSize(`${Math.floor(height * 0.08)}px`);
      }
      if (this.backButton?.active) {
        this.backButton.setPosition(width * 0.1, height * 0.1);
        this.fitToScreen(this.backButton, 0.8);
      }
      if (this.entries?.length) {
        this.entries.forEach((entry, index) => {
          if (entry?.active) {
            entry.setPosition(width / 2, height * (0.3 + index * 0.1));
          }
        });
      }
    }, 50);
  }
}

function leaderboardEntry(rank, username, score, scene, x, y) {
  const panelWidth = 500;
  const panelHeight = 50;
  let backgroundColor =
    rank === 1 ? 0xC9B037 :
    rank === 2 ? 0xB4B4B4 :
    rank === 3 ? 0xA0522D :
    0x4e342e;

  const background = scene.rexUI.add.roundRectangle(0, 0, panelWidth, panelHeight, 20, backgroundColor);
  const rankText = scene.add.text(0, 0, `${rank}.`, {
    fontFamily: 'Inknut Antiqua',
    fontSize: '24px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2
  });
  const usernameText = scene.add.text(0, 0, username, {
    fontFamily: 'Inknut Antiqua',
    fontSize: '24px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2
  });
  const scoreText = scene.add.text(0, 0, score, {
    fontFamily: 'Inknut Antiqua',
    fontSize: '24px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2
  });

  return scene.rexUI.add.sizer({
    orientation: 'y',
    x,
    y: y + panelHeight * (rank * 1.1),
    width: panelWidth,
    height: panelHeight
  })
    .addBackground(background)
    .add(rankText, 0, 'left', { top: 12, left: 20 }, false)
    .add(usernameText, 0, 'left', { top: -26, left: 50 }, false)
    .add(scoreText, 0, 'right', { top: -26, right: 20 }, false)
    .layout();
}
