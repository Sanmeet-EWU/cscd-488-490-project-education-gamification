export default class AudioController {
  constructor() {
      // Audio states
      this._soundOn = true;
      this._musicOn = true;
      this._bgMusicPlaying = false;
      this._bgVolume = 0.5;
      this._soundVolume = 0.5;
      
      // Tracking variables
      this._currentSceneMusic = null;
      this._pendingMusic = null;
      this._userInteracted = false;
      this._initialized = false;
      this._gameScenePaused = false;
      this._pausedSceneKey = null;
      this._currentSceneKey = null;
      this._activeMusic = null;
      this._currentPlayingMusicKey = null;
      
      // Singleton pattern
      if (window.audioControllerInstance) {
          return window.audioControllerInstance;
      }
      window.audioControllerInstance = this;
      
      this._setupGlobalInteractionListener();
  }

  set musicOn(value) { 
      this._musicOn = value; 
      
      if (!value) {
          if (window.game?.globals?.bgMusic) {
              if (window.game.globals.bgMusic.isPlaying) {
                  window.game.globals.bgMusic.pause();
              }
          }
          if (this._currentSceneMusic && this._currentSceneMusic.isPlaying) {
              this._currentSceneMusic.pause();
          }
          this._bgMusicPlaying = false;
      } else if (this._userInteracted && this._pendingMusic) {
          if (window.game?.globals?.bgMusic) {
              window.game.globals.bgMusic.resume();
              this._bgMusicPlaying = true;
          } else if (this._currentSceneMusic) {
              this._currentSceneMusic.resume();
              this._bgMusicPlaying = true;
          } else {
              this._playMusic(this._pendingMusic.scene, this._pendingMusic.key);
          }
      }
  }
  get musicOn() { return this._musicOn; }
  
  set soundOn(value) { this._soundOn = value; }
  get soundOn() { return this._soundOn; }
  
  set bgMusicPlaying(value) { this._bgMusicPlaying = value; }
  get bgMusicPlaying() { return this._bgMusicPlaying; }
  
  set bgVolume(value) { 
      this._bgVolume = value; 
      this.updateBackgroundVolume();
  }
  get bgVolume() { return this._bgVolume; }
  
  set soundVolume(value) { this._soundVolume = value; }
  get soundVolume() { return this._soundVolume; }

  // Set up listener for user interaction
  _setupGlobalInteractionListener() {
      if (window.audioInteractionListenerAdded) {
          return;
      }
      
      window.audioInteractionListenerAdded = true;
      
      const handleInteraction = () => {
          this._userInteracted = true;
          
          if (window.audioControllerInstance) {
              window.audioControllerInstance._userInteracted = true;
          }
          
          if (this._pendingMusic && this.musicOn) {
              this._playMusic(this._pendingMusic.scene, this._pendingMusic.key);
          }
          
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
          document.removeEventListener('keydown', handleInteraction);
          window.audioInteractionListenerAdded = false;
      };
      
      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
      document.addEventListener('keydown', handleInteraction);
  }

  // Track paused game scene
  setGameScenePaused(sceneKey) {
      this._gameScenePaused = true;
      this._pausedSceneKey = sceneKey;
  }

  // Resume from pause
  setGameSceneResumed() {
      this._gameScenePaused = false;
      this._pausedSceneKey = null;
  }

  // Initialize once
  init(scene) {
      if (this._initialized) {
          return;
      }
      
      this._initialized = true;
  }

  // Switch audio context 
  switchContext() {
      if (this._currentSceneKey === 'MainMenu') {
          return;
      }
      
      this.pauseAllMusic();
      this._gameScenePaused = false;
      this._pausedSceneKey = null;
      this._currentSceneKey = 'MainMenu';
      this._currentPlayingMusicKey = null;
  }

  // Start main menu music
  startMainMenuMusic(scene) {
      if (scene && scene.scene) {
          this._currentSceneKey = scene.scene.key;
      }
      
      if (this._gameScenePaused) {
          return;
      }
      
      this.init(scene);
      
      if (!this.musicOn) {
          return;
      }
      
      if (!scene || !scene.sound) {
          return;
      }
      
      if (this._currentPlayingMusicKey === 'testMusic') {
          return;
      }
      
      if (window.game?.globals?.bgMusic) {
          const bgMusic = window.game.globals.bgMusic;
          if (!bgMusic.isPlaying) {
              bgMusic.resume();
              this._bgMusicPlaying = true;
              this._currentPlayingMusicKey = 'testMusic';
              return;
          }
      }
      
      this._pendingMusic = { scene, key: 'testMusic' };
      
      if (this._userInteracted) {
          this._playMusic(scene, 'testMusic');
      }
  }

  // Pause all currently playing music
  pauseAllMusic() {
      if (window.game?.globals?.bgMusic) {
          try {
              const bgMusic = window.game.globals.bgMusic;
              
              if (bgMusic.isPlaying) {
                  bgMusic.pause();
              }
          } catch (error) {}
      }
      
      if (this._currentSceneMusic && this._currentSceneMusic.isPlaying) {
          try {
              this._currentSceneMusic.pause();
          } catch (error) {}
      }
      
      this._bgMusicPlaying = false;
  }

  // Internal music player
  _playMusic(scene, musicKey) {
      if (!this.musicOn || !scene || !scene.sound) return;
      
      if (this._currentPlayingMusicKey === musicKey) {
          return;
      }
      
      if (window.game?.globals?.bgMusic) {
          const existingMusic = window.game.globals.bgMusic;
          if (!existingMusic.isPlaying && existingMusic.key === musicKey) {
              existingMusic.resume();
              this._bgMusicPlaying = true;
              this._currentPlayingMusicKey = musicKey;
              return;
          }
      }
      
      this.pauseAllMusic();
      
      try {
          if (!scene.cache.audio.exists(musicKey)) {
              return;
          }
          
          const bgMusic = scene.sound.add(musicKey, { 
              volume: this.bgVolume,
              loop: true 
          });
          
          if (scene.sys.game?.globals) {
              scene.sys.game.globals.bgMusic = bgMusic;
          }
          
          this._activeMusic = bgMusic;
          this._activeMusic.key = musicKey;
          this._currentPlayingMusicKey = musicKey;
          
          bgMusic.play();
          this._bgMusicPlaying = true;
          
      } catch (error) {}
  }

  // Pause main menu music
  pauseMainMenuMusic() {
      if (!window.game?.globals?.bgMusic) return;
      
      const bgMusic = window.game.globals.bgMusic;
      if (bgMusic?.isPlaying) {
          bgMusic.pause();
          this._bgMusicPlaying = false;
      }
  }

  // Play scene-specific music
  playSceneMusic(scene, musicKey, options = { volume: 0.8, loop: true }) {
      if (scene && scene.scene) {
          this._currentSceneKey = scene.scene.key;
      }
      
      if (this._gameScenePaused && scene && scene.scene && scene.scene.key === this._pausedSceneKey) {
          this.setGameSceneResumed();
          return;
      }
      
      if (!this.musicOn || !scene) return;
      
      if (this._currentPlayingMusicKey === musicKey) {
          return;
      }
      
      this._pendingMusic = { scene, key: musicKey };
      
      this.pauseAllMusic();
      
      if (!this._userInteracted) {
          return;
      }
      
      try {
          if (scene.cache.audio.exists(musicKey)) {
              this._currentSceneMusic = scene.sound.add(musicKey, {
                  volume: this.bgVolume * options.volume,
                  loop: options.loop
              });
              
              this._currentSceneMusic.key = musicKey;
              this._currentPlayingMusicKey = musicKey;
              this._currentSceneMusic.play();
          }
      } catch (error) {}
  }

  // Stop scene music
  stopSceneMusic() {
      if (this._currentSceneMusic) {
          try {
              if (this._currentSceneMusic.isPlaying) {
                  this._currentSceneMusic.stop();
              }
              
              if (!this._currentSceneMusic.isDestroyed) {
                  this._currentSceneMusic.destroy();
              }
              
              this._currentSceneMusic = null;
              this._currentPlayingMusicKey = null;
          } catch (error) {
              this._currentSceneMusic = null;
          }
      }
  }

  // Update volume for all audio
  updateBackgroundVolume() {
      if (window.game?.globals?.bgMusic) {
          window.game.globals.bgMusic.setVolume(this.bgVolume);
      }
      
      if (this._currentSceneMusic) {
          this._currentSceneMusic.setVolume(this.bgVolume);
      }
  }
}