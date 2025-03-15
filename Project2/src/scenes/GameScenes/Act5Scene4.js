import { BaseGameScene } from '../BaseGameScene.js';

export class Act5Scene4 extends BaseGameScene {
    constructor() {
        super('Act5Scene4');

        this.isCutscene = false;
    }

    preload() {
        if (!this.textures.exists('background_act5scene4')) {
            this.load.svg('background_act5scene4', 'assets/act5/scene4.svg', { width: 2560, height: 1440 });
        }

        if (!this.cache.json.exists('Act5Scene4Data')) {
            this.load.json('Act5Scene4Data', 'SceneDialogue/Act5Scene4.json');
        }

        if (!this.textures.exists('soldier_idle_sheet')) {
            this.load.image('soldier_idle_sheet', 'assets/characters/SoldierIdle.png');
        }
        if (!this.cache.json.exists('soldier_idle_json')) {
            this.load.json('soldier_idle_json', 'assets/characters/SoldierIdle.json');
        }

        if (!this.textures.exists('soldier_run_sheet')) {
            this.load.image('soldier_run_sheet', 'assets/characters/SoldierRun.png');
        }
        if (!this.cache.json.exists('soldier_run_json')) {
            this.load.json('soldier_run_json', 'assets/characters/SoldierRun.json');
        }
        if (!this.textures.exists('young_siward')) {
            this.load.spritesheet('young_siward', 'assets/characters/YoungSiward.png', {
            frameWidth: 32, frameHeight: 48
            });
        }

        if (!this.textures.exists('malcolm')) {
            this.load.spritesheet('malcolm', 'assets/characters/Malcolm.png', {
            frameWidth: 32, frameHeight: 48
            });
        }

        if (!this.textures.exists('siward')) {
            this.load.spritesheet('siward', 'assets/characters/Siward.png', {
            frameWidth: 32, frameHeight: 48
            });
        }

        if (!this.textures.exists('macduff')) {
            this.load.spritesheet('macduff', 'assets/characters/Macduff.png', {
            frameWidth: 32, frameHeight: 48
            });
        }

        if (!this.textures.exists('menteith')) {
            this.load.spritesheet('menteith', 'assets/characters/Menteith.png', {
            frameWidth: 32, frameHeight: 48
            });
        }

        if (!this.textures.exists('caithness')) {
            this.load.spritesheet('caithness', 'assets/characters/Caithness.png', {
            frameWidth: 32, frameHeight: 48
            });
        }

        if (!this.textures.exists('young_siward_idle_sheet')) {
            this.load.image('young_siward_idle_sheet', 'assets/characters/YoungSiwardIdle.png');
        }
        if (!this.cache.json.exists('young_siward_idle_json')) {
            this.load.json('young_siward_idle_json', 'assets/characters/YoungSiwardIdle.json');
        }

        if (!this.textures.exists('malcolm_idle_sheet')) {
            this.load.image('malcolm_idle_sheet', 'assets/characters/MalcolmIdle.png');
        }
        if (!this.cache.json.exists('malcolm_idle_json')) {
            this.load.json('malcolm_idle_json', 'assets/characters/MalcolmIdle.json');
        }

        if (!this.textures.exists('siward_idle_sheet')) {
            this.load.image('siward_idle_sheet', 'assets/characters/SiwardIdle.png');
        }
        if (!this.cache.json.exists('siward_idle_json')) {
            this.load.json('siward_idle_json', 'assets/characters/SiwardIdle.json');
        }

        if (!this.textures.exists('macduff_idle_sheet')) {
            this.load.image('macduff_idle_sheet', 'assets/characters/MacduffIdle.png');
        }
        if (!this.cache.json.exists('macduff_idle_json')) {
            this.load.json('macduff_idle_json', 'assets/characters/MacduffIdle.json');
        }

        if (!this.textures.exists('monteith_idle_sheet')) {
            this.load.image('menteith_idle_sheet', 'assets/characters/MonteithIdle.png');
        }
        if (!this.cache.json.exists('monteith_idle_json')) {
            this.load.json('menteith_idle_json', 'assets/characters/MonteithIdle.json');
        }

        if (!this.textures.exists('caithness_idle_sheet')) {
            this.load.image('caithness_idle_sheet', 'assets/characters/CaithnessIdle.png');
        }
        if (!this.cache.json.exists('caithness_idle_json')) {
            this.load.json('caithness_idle_json', 'assets/characters/CaithnessIdle.json');
        }

        

        if (!this.textures.exists('guardImg')) {
            this.load.image('guardImg', 'assets/characters/Guard.png');
        }
        if (!this.cache.json.exists('guardData')) {
            this.load.json('guardData', 'assets/characters/guard.json');
        }

        if (!this.textures.exists('Soldier')) {
            this.load.image('Soldier', 'assets/portraits/Soldier.png');
        }
        if (!this.textures.exists('YoungSiward')) {
            this.load.image('YoungSiward', 'assets/portraits/YoungSiward.png');
        }

        if (!this.cache.audio.exists('act5scene4music')) {
            this.load.audio('act5scene4music', 'assets/audio/act5scene4.mp3');
        }

        this.load.on('loaderror', (fileObj) => {
            console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
        });
    }

    create(data) {
        super.create(data);
        const { width, height } = this.scale;
        this.nextSceneKey = 'Act5Scene5';
        this.dialogueStarted = false;
        this.dialogueFullyComplete = false;
        this.transitionActive = false;
        this.soliloquyStarted = false;

        const requiredAssets = ['background_act5scene4'];
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

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        if (this.textures.exists('background_act5scene4')) {
            this.background = this.add.image(0, 0, 'background_act5scene4')
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
        this.setupSoldierAtlas();
        this.setupYoungSiwardAtlas();
        this.setupMalcolmAtlas();
        this.setupSiwardAtlas();
        this.setupMacduffAtlas();
        this.setupMenteithAtlas();
        this.setupCaithnessAtlas();
        this.createAnimations();

        if (this.audioController && this.cache.audio.exists('act5scene4music')) {
            this.audioController.playMusic('act5scene4music', this, { volume: 1, loop: true });
        }

        if (!this.isCutscene) {
            this.setupPlayer();
        }

        this.setupNPCs();
        this.setupSceneDialogue();

        if (this.isCutscene && this.dialogueManager) {
            this.dialogueManager.startDialogue("Act5Scene4", () => {
                this.switchScene('Act5Scene5');
            });
        }

        this.scale.on('resize', this.onResize, this);

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

    setupSoldierAtlas() {
        if (this.textures.exists('soldier_idle_sheet') && this.cache.json.exists('soldier_idle_json')) {
            const idleJsonData = this.cache.json.get('soldier_idle_json');
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
                'soldier_idle_atlas',
                this.textures.get('soldier_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'soldier_idle',
                frames: idleJsonData.map(frame => ({ key: 'soldier_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }

        if (this.textures.exists('soldier_run_sheet') && this.cache.json.exists('soldier_run_json')) {
            const runJsonData = this.cache.json.get('soldier_run_json');
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
                'soldier_run_atlas',
                this.textures.get('soldier_run_sheet').getSourceImage(),
                runPhaserAtlas
            );
            this.anims.create({
                key: 'soldier_run',
                frames: runJsonData.map(frame => ({ key: 'soldier_run_atlas', frame: frame.name })),
                frameRate: 10,
                repeat: -1
            });
        }
    }

    setupYoungSiwardAtlas() {
        if (this.textures.exists('young_siward_idle_sheet') && this.cache.json.exists('young_siward_idle_json')) {
            const idleJsonData = this.cache.json.get('young_siward_idle_json');
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
                'young_siward_idle_atlas',
                this.textures.get('young_siward_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'young_siward_idle',
                frames: idleJsonData.map(frame => ({ key: 'young_siward_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    setupMalcolmAtlas() {
        if (this.textures.exists('malcolm_idle_sheet') && this.cache.json.exists('malcolm_idle_json')) {
            const idleJsonData = this.cache.json.get('malcolm_idle_json');
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
                'malcolm_idle_atlas',
                this.textures.get('malcolm_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'malcolm_idle',
                frames: idleJsonData.map(frame => ({ key: 'malcolm_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    setupSiwardAtlas() {
        if (this.textures.exists('siward_idle_sheet') && this.cache.json.exists('siward_idle_json')) {
            const idleJsonData = this.cache.json.get('siward_idle_json');
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
                'siward_idle_atlas',
                this.textures.get('siward_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'siward_idle',
                frames: idleJsonData.map(frame => ({ key: 'siward_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
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
    }

    setupMenteithAtlas() {
        if (this.textures.exists('menteith_idle_sheet') && this.cache.json.exists('menteith_idle_json')) {
            const idleJsonData = this.cache.json.get('menteith_idle_json');
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
                'menteith_idle_atlas',
                this.textures.get('menteith_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'menteith_idle',
                frames: idleJsonData.map(frame => ({ key: 'menteith_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    setupCaithnessAtlas() {
        if (this.textures.exists('caithness_idle_sheet') && this.cache.json.exists('caithness_idle_json')) {
            const idleJsonData = this.cache.json.get('caithness_idle_json');
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
                'caithness_idle_atlas',
                this.textures.get('caithness_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'caithness_idle',
                frames: idleJsonData.map(frame => ({ key: 'caithness_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    setupPlayer() {
        let texture = 'soldier_idle_atlas';
        let frame = 'sprite1';
        let animation = 'soldier_idle';

        if (!this.textures.exists('soldier_idle_atlas')) {
            texture = 'guard';
            frame = 'sprite1';
            animation = 'idle';
        }

        const playerConfig = {
            texture: texture,
            frame: frame,
            scale: 2.0,
            displayName: 'Soldier',
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
                key: "YoungSiward",
                x: width * 0.7,
                y: height * 0.85,
                texture: 'young_siward_idle_atlas',
                frame: 'sprite1',
                scale: 1.8,
                animationKey: 'young_siward_idle',
                displayName: 'Young Siward'
            },
            {
                key: "Malcolm",
                x: width * 0.6,
                y: height * 0.85,
                texture: 'malcolm_idle_atlas',
                frame: 'sprite1',
                scale: 1.8,
                animationKey: 'malcolm_idle',
                displayName: 'Malcolm'
            },
            {
                key: "Siward",
                x: width * 0.5,
                y: height * 0.85,
                texture: 'siward_idle_atlas',
                frame: 'sprite1',
                scale: 1.8,
                animationKey: 'siward_idle',
                displayName: 'Siward'
            },
            {
                key: "Macduff",
                x: width * 0.4,
                y: height * 0.85,
                texture: 'macduff_idle_atlas',
                frame: 'sprite1',
                scale: 1.8,
                animationKey: 'macduff_idle',
                displayName: 'Macduff'
            },
            {
                key: "Menteith",
                x: width * 0.3,
                y: height * 0.85,
                texture: 'menteith_idle_atlas',
                frame: 'sprite1',
                scale: 1.8,
                animationKey: 'menteith_idle',
                displayName: 'Menteith'
            },
            {
                key: "Caithness",
                x: width * 0.2,
                y: height * 0.85,
                texture: 'caithness_idle_atlas',
                frame: 'sprite1',
                scale: 1.8,
                animationKey: 'caithness_idle',
                displayName: 'Caithness'
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
        if (!this.cache.json.exists('Act5Scene4Data')) {
            console.error("Act5Scene4Data JSON not found");
            return;
        }

        try {
            const dialogueData = this.cache.json.get('Act5Scene4Data');
            const portraitMap = {
                "Soldier": "Soldier",
                "YoungSiward": "YoungSiward",
                "Malcolm": "Malcolm",
                "Siward": "Siward",
                "Macduff": "Macduff",
                "Menteith": "Menteith",
                "Caithness": "Caithness"
            };

            this.setupDialogue(dialogueData, portraitMap, "Soldier");

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
                if (npcKey === "YoungSiward" || npcKey === "Malcolm" || npcKey === "Siward" || npcKey === "Macduff" || npcKey === "Menteith" || npcKey === "Caithness") {
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
                this.player.anims.play('soldier_run', true);
                this.player.flipX = true;
            } else if (this.keys.right.isDown) {
                this.player.setVelocityX(speed);
                this.player.anims.play('soldier_run', true);
                this.player.flipX = false;
            } else {
                this.player.setVelocityX(0);
                this.player.anims.play('soldier_idle', true);
            }

            if (!this.soliloquyStarted) {
                this.soliloquyStarted = true;
                this.time.delayedCall(1000, () => {
                    this.startDialogue("Soldier");
                });
            }

            const npcsToCheck = ["Malcolm", "Siward", "YoungSiward", "Macduff", "Menteith", "Caithness"];
            npcsToCheck.forEach(npcKey => {
                if (this.npcs[npcKey] && !this.dialogueStarted) {
                    const distToNPC = Phaser.Math.Distance.Between(
                        this.player.x, this.player.y,
                        this.npcs[npcKey].x, this.npcs[npcKey].y
                    );
                    if (distToNPC < 120) {
                        this.dialogueStarted = true;
                        this.startDialogue(npcKey);
                    }
                }
            });

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
        if (!this.scene.isActive('Act5Scene4')) return;

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
        if (this.npcs["YoungSiward"]) {
            this.npcs["YoungSiward"].setPosition(width * 0.7, height * 0.85);
        }
        if (this.npcs["Malcolm"]) {
            this.npcs["Malcolm"].setPosition(width * 0.6, height * 0.85);
        }
        if (this.npcs["Siward"]) {
            this.npcs["Siward"].setPosition(width * 0.5, height * 0.85);
        }
        if (this.npcs["Macduff"]) {
            this.npcs["Macduff"].setPosition(width * 0.4, height * 0.85);
        }
        if (this.npcs["Menteith"]) {
            this.npcs["Menteith"].setPosition(width * 0.3, height * 0.85);
        }
        if (this.npcs["Caithness"]) {
            this.npcs["Caithness"].setPosition(width * 0.2, height * 0.85);
        }
        if (this.exitHint) {
            this.exitHint.setPosition(width - 50, height / 2);
        }
    }
}
