import { BaseGameScene } from '../BaseGameScene.js';

export class Act5Scene8Part1 extends BaseGameScene {
    constructor() {
        // REPLACE: 'TEMPLATESCENE' with your actual scene key (e.g., 'Act2Scene1')
        super('Act5Scene8Part1');

        // Set to true if this is a cutscene without player movement
        this.isCutscene = false;
    }

    preload() {
        // REPLACE: Load your scene specific assets

        // Background
        if (!this.textures.exists('background_act5scene8part1')) {
            this.load.svg('background_act5scene8part1', 'assets/act5/scene8part1.svg', { width: 2560, height: 1440 });
        }

        // Dialogue JSON
        if (!this.cache.json.exists('Act5Scene8Part1Data')) {
            this.load.json('Act5Scene8Part1Data', 'SceneDialogue/Act5Scene8Part1.json');
        }

        // Load Macduff's idle animation
        if (!this.textures.exists('macduff_idle_sheet')) {
            this.load.image('macduff_idle_sheet', 'assets/characters/MacduffIdle.png');
        }
        if (!this.cache.json.exists('macduff_idle_json')) {
            this.load.json('macduff_idle_json', 'assets/characters/MacduffIdle.json');
        }

        // Load Macduff's run animation
        if (!this.textures.exists('macduff_run_sheet')) {
            this.load.image('macduff_run_sheet', 'assets/characters/MacduffRun.png');
        }
        if (!this.cache.json.exists('macduff_run_json')) {
            this.load.json('macduff_run_json', 'assets/characters/MacduffRun.json');
        }
        if (!this.textures.exists('macbeth')) {
            this.load.spritesheet('macbeth', 'assets/characters/Macbeth.png', {
                frameWidth: 32, frameHeight: 48
            });
        }

        // Load Macbeth's idle animation
        if (!this.textures.exists('macbeth_idle_sheet')) {
            this.load.image('macbeth_idle_sheet', 'assets/characters/MacbethIdle.png');
        }
        if (!this.cache.json.exists('macbeth_idle_json')) {
            this.load.json('macbeth_idle_json', 'assets/characters/MacbethIdle.json');
        }

        // Load guard sprite for fallback
        if (!this.textures.exists('guardImg')) {
            this.load.image('guardImg', 'assets/characters/Guard.png');
        }
        if (!this.cache.json.exists('guardData')) {
            this.load.json('guardData', 'assets/characters/guard.json');
        }

        // Character portraits
        if (!this.textures.exists('Macduff')) {
            this.load.image('Macduff', 'assets/portraits/Macduff.png');
        }
        if (!this.textures.exists('Macbeth')) {
            this.load.image('Macbeth', 'assets/portraits/Macbeth.png');
        }

        // Scene music
        if (!this.cache.audio.exists('act5scene8part1music')) {
            this.load.audio('act5scene8part1music', 'assets/audio/act5scene8part1.mp3');
        }

        // Error handling for asset loading
        this.load.on('loaderror', (fileObj) => {
            console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
        });
    }

    create(data) {
        // Call parent create method
        super.create(data);
        const { width, height } = this.scale;
        this.nextSceneKey = 'Act5Scene8Part2';
        this.dialogueStarted = false;
        this.dialogueFullyComplete = false;
        this.transitionActive = false;
        this.soliloquyStarted = false;

        // Check required assets
        const requiredAssets = ['background_act5scene8part1'];
        const missing = this.checkRequiredAssets(requiredAssets);
        if (missing.length > 0) {
            this.add.text(width / 2, height / 2, "Error: Missing assets\n" + missing.join(', '), {
                fontSize: '32px',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);
            return;
        }

        // Fade in scene
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        if (this.textures.exists('background_act5scene8part1')) {
            this.background = this.add.image(0, 0, 'background_act5scene8part1')
                .setOrigin(0, 0)
                .setDisplaySize(width, height)
                .setDepth(-1);
        } else {
            this.background = this.add.rectangle(0, 0, width, height, 0x210e04)
                .setOrigin(0, 0)
                .setDepth(-1);
        }

        this.createFloor();
        this.setupGuardAtlas();
        this.setupMacduffAtlas();
        this.setupMacbethAtlas();
        this.createAnimations();

        // Play scene music
        if (this.audioController && this.cache.audio.exists('act5scene8part1music')) {
            this.audioController.playMusic('act5scene8part1music', this, { volume: 1, loop: true });
        }

        // Create player if not a cutscene
        if (!this.isCutscene) {
            this.setupPlayer();
        }

        // Create NPCs
        this.setupNPCs();

        // Setup dialogue
        this.setupSceneDialogue();

        // Start dialogue for cutscenes
        if (this.isCutscene && this.dialogueManager) {
            // For cutscenes, automatically start dialogue
            this.dialogueManager.startDialogue("Act5Scene8Part1", () => {
                // Replace 'NextSceneName' with your next scene
                this.switchScene('Act5Scene8Part2');
            });
        }

        // Handle scene resize
        this.scale.on('resize', this.onResize, this);

        // Cleanup on shutdown
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.onResize, this);
        });
    }

    setupGuardAtlas() {
        const guardData = this.cache.json.get('guardData');
        if (guardData) {
            const phaserAtlas = { frames: {} };
            guardData.forEach(frame => {
                phaserAtlas.frames[frame.name] = {
                    frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
                    rotated: false,
                    trimmed: false,
                    sourceSize: { w: frame.width, h: frame.height },
                    spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height }
                };
            });
            this.textures.addAtlas('guard', this.textures.get('guardImg').getSourceImage(), phaserAtlas);
        }
    }

    setupMacduffAtlas() {
        if (this.textures.exists('macduff_idle_sheet') && this.cache.json.exists('macduff_idle_json')) {
            const idleJsonData = this.cache.json.get('macduff_idle_json');
            const idlePhaserAtlas = { frames: {} };
            idleJsonData.forEach(frame => {
                idlePhaserAtlas.frames[frame.name] = {
                    frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
                    rotated: false,
                    trimmed: false,
                    sourceSize: { w: frame.width, h: frame.height },
                    spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height }
                };
            });
            this.textures.addAtlas(
                'macduff_idle_atlas',
                this.textures.get('macduff_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'macduff_idle',
                frames: idleJsonData.map(frame => ({ key: 'macduff_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }

        if (this.textures.exists('macduff_run_sheet') && this.cache.json.exists('macduff_run_json')) {
            const runJsonData = this.cache.json.get('macduff_run_json');
            const runPhaserAtlas = { frames: {} };
            runJsonData.forEach(frame => {
                runPhaserAtlas.frames[frame.name] = {
                    frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
                    rotated: false,
                    trimmed: false,
                    sourceSize: { w: frame.width, h: frame.height },
                    spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height }
                };
            });
            this.textures.addAtlas(
                'macduff_run_atlas',
                this.textures.get('macduff_run_sheet').getSourceImage(),
                runPhaserAtlas
            );
            this.anims.create({
                key: 'macduff_run',
                frames: runJsonData.map(frame => ({ key: 'macduff_run_atlas', frame: frame.name })),
                frameRate: 10,
                repeat: -1
            });
        }
    }

    setupMacbethAtlas() {
        if (this.textures.exists('macbeth_idle_sheet') && this.cache.json.exists('macbeth_idle_json')) {
            const idleJsonData = this.cache.json.get('macbeth_idle_json');
            const idlePhaserAtlas = { frames: {} };
            idleJsonData.forEach(frame => {
                idlePhaserAtlas.frames[frame.name] = {
                    frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
                    rotated: false,
                    trimmed: false,
                    sourceSize: { w: frame.width, h: frame.height },
                    spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height }
                };
            });
            this.textures.addAtlas(
                'macbeth_idle_atlas',
                this.textures.get('macbeth_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'macbeth_idle',
                frames: idleJsonData.map(frame => ({ key: 'macbeth_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    setupPlayer() {
        let texture = 'macduff_idle_atlas';
        let frame = 'sprite1';
        let animation = 'macduff_idle';

        if (!this.textures.exists('macduff_idle_atlas')) {
            texture = 'guard';
            frame = 'sprite1';
            animation = 'idle';
        }

        const playerConfig = {
            texture: texture,
            frame: frame,
            scale: 2.0,
            displayName: 'Macduff',
            animation: animation,
            movementConstraint: 'horizontal'
        };

        this.player = this.createPlayer(playerConfig);

        if (this.player) {
            const { width, height } = this.scale;
            this.player.setPosition(width * 0.3, height * 0.85);
            this.player.body.setGravityY(0);
            if (this.floor) {
                this.physics.add.collider(this.player, this.floor);
            }
            this.player.body.setSize(this.player.width, this.player.height);
            this.player.body.setOffset(0, this.player.height / 2);
        }
    }

    setupNPCs() {
        const { width, height } = this.scale;

        const npcConfigs = [
            {
                key: "Macbeth",
                x: width * 0.7,
                y: height * 0.85,
                texture: 'macbeth_idle_atlas',
                frame: 'sprite1',
                scale: 1.8,
                animationKey: 'macbeth_idle',
                displayName: 'Macbeth'
            }
        ];

        this.createNPCs(npcConfigs);

        if (this.floor) {
            Object.keys(this.npcs).forEach(key => {
                if (!key.endsWith('Tag') && this.npcs[key]) {
                    this.physics.add.collider(this.npcs[key], this.floor);
                }
            });
        }
    }

    setupSceneDialogue() {
        if (!this.cache.json.exists('Act5Scene8Part1Data')) {
            console.error("Act5Scene8Part1Data JSON not found");
            return;
        }

        try {
            const dialogueData = this.cache.json.get('Act5Scene8Part1Data');
            const portraitMap = {
                "Macduff": "Macduff",
                "Macbeth": "Macbeth"
            };

            this.setupDialogue(dialogueData, portraitMap, "Macduff");

            setTimeout(() => {
                Object.keys(this.npcs).forEach(key => {
                    if (!key.endsWith('Tag')) {
                        this.dialogueManager?.registerNPC(key, this.npcs[key], this.npcs[key + "Tag"]);
                    }
                });
            }, 100);
        } catch (error) {
            console.error("Error setting up dialogue:", error);
        }
    }

    createAnimations() {
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'guard', frame: 'sprite1' }],
                frameRate: 10
            });
        }

        if (!this.anims.exists('left')) {
            this.anims.create({
                key: 'left',
                frames: [
                    { key: 'guard', frame: 'sprite4' },
                    { key: 'guard', frame: 'sprite5' },
                    { key: 'guard', frame: 'sprite6' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('right')) {
            this.anims.create({
                key: 'right',
                frames: [
                    { key: 'guard', frame: 'sprite7' },
                    { key: 'guard', frame: 'sprite8' },
                    { key: 'guard', frame: 'sprite9' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }
    }

    createFloor() {
        const { width, height } = this.scale;
        const groundY = height * 0.9;
        this.floor = this.physics.add.staticGroup();
        const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
        this.floor.add(ground);
        ground.setVisible(false);
    }

    showExitHint() {
        if (!this.exitHint && this.nextSceneKey) {
            const { width, height } = this.scale;
            this.exitHint = this.add.text(
                width - 50,
                height / 2,
                "→",
                { fontSize: '32px', fill: '#ffff00', stroke: '#000000', strokeThickness: 4 }
            ).setOrigin(0.5).setDepth(100);

            this.tweens.add({
                targets: this.exitHint,
                alpha: 0.6,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }
    }

    startDialogue(npcKey) {
        if (this.dialogueManager && !this.dialogueManager.isActive) {
            if (this.player?.body) {
                this.player.body.setVelocity(0, 0);
            }

            this.dialogueManager.startDialogue(npcKey, () => {
                console.log(`Dialogue with ${npcKey} completed`);
                if (npcKey === "Macbeth") {
                    this.dialogueFullyComplete = true;
                    this.showExitHint();
                }
            });
        }
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isPaused || this.dialogueManager?.isActive) return;

        if (this.player) {
            const speed = 160;

            if (this.keys.left.isDown) {
                this.player.setVelocityX(-speed);
                this.player.anims.play('macduff_run', true);
                this.player.flipX = true;
            } else if (this.keys.right.isDown) {
                this.player.setVelocityX(speed);
                this.player.anims.play('macduff_run', true);
                this.player.flipX = false;
            } else {
                this.player.setVelocityX(0);
                this.player.anims.play('macduff_idle', true);
            }

            if (!this.soliloquyStarted) {
                this.soliloquyStarted = true;
                this.time.delayedCall(1000, () => {
                    this.startDialogue("Macduff");
                });
            }

            if (this.npcs["Macbeth"] && !this.dialogueStarted) {
                const distToMacbeth = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    this.npcs["Macbeth"].x, this.npcs["Macbeth"].y
                );
                if (distToMacbeth < 120) {
                    this.dialogueStarted = true;
                    this.startDialogue("Macbeth");
                }
            }

            if (this.dialogueFullyComplete && this.nextSceneKey) {
                const { width } = this.scale;
                if (this.player.x > width - 50 && !this.transitionActive) {
                    this.transitionActive = true;
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start(this.nextSceneKey);
                    });
                }
            }
        }
    }

    onResize(gameSize) {
        if (!this.scene.isActive('Act5Scene8Part1')) return;

        const { width, height } = gameSize;

        if (this.background?.active) {
            if (this.background.type === 'Image') {
                this.background.setDisplaySize(width, height);
            } else {
                this.background.width = width;
                this.background.height = height;
            }
        }

        if (this.floor?.clear) {
            this.floor.clear();
            const groundY = height * 0.9;
            const ground = this.add.rectangle(width / 2, groundY, width, 20, 0x555555);
            this.floor.add(ground);
            ground.setVisible(false);
        }

        if (this.player) {
            this.player.setPosition(width * 0.3, height * 0.85);
        }
        if (this.npcs["Macbeth"]) {
            this.npcs["Macbeth"].setPosition(width * 0.7, height * 0.85);
        }
        if (this.exitHint) {
            this.exitHint.setPosition(width - 50, height / 2);
        }
    }
}