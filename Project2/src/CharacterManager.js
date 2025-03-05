// CharacterManager.js
export class CharacterManager {
  constructor(scene) {
    this.scene = scene;
    this.characters = new Map();
    
    // Define character types with their default configurations
    this.characterTypes = {
      guard: {
        defaultFrame: 'sprite1',
        animations: {
          idle: { frames: [0], frameRate: 10 },
          left: { frames: [3, 4, 5], frameRate: 8 },
          right: { frames: [6, 7, 8], frameRate: 8 }
        }
      },
      king: {
        defaultFrame: 0,
        animations: {
          idle: { frames: [0], frameRate: 10 },
          left: { frames: [3, 4, 5], frameRate: 8 },
          right: { frames: [6, 7, 8], frameRate: 8 }
        }
      },
      witch: {
        defaultFrame: 0,
        animations: {
          idle: { frames: [0, 1, 2, 3, 4, 5], frameRate: 6 }
        }
      }
    };
  }

  // Setup animations for a character type using a specific texture
  setupAnimations(type, textureKey, frameConfig = {}) {
    const typeConfig = this.characterTypes[type];
    
    if (!typeConfig || !typeConfig.animations) {
      console.warn(`No animation config found for character type: ${type}`);
      return false;
    }
    
    // Create animations for this character type using specified texture
    Object.entries(typeConfig.animations).forEach(([animName, config]) => {
      const animKey = `${type}_${animName}`;
      
      // Skip if animation already exists
      if (this.scene.anims.exists(animKey)) return;
      
      // For spritesheet-based animations
      if (Array.isArray(config.frames)) {
        this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers(textureKey, { 
            frames: config.frames
          }),
          frameRate: config.frameRate || 8,
          repeat: config.repeat !== undefined ? config.repeat : -1
        });
      } 
      // For atlas-based animations
      else if (config.atlas) {
        this.scene.anims.create({
          key: animKey,
          frames: config.atlas.map(frame => ({ key: textureKey, frame })),
          frameRate: config.frameRate || 8,
          repeat: config.repeat !== undefined ? config.repeat : -1
        });
      }
    });
    
    return true;
  }

  // Create a standard atlas from JSON data
  setupAtlas(textureKey, jsonKey, atlasKey) {
    const finalAtlasKey = atlasKey || textureKey;
    const jsonData = this.scene.cache.json.get(jsonKey);
    
    if (!jsonData) {
      console.error(`JSON data not found for key: ${jsonKey}`);
      return false;
    }
    
    if (!this.scene.textures.exists(textureKey)) {
      console.error(`Texture not found for key: ${textureKey}`);
      return false;
    }
    
    // Skip if atlas already exists
    if (this.scene.textures.exists(finalAtlasKey) && finalAtlasKey !== textureKey) {
      return true;
    }
    
    try {
      // Convert to Phaser atlas format
      const phaserAtlas = { frames: {} };
      
      jsonData.forEach(frame => {
        phaserAtlas.frames[frame.name] = {
          frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
          rotated: false,
          trimmed: false,
          sourceSize: { w: frame.width, h: frame.height },
          spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height }
        };
      });
      
      // Add atlas to texture manager
      this.scene.textures.addAtlas(
        finalAtlasKey,
        this.scene.textures.get(textureKey).getSourceImage(),
        phaserAtlas
      );
      
      return true;
    } catch (error) {
      console.error(`Error creating atlas for ${textureKey}:`, error);
      return false;
    }
  }

  // Spawn a character with the given configuration
  spawnCharacter(config) {
    const { 
      key, 
      type = null,
      texture, 
      x, 
      y, 
      frame = null,
      scale = 1.5, 
      nameTag = null,
      depth = 1,
      physics = true,
      interactive = false,
      floorCollider = null,
      collideWorldBounds = true,
      gravity = false,
      animation = null
    } = config;
    
    if (!key) {
      console.error("Character key is required");
      return null;
    }
    
    if (!texture || !this.scene.textures.exists(texture)) {
      console.error(`Texture not found: ${texture}`);
      return null;
    }
    
    // Create the character sprite
    let sprite;
    
    if (physics) {
      sprite = this.scene.physics.add.sprite(x, y, texture, frame);
      
      // Apply physics properties
      if (sprite.body) {
        sprite.body.collideWorldBounds = collideWorldBounds;
        
        if (gravity) {
          sprite.body.setGravityY(300);
        }
      }
      
      // Add floor collision if provided
      if (floorCollider) {
        this.scene.physics.add.collider(sprite, floorCollider);
      }
    } else {
      sprite = this.scene.add.sprite(x, y, texture, frame);
    }
    
    // Configure the sprite
    sprite.setScale(scale);
    sprite.setOrigin(0.5, 1.0);
    sprite.setDepth(depth);
    
    if (interactive) {
      sprite.setInteractive();
    }
    
    // Create name tag if provided
    let nameTagText = null;
    if (nameTag) {
      nameTagText = this.createNameTag(sprite, nameTag);
    }
    
    // Play initial animation if provided
    if (animation) {
      sprite.play(animation);
    }
    
    // Store in characters map
    this.characters.set(key, {
      sprite,
      nameTag: nameTagText,
      type: type || key,
      texture
    });
    
    return sprite;
  }

  // Create a name tag for a character
  createNameTag(sprite, text) {
    const nameTag = this.scene.add.text(
      sprite.x, 
      sprite.y - sprite.height * sprite.scale * 1.2,
      text,
      {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5).setDepth(sprite.depth + 1);
    
    return nameTag;
  }

  // Get a character by key
  getCharacter(key) {
    return this.characters.get(key);
  }
  
  // Update animations based on velocity
  updateAnimation(key, velocity) {
    const character = this.characters.get(key);
    if (!character || !character.sprite) return;
    
    const { sprite, type } = character;
    
    if (velocity.x < 0) {
      sprite.anims.play(`${type}_left`, true);
    } 
    else if (velocity.x > 0) {
      sprite.anims.play(`${type}_right`, true);
    }
    else {
      sprite.anims.play(`${type}_idle`, true);
    }
  }
  
  // Update all character nametags
  update() {
    this.characters.forEach(character => {
      if (character.nameTag && character.sprite) {
        character.nameTag.setPosition(
          character.sprite.x, 
          character.sprite.y - character.sprite.height * character.sprite.scale * 1.2
        );
      }
    });
  }
  
  // Get all characters
  getAllCharacters() {
    return Array.from(this.characters.values());
  }
  
  // Remove a specific character
  removeCharacter(key) {
    const character = this.characters.get(key);
    if (character) {
      if (character.nameTag) character.nameTag.destroy();
      if (character.sprite) character.sprite.destroy();
      this.characters.delete(key);
    }
  }
  
  // Destroy all characters and cleanup
  destroy() {
    this.characters.forEach(character => {
      if (character.nameTag) character.nameTag.destroy();
      if (character.sprite) character.sprite.destroy();
    });
    this.characters.clear();
  }
}