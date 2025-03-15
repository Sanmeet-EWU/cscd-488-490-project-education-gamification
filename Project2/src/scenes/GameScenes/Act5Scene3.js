import { BaseGameScene } from '../BaseGameScene.js';

export class Act5Scene3 extends BaseGameScene {
    constructor() {
        super('Act5Scene3');

        this.isCutscene = false;
    }

    preload() {
        if (!this.textures.exists('background_act5scene3')) {
            this.load.svg('background_act5scene3', 'assets/act5/scene3.svg', { width: 2560, height: 1440 });
        }

        if (!this.cache.json.exists('Act5Scene3Data')) {
            this.load.json('Act5Scene3Data', 'SceneDialogue/Act5Scene3.json');
        }

        if (!this.textures.exists('macbeth_idle_sheet')) {
            this.load.image('macbeth_idle_sheet', 'assets/characters/MacbethIdle.png');
        }
        if (!this.cache.json.exists('macbeth_idle_json')) {
            this.load.json('macbeth_idle_json', 'assets/characters/MacbethIdle.json');
        }

        if (!this.textures.exists('macbeth_run_sheet')) {
            this.load.image('macbeth_run_sheet', 'assets/characters/MacbethRun.png');
        }
        if (!this.cache.json.exists('macbeth_run_json')) {
            this.load.json('macbeth_run_json', 'assets/characters/MacbethRun.json');
        }
        if (!this.textures.exists('doctor')) {
            this.load.spritesheet('doctor', 'assets/characters/Doctor.png', {
            frameWidth: 32, frameHeight: 48
            });
        }

        if (!this.textures.exists('doctor_idle_sheet')) {
            this.load.image('doctor_idle_sheet', 'assets/characters/DoctorIdle.png');
        }
        if (!this.cache.json.exists('doctor_idle_json')) {
            this.load.json('doctor_idle_json', 'assets/characters/DoctorIdle.json');
        }

        if (!this.textures.exists('attendant')) {
            this.load.spritesheet('attendant', 'assets/characters/Attendant.png', {
            frameWidth: 32, frameHeight: 48
            });
        }

        if (!this.textures.exists('attendant_idle_sheet')) {
            this.load.image('attendant_idle_sheet', 'assets/characters/AttendantIdle.png');
        }
        if (!this.cache.json.exists('attendant_idle_json')) {
            this.load.json('attendant_idle_json', 'assets/characters/AttendantIdle.json');
        }

        if (!this.textures.exists('guardImg')) {
            this.load.image('guardImg', 'assets/characters/Guard.png');
        }
        if (!this.cache.json.exists('guardData')) {
            this.load.json('guardData', 'assets/characters/guard.json');
        }

        if (!this.textures.exists('Macbeth')) {
            this.load.image('Macbeth', 'assets/portraits/Macbeth.png');
        }
        if (!this.textures.exists('Doctor')) {
            this.load.image('Doctor', 'assets/portraits/Doctor.png');
        }

        if (!this.textures.exists('Attendant')) {
            this.load.image('Attendant', 'assets/portraits/Attendant.png');
        }

        if (!this.cache.audio.exists('act5scene3music')) {
            this.load.audio('act5scene3music', 'assets/audio/act5scene3.mp3');
        }

        this.load.on('loaderror', (fileObj) => {
            console.error(`Failed to load asset: ${fileObj.key} (${fileObj.url})`);
        });
    }

    create(data) {
        super.create(data);
        const { width, height } = this.scale;
        this.nextSceneKey = 'Act5Scene4';
        this.dialogueStarted = false;
        this.dialogueFullyComplete = false;
        this.transitionActive = false;
        this.soliloquyStarted = false;

        const requiredAssets = ['background_act5scene3'];
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

        if (this.textures.exists('background_act5scene3')) {
            this.background = this.add.image(0, 0, 'background_act5scene3')
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
        this.setupMacbethAtlas();
        this.setupDoctorAtlas();
        this.setupAttendantAtlas();
        this.createAnimations();

        if (this.audioController && this.cache.audio.exists('act5scene3music')) {
            this.audioController.playMusic('act5scene3music', this, { volume: 1, loop: true });
        }

        if (!this.isCutscene) {
            this.setupPlayer();
        }

        this.setupNPCs();
        this.setupSceneDialogue();

        if (this.isCutscene && this.dialogueManager) {
            this.dialogueManager.startDialogue("Act5Scene3", () => {
                this.switchScene('Act5Scene4');
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

        if (this.textures.exists('macbeth_run_sheet') && this.cache.json.exists('macbeth_run_json')) {
            const runJsonData = this.cache.json.get('macbeth_run_json');
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
                'macbeth_run_atlas',
                this.textures.get('macbeth_run_sheet').getSourceImage(),
                runPhaserAtlas
            );
            this.anims.create({
                key: 'macbeth_run',
                frames: runJsonData.map(frame => ({ key: 'macbeth_run_atlas', frame: frame.name })),
                frameRate: 10,
                repeat: -1
            });
        }
    }

    setupDoctorAtlas() {
        if (this.textures.exists('doctor_idle_sheet') && this.cache.json.exists('doctor_idle_json')) {
            const idleJsonData = this.cache.json.get('doctor_idle_json');
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
                'doctor_idle_atlas',
                this.textures.get('doctor_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'doctor_idle',
                frames: idleJsonData.map(frame => ({ key: 'doctor_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    setupAttendantAtlas() {
        if (this.textures.exists('attendant_idle_sheet') && this.cache.json.exists('attendant_idle_json')) {
            const idleJsonData = this.cache.json.get('attendant_idle_json');
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
                'attendant_idle_atlas',
                this.textures.get('attendant_idle_sheet').getSourceImage(),
                idlePhaserAtlas
            );
            this.anims.create({
                key: 'attendant_idle',
                frames: idleJsonData.map(frame => ({ key: 'attendant_idle_atlas', frame: frame.name })),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    setupPlayer() {
        let texture = 'macbeth_idle_atlas';
        let frame = 'sprite1';
        let animation = 'macbeth_idle';

        if (!this.textures.exists('macbeth_idle_atlas')) {
            texture = 'guard';
            frame = 'sprite1';
            animation = 'idle';
        }

        const playerConfig = {
            texture: texture,
            frame: frame,
            scale: 2.0,
            displayName: 'Macbeth',
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
            key: "Doctor",
            x: width * 0.7,
            y: height * 0.85,
            texture: 'doctor_idle_atlas',
            frame: 'sprite1',
            scale: 1.8,
            animationKey: 'doctor_idle',
            displayName: 'Doctor'
            },
            {
            key: "Attendant",
            x: width * 0.5,
            y: height * 0.85,
            texture: 'attendant_idle_atlas',
            frame: 'sprite1',
            scale: 1.8,
            animationKey: 'attendant_idle',
            displayName: 'Attendant'
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
        if (!this.cache.json.exists('Act5Scene3Data')) {
            console.error("Act5Scene3Data JSON not found");
            return;
        }

        try {
            const dialogueData = this.cache.json.get('Act5Scene3Data');
            const portraitMap = {
                "Macbeth": "Macbeth",
                "Doctor": "Doctor",
                "Attendant": "Attendant"
            };

            this.setupDialogue(dialogueData, portraitMap, "Macbeth");

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
                if (npcKey === "Doctor" || npcKey === "Attendant") {
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
                this.player.anims.play('macbeth_run', true);
                this.player.flipX = true;
            } else if (this.keys.right.isDown) {
                this.player.setVelocityX(speed);
                this.player.anims.play('macbeth_run', true);
                this.player.flipX = false;
            } else {
                this.player.setVelocityX(0);
                this.player.anims.play('macbeth_idle', true);
            }

            if (!this.soliloquyStarted) {
                this.soliloquyStarted = true;
                this.time.delayedCall(1000, () => {
                    this.startDialogue("Macbeth");
                });
            }

            if (this.npcs["Doctor"] && !this.dialogueStarted) {
                const distToDoctor = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    this.npcs["Doctor"].x, this.npcs["Doctor"].y
                );
                if (distToDoctor < 120) {
                    this.dialogueStarted = true;
                    this.startDialogue("Doctor");
                }
            }

            if (this.npcs["Attendant"] && !this.dialogueStarted) {
                const distToAttendant = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    this.npcs["Attendant"].x, this.npcs["Attendant"].y
                );
                if (distToAttendant < 120) {
                    this.dialogueStarted = true;
                    this.startDialogue("Attendant");
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
        if (!this.scene.isActive('Act5Scene3')) return;

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
        if (this.npcs["Doctor"]) {
            this.npcs["Doctor"].setPosition(width * 0.7, height * 0.85);
        }
        if (this.npcs["Attendant"]) {
            this.npcs["Attendant"].setPosition(width * 0.5, height * 0.85);
        }
        if (this.exitHint) {
            this.exitHint.setPosition(width - 50, height / 2);
        }
    }
}
