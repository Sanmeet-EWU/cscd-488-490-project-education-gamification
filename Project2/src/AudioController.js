export default class AudioController {
  constructor() {
    // Toggles
    this.musicOn = true;
    this.soundOn = true;

    // Volumes
    this.bgVolume = 0.5;
    this.soundVolume = 0.5;

    // Single track references
    this._activeTrack = null;
    this._activeTrackKey = null;

    // Keep track of last "actually played" music, so if we do a resume logic
    this._lastMusicKey = null;
    this._lastMusicScene = null;
    this._lastMusicConfig = null;

    // If the user tries to play music while music is off, we store it here
    this._pendingMusicKey = null;
    this._pendingMusicScene = null;
    this._pendingMusicConfig = null;

    // Track user interaction for auto-play restrictions
    this._userInteracted = false;

    // Singleton check
    if (window.audioControllerInstance) {
      return window.audioControllerInstance;
    }
    window.audioControllerInstance = this;

    // Set up the global user interaction listener
    this._setupGlobalInteractionListener();
  }

  _setupGlobalInteractionListener() {
    if (window.audioInteractionListenerAdded) return;
    window.audioInteractionListenerAdded = true;

    const handleInteraction = () => {
      this._userInteracted = true;
      // If we had pending music, try to actually play it now
      if (this._pendingMusicKey && this.musicOn && this._pendingMusicScene) {
        this._actuallyPlayMusic(
          this._pendingMusicKey,
          this._pendingMusicConfig,
          this._pendingMusicScene
        );
        // Clear pending once we've actually played it
        this._pendingMusicKey = null;
        this._pendingMusicScene = null;
        this._pendingMusicConfig = null;
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

  /**
   * Main method to play or queue background music by `key`.
   * @param {string} key - The audio key (e.g. 'sceneMusic', 'testMusic')
   * @param {Phaser.Scene} scene - The scene that has the audio in its cache
   * @param {object} config - { volume?: number, loop?: boolean } overrides
   */
  playMusic(key, scene = null, config = { volume: 1, loop: true }) {
    // Must have a valid scene
    if (!scene) {
      console.warn("playMusic called without a valid scene. Cannot proceed.");
      return;
    }

    // If music is off, store as pending but do not actually play
    if (!this.musicOn) {
      this._pendingMusicKey = key;
      this._pendingMusicScene = scene;
      this._pendingMusicConfig = config;
      return;
    }

    // If user hasn’t interacted, store pending
    if (!this._userInteracted) {
      this._pendingMusicKey = key;
      this._pendingMusicScene = scene;
      this._pendingMusicConfig = config;
      return;
    }

    // If we’re already playing this exact track, do nothing
    if (this._activeTrackKey === key && this._activeTrack?.isPlaying) {
      return;
    }

    // Stop any old track
    this.stopMusic();
    // Actually play new track
    this._actuallyPlayMusic(key, config, scene);
  }

  _actuallyPlayMusic(key, config, scene) {
    if (!scene?.cache?.audio) {
      console.warn("Scene/cache not valid; cannot play music:", key);
      return;
    }
    if (!scene.cache.audio.exists(key)) {
      console.warn(`Audio key "${key}" not found in cache.`);
      return;
    }

    this._activeTrackKey = key;
    this._lastMusicKey = key;
    this._lastMusicScene = scene;
    this._lastMusicConfig = config;

    const finalVolume = this.bgVolume * (config.volume ?? 1);
    const loopVal = config.loop ?? true;

    try {
      const track = scene.sound.add(key, {
        volume: finalVolume,
        loop: loopVal
      });
      track.play();
      this._activeTrack = track;
    } catch (err) {
      console.error("Failed to play music:", err);
    }
  }

  pauseMusic() {
    if (this._activeTrack?.isPlaying) {
      this._activeTrack.pause();
    }
  }

  resumeMusic() {
    if (this._activeTrack && !this._activeTrack.isPlaying) {
      this._activeTrack.resume();
    }
  }

  stopMusic() {
    if (this._activeTrack) {
      try {
        if (this._activeTrack.isPlaying) {
          this._activeTrack.stop();
        }
        if (!this._activeTrack.isDestroyed) {
          this._activeTrack.destroy();
        }
      } catch {}
      this._activeTrack = null;
      this._activeTrackKey = null;
    }
  }

  // Called when user toggles "Music On/Off"
  setMusicOn(value) {
    this.musicOn = value;

    if (!value) {
      // Turn music OFF
      this.stopMusic();
    } else {
      // Turn music ON
      // If we have an active track paused, resume it
      if (this._activeTrack && !this._activeTrack.isPlaying) {
        this.resumeMusic();
        return;
      }

      // Otherwise, check if we have pending from a new scene
      if (this._pendingMusicKey && this._pendingMusicScene && this._userInteracted) {
        this.stopMusic();
        this._actuallyPlayMusic(
          this._pendingMusicKey,
          this._pendingMusicConfig,
          this._pendingMusicScene
        );
        // Clear pending after playing
        this._pendingMusicKey = null;
        this._pendingMusicScene = null;
        this._pendingMusicConfig = null;
        return;
      }

      // If no pending is set, fallback to lastMusicKey
      if (this._lastMusicKey && this._lastMusicScene && this._userInteracted) {
        this._actuallyPlayMusic(
          this._lastMusicKey,
          this._lastMusicConfig,
          this._lastMusicScene
        );
      }
    }
  }

  setSoundOn(value) {
    this.soundOn = value;
  }

  setBGVolume(vol) {
    this.bgVolume = vol;
    if (this._activeTrack) {
      this._activeTrack.setVolume(vol);
    }
  }

  setSoundVolume(vol) {
    this.soundVolume = vol;
  }
}
