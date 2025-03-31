class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 2;  // Reduced from 5 to 2 for slower movement
        this.size = 32;  // Collision hitbox size
        this.renderSize = 48;  // Visual size of the character
        this.gridX = Math.floor(x / this.size);
        this.gridY = Math.floor(y / this.size);

        // Animation properties
        this.sprites = {
            idle: new Image(),
            actions: new Image(),
            hoeing: new Image(),
            // Separate sprite images for each watering animation and direction
            wateringFront: new Image(),
            wateringBack: new Image(),
            wateringRight: new Image(),
            wateringLeft: new Image(),
            // Idle watering sprites (not actively watering)
            waterIdleFront: new Image(),
            waterIdleBack: new Image(),
            waterIdleRight: new Image(),
            waterIdleLeft: new Image(),
            // New tilling animation sprites - start animation
            tillStartFront: new Image(),
            tillStartBack: new Image(),
            tillStartRight: new Image(),
            // New tilling animation sprites - end animation
            tillEndFront: new Image(),
            tillEndBack: new Image(),
            tillEndRight: new Image()
        };
        this.sprites.idle.src = '/static/sprites/character/Cute_Fantasy_Free/Player/Player.png';
        this.sprites.actions.src = '/static/sprites/character/Cute_Fantasy_Free/Player/Player_Actions.png';
        this.sprites.hoeing.src = '/static/assets/hoeing.svg';
        
        // Active watering sprites - using filenames that match the actual files
        this.sprites.wateringFront.src = '/static/assets/watering_sprites/regando_front.png';
        this.sprites.wateringBack.src = '/static/assets/watering_sprites/regando_back.png';
        this.sprites.wateringRight.src = '/static/assets/watering_sprites/regando_right.png';
        this.sprites.wateringLeft.src = '/static/assets/watering_sprites/regar_left.png'; // Using a different file for left direction
        
        // Idle watering sprites - using the actual filenames from the uploaded sprites
        // These match the uploaded sprite files in the watering_sprites folder
        this.sprites.waterIdleFront.src = '/static/assets/watering_sprites/regar_front.png';
        this.sprites.waterIdleBack.src = '/static/assets/watering_sprites/regar_back.png';
        this.sprites.waterIdleRight.src = '/static/assets/watering_sprites/regar_right.png';
        this.sprites.waterIdleLeft.src = '/static/assets/watering_sprites/regar_left.png';
        
        // New tilling animation sprites - starting animations
        this.sprites.tillStartFront.src = '/static/assets/tilling_sprites/tilling_start_front.png';
        this.sprites.tillStartBack.src = '/static/assets/tilling_sprites/tilling_start_back.png';
        this.sprites.tillStartRight.src = '/static/assets/tilling_sprites/tilling_start_right.png';
        
        // New tilling animation sprites - ending animations (with dirt particles)
        this.sprites.tillEndFront.src = '/static/assets/tilling_sprites/tilling_end_front.png';
        this.sprites.tillEndBack.src = '/static/assets/tilling_sprites/tilling_end_back.png';
        this.sprites.tillEndRight.src = '/static/assets/tilling_sprites/tilling_end_right.png';
        
        // Set default dimensions for tilling sprites
        this.tillingWidth = 32;  // Default width for tilling sprites
        this.tillingHeight = 32; // Default height for tilling sprites
        
        // Debug what files are actually available
        console.log("Player initializing watering sprites. Window game exists:", !!window.game);
        
        // Preload all sprites to ensure they're ready when needed
        for (let spriteName in this.sprites) {
            const img = this.sprites[spriteName];
            img.onload = () => console.log(`Loaded sprite: ${spriteName}`, img.width, img.height);
            img.onerror = () => console.error(`Failed to load sprite: ${spriteName}`, img.src);
        }

        this.frameWidth = 32;
        this.frameHeight = 32;
        this.currentFrame = 0;
        this.frameCount = 4; // Number of frames in walk animation
        this.frameTick = 0;
        this.frameTicksPerFrame = 12; // Increased from 8 to 12 for slower animation
        this.direction = 'down'; // down, up, left, right
        this.isMoving = false;
        
        // Tool/action animation
        this.isWatering = false;  // General flag for tool animations
        this.wateringDuration = 500; // 0.5 seconds
        this.wateringStartTime = 0;
        this.wateringAnimationStage = 0; // 0 for idle, 1 for action pose
        this.toolType = 'default'; // Track which tool is being used
        
        // Particles for enhanced visibility (used with different tools)
        this.waterParticles = [];  // For watering can
        this.dirtParticles = [];   // For tilling
    }

    canMoveToPosition(world, newX, newY) {
        const corners = [
            [newX, newY],
            [newX + this.size - 1, newY],
            [newX, newY + this.size - 1],
            [newX + this.size - 1, newY + this.size - 1]
        ];
        return corners.some(([x, y]) => world.isTileWalkable(x, y));
    }

    move(direction, world) {
        // Don't allow movement during watering animation
        if (this.isWatering) {
            return;
        }
        
        let newX = this.x;
        let newY = this.y;
        this.direction = direction;
        this.isMoving = true;

        switch(direction) {
            case 'up':
                newY = Math.max(0, this.y - this.speed);
                break;
            case 'down':
                newY = Math.min(world.height * world.tileSize - this.size, this.y + this.speed);
                break;
            case 'left':
                newX = Math.max(0, this.x - this.speed);
                break;
            case 'right':
                newX = Math.min(world.width * world.tileSize - this.size, this.x + this.speed);
                break;
        }

        if (this.canMoveToPosition(world, newX, newY)) {
            this.x = newX;
            this.y = newY;
            this.gridX = Math.floor(this.x / this.size);
            this.gridY = Math.floor(this.y / this.size);
        }
    }

    updateAnimation() {
        // Check if watering animation is in progress
        if (this.isWatering) {
            const now = Date.now();
            // If watering animation is completed
            if (now - this.wateringStartTime >= this.wateringDuration) {
                this.isWatering = false;
            }
            // During watering, we don't update the walking animation frames
            return;
        }
        
        // Normal walking animation
        if (this.isMoving) {
            this.frameTick++;
            if (this.frameTick >= this.frameTicksPerFrame) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.frameTick = 0;
            }
        } else {
            this.currentFrame = 0;
        }
        this.isMoving = false; // Reset moving flag each frame
    }
    
    // General tool animation method - for tilling, planting, harvesting
    startToolAnimation(toolType = 'default') {
        console.log(`Starting ${toolType} animation`);
        this.isWatering = true; // Reusing the animation flag for all tools
        this.wateringStartTime = Date.now();
        this.wateringAnimationStage = 1; // Shift to start animation pose (tilling start)
        this.toolType = toolType; // Track which tool is being used
        
        // Clear any existing particles
        this.waterParticles = [];
        this.dirtParticles = [];
        
        // Create the appropriate particles based on the tool
        if (toolType === 'water') {
            this.createWaterParticles();
        } else if (toolType === 'till') {
            // For tilling, transition between start and end animations
            // Start with the starting animation
            console.log('Starting tilling animation sequence');
            
            // After 250ms (halfway through), transition to ending animation with dirt particles
            setTimeout(() => {
                console.log('Transitioning to ending tilling animation');
                this.wateringAnimationStage = 0; // Switch to end animation pose (tilling end)
                this.createDirtParticles(); // Create dirt particles during the ending animation
            }, this.wateringDuration / 2);
        }
        
        // After the full duration, reset to normal - but keep the tool type if needed
        setTimeout(() => {
            console.log(`Ending ${toolType} animation`);
            this.isWatering = false;
            this.wateringAnimationStage = 0;
            this.waterParticles = []; // Clear water particles
            this.dirtParticles = [];  // Clear dirt particles
            
            // Keep the toolType if it's the currently selected tool in the toolbar
            const currentTool = window.game?.toolbar?.getCurrentTool()?.action;
            console.log("Animation ending. Current toolbar selected tool:", currentTool);
            
            // If toolbar has a selection that matches our tool, keep it, otherwise reset
            if (currentTool === toolType) {
                console.log(`Keeping tool type as ${toolType} since it's selected in toolbar`);
                // Keep the current tool type
            } else {
                console.log(`Resetting tool type to default from ${toolType}`);
                this.toolType = 'default';
            }
        }, this.wateringDuration);
    }
    
    // Specific method for watering can animation
    startWatering() {
        this.startToolAnimation('water');
    }
    
    // Helper method to create water particles
    createWaterParticles() {
        // Calculate position for water particles based on player position and direction
        let particleX = this.x + this.size / 2;
        let particleY = this.y + this.size / 2;
        let offsetX = 0;
        let offsetY = 0;
        
        // Adjust offset based on direction - position water drops further away from player
        switch(this.direction) {
            case 'down':
                offsetY = this.size * 1.2; // Place further ahead
                break;
            case 'up':
                offsetY = -this.size * 1.2; // Place further behind
                break;
            case 'left':
                offsetX = -this.size * 1.2; // Place further to the left
                break;
            case 'right':
                offsetX = this.size * 1.2; // Place further to the right
                break;
        }
        
        // Create just 3 particles in slight variations around the target point
        this.waterParticles = [];
        for (let i = 0; i < 3; i++) {
            this.waterParticles.push({
                x: particleX + offsetX + (Math.random() * 12 - 6), // Reduced spread
                y: particleY + offsetY + (Math.random() * 10), // Bias downward (closer to ground)
                size: 2 + Math.random() * 2, // Smaller particles
                opacity: 0.6, // Reduced opacity
                life: this.wateringDuration
            });
        }
    }
    
    // Helper method to create dirt particles for tilling
    createDirtParticles() {
        // Calculate position for dirt particles based on player position and direction
        let particleX = this.x + this.size / 2;
        let particleY = this.y + this.size / 2;
        let offsetX = 0;
        let offsetY = 0;
        
        // Adjust offset based on direction
        switch(this.direction) {
            case 'down':
                offsetY = this.size / 2;
                break;
            case 'up':
                offsetY = -this.size / 2;
                break;
            case 'left':
                offsetX = -this.size / 2;
                break;
            case 'right':
                offsetX = this.size / 2;
                break;
        }
        
        // Create 10 dirt particles in variations around the target point
        this.dirtParticles = [];
        for (let i = 0; i < 10; i++) {
            // Different shapes and sizes for dirt particles
            const size = 2 + Math.random() * 5;
            // Random velocity for more dynamic movement
            const vx = (Math.random() - 0.5) * 6;
            const vy = (Math.random() - 0.5) * 6 - 2; // Slight upward bias
            
            this.dirtParticles.push({
                x: particleX + offsetX + (Math.random() * 10 - 5),
                y: particleY + offsetY + (Math.random() * 10 - 5),
                size: size,
                vx: vx, // horizontal velocity
                vy: vy, // vertical velocity
                opacity: 0.9,
                gravity: 0.2,
                life: this.wateringDuration,
                color: Math.random() > 0.5 ? '#5E3A1C' : '#8B4513' // Mix of brown colors
            });
        }
    }

    draw(ctx) {
        this.updateAnimation();

        // Position for drawing (centered on hitbox)
        const drawX = this.x - (this.renderSize - this.size) / 2;
        const drawY = this.y - (this.renderSize - this.size) / 2;

        // Save the current context state before transformations
        ctx.save();
        
        // Calculate sprite position based on direction for regular character
        let spriteY = 0;
        switch(this.direction) {
            case 'down':
                spriteY = 0; // Front-facing sprites
                break;
            case 'up':
                spriteY = this.frameHeight * 2; // Back-facing sprites
                break;
            case 'left':
            case 'right':
                spriteY = this.frameHeight; // Right-facing sprites (will be flipped for left)
                break;
        }
        
        // If the player is holding the watering tool but not actively watering, show them holding it
        const isHoldingWateringTool = this.toolType === 'water' && !this.isWatering;
        
        // Draw the character 
        if (this.direction === 'left') {
            // Scale horizontally by -1 to flip the sprite
            ctx.scale(-1, 1);
            
            // If using a special tool animation, draw that instead of the character
            if (this.isWatering) {
                // Don't draw the regular character sprite when a tool is being used
                
                // Calculate which sprite to use based on tool type and direction
                if (this.toolType === 'water') {
                    // Since we're drawing a left-facing character, use the right sprites but mirror them
                    const sprite = this.wateringAnimationStage === 1 ? 
                        this.sprites.wateringRight : this.sprites.waterIdleRight;
                    
                    if (sprite) {
                        // Position the sprite relative to the character (flipped)
                        // Center it better for left direction
                        const toolX = -drawX - this.renderSize;
                        const toolY = drawY;
                        
                        try {
                            // Draw the watering can sprite with fixed source dimensions
                            ctx.drawImage(
                                sprite, // The specific direction sprite
                                0, 0, this.tillingWidth, this.tillingHeight, // Fixed source dimensions
                                toolX, toolY, this.renderSize, this.renderSize // Destination dimensions
                            );
                        } catch (error) {
                            console.error("Error drawing left watering sprite:", error);
                        }
                    }
                } else if (this.toolType === 'till') {
                    // Use the new tilling animations based on direction and animation stage
                    // When facing left, we need to handle mirroring carefully
                    let tillSprite;
                    const animationStage = this.wateringAnimationStage === 0 ? "end" : "start";
                    console.log(`Selecting left tilling ${animationStage} sprite (mirrored from right)`);
                    
                    // For left direction, we'll mirror the right sprites
                    tillSprite = this.wateringAnimationStage === 0 ? 
                        this.sprites.tillEndRight : this.sprites.tillStartRight;
                    
                    if (tillSprite) {
                        console.log("Left direction: Sprite found, dimensions:", tillSprite.width, "x", tillSprite.height);
                        
                        // Position the tool sprite better centered when flipped
                        // Make sure we avoid floating point precision issues by using integer positions
                        const toolX = Math.floor(-drawX - this.renderSize);
                        const toolY = Math.floor(drawY - 8); // Move up to show the full tool
                        
                        try {
                            // Use fixed dimensions instead of relying on sprite dimensions
                            ctx.drawImage(
                                tillSprite,
                                0, 0, this.tillingWidth, this.tillingHeight, // Source dimensions
                                toolX, toolY, this.renderSize, this.renderSize // Use standard size
                            );
                            console.log("Left tilling sprite drawn successfully");
                        } catch (error) {
                            console.error("Error drawing left tilling sprite:", error);
                        }
                    } else {
                        console.error("Missing sprite for left tilling animation");
                    }
                }
                // Return early since we've drawn the tool sprite
                return;
            } else {
                // Normal character walking
                ctx.drawImage(
                    this.sprites.idle,
                    this.currentFrame * this.frameWidth,
                    spriteY,
                    this.frameWidth,
                    this.frameHeight,
                    -drawX - this.renderSize, // Negative x position when flipped
                    drawY,
                    this.renderSize,
                    this.renderSize
                );
            }
        } else {
            // Draw normally for other directions
            
            // If using a special tool animation, draw that instead of the character
            if (this.isWatering) {
                let sprite = null;
                
                // Calculate which sprite to use based on tool type and direction
                if (this.toolType === 'water') {
                    // Select the appropriate watering sprite based on direction and animation stage
                    switch(this.direction) {
                        case 'down':
                            sprite = this.wateringAnimationStage === 1 ? 
                                this.sprites.wateringFront : this.sprites.waterIdleFront;
                            break;
                        case 'up':
                            sprite = this.wateringAnimationStage === 1 ? 
                                this.sprites.wateringBack : this.sprites.waterIdleBack;
                            break;
                        case 'right':
                            sprite = this.wateringAnimationStage === 1 ? 
                                this.sprites.wateringRight : this.sprites.waterIdleRight;
                            break;
                    }
                    
                    // If we have a valid watering sprite to draw
                    if (sprite) {
                        // Position the tool relative to the character based on direction
                        const toolX = drawX;
                        const toolY = drawY;
                        
                        // Draw the watering can sprite with fixed source dimensions
                        try {
                            ctx.drawImage(
                                sprite, // The specific direction sprite
                                0, 0, this.tillingWidth, this.tillingHeight, // Fixed source dimensions
                                toolX, toolY, this.renderSize, this.renderSize // Destination dimensions
                            );
                        } catch (error) {
                            console.error("Error drawing watering sprite:", error);
                        }
                        return; // Exit early after drawing watering sprite
                    }
                } else if (this.toolType === 'till') {
                    // Select the appropriate sprite based on direction and animation stage
                    let tillSprite;
                    const animationStage = this.wateringAnimationStage === 0 ? "end" : "start";
                    console.log(`Selecting tilling ${animationStage} sprite for direction:`, this.direction);
                    
                    switch(this.direction) {
                        case 'down':
                            // For down-facing (front) tilling animation
                            tillSprite = this.wateringAnimationStage === 0 ? 
                                this.sprites.tillEndFront : this.sprites.tillStartFront;
                            console.log("Using front tilling sprite:", 
                                this.wateringAnimationStage === 0 ? "tillEndFront" : "tillStartFront");
                            break;
                        case 'up':
                            // For up-facing (back) tilling animation
                            tillSprite = this.wateringAnimationStage === 0 ? 
                                this.sprites.tillEndBack : this.sprites.tillStartBack;
                            console.log("Using back tilling sprite:", 
                                this.wateringAnimationStage === 0 ? "tillEndBack" : "tillStartBack");
                            break;
                        case 'right':
                            // For right-facing tilling animation
                            tillSprite = this.wateringAnimationStage === 0 ? 
                                this.sprites.tillEndRight : this.sprites.tillStartRight;
                            console.log("Using right tilling sprite:", 
                                this.wateringAnimationStage === 0 ? "tillEndRight" : "tillStartRight");
                            break;
                    }
                    
                    // Make sure we have a valid sprite
                    if (tillSprite) {
                        console.log("Sprite found, dimensions:", tillSprite.width, "x", tillSprite.height);
                        
                        // Position the sprite with additional offset to show the full tool
                        // We need to shift it up a bit to show the full tool for all directions
                        const toolX = drawX;
                        const toolY = drawY - 8; // Move up for all directions to show the full tool
                        
                        try {
                            // Use fixed dimensions instead of relying on sprite dimensions
                            ctx.drawImage(
                                tillSprite,
                                0, 0, this.tillingWidth, this.tillingHeight, // Use fixed source dimensions
                                toolX, toolY, this.renderSize, this.renderSize // Use standard size
                            );
                            return; // Exit early since we've drawn the tilling tool
                        } catch (error) {
                            console.error("Error drawing tilling sprite:", error);
                        }
                    } else {
                        console.error("No tilling sprite for direction:", this.direction, 
                            "Animation stage:", this.wateringAnimationStage);
                    }
                }
                // If no tool sprite was drawn, fall through to draw the regular character
            }
            
            // Draw the regular character sprite if no special tool animation was rendered
            ctx.drawImage(
                this.sprites.idle,
                this.currentFrame * this.frameWidth,
                spriteY,
                this.frameWidth,
                this.frameHeight,
                drawX,
                drawY,
                this.renderSize,
                this.renderSize
            );
        }

        // Restore the context state
        ctx.restore();
        
        // When the player has selected the watering can (but not actively watering),
        // replace the player sprite with the holding watering can sprite
        if (this.toolType === 'water' && !this.isWatering) {
            console.log("Drawing watering can idle sprite for direction:", this.direction);
            
            // Get the appropriate idle sprite based on direction
            let idleSprite;
            switch(this.direction) {
                case 'down': 
                    idleSprite = this.sprites.waterIdleFront; 
                    break;
                case 'up': 
                    idleSprite = this.sprites.waterIdleBack; 
                    break;
                case 'left': 
                    // For left direction, mirror the right sprite instead of using a dedicated left sprite
                    // Save the context, flip horizontally, draw, then restore
                    ctx.save();
                    ctx.scale(-1, 1);
                    try {
                        ctx.drawImage(
                            this.sprites.waterIdleRight, 
                            0, 0, this.tillingWidth, this.tillingHeight, // Fixed dimensions
                            -drawX - this.renderSize, drawY, this.renderSize, this.renderSize
                        );
                    } catch (error) {
                        console.error("Error drawing left idle watering sprite:", error);
                    }
                    ctx.restore();
                    return; // Exit early since we've already drawn the sprite
                    break;
                case 'right': 
                    idleSprite = this.sprites.waterIdleRight; 
                    break;
                default: 
                    idleSprite = this.sprites.waterIdleFront; 
                    break;
            }
            
            // Draw the appropriate watering can idle sprite based on direction
            try {
                ctx.drawImage(
                    idleSprite,
                    0, 0, this.tillingWidth, this.tillingHeight, // Fixed dimensions
                    drawX, drawY, this.renderSize, this.renderSize
                );
            } catch (error) {
                console.error("Error drawing idle watering sprite:", error);
            }
        }
        
        // Get common animation progress values
        const currentTime = Date.now();
        const elapsed = currentTime - this.wateringStartTime;
        const progress = elapsed / this.wateringDuration;
        
        // Draw water particles when using watering can
        if (this.isWatering && this.toolType === 'water' && this.waterParticles.length > 0) {
            // Draw all water particles
            for (let particle of this.waterParticles) {
                // Calculate fade based on lifetime
                const fadeProgress = progress;
                const opacity = particle.opacity * (1 - fadeProgress);
                
                ctx.fillStyle = `rgba(0, 120, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add a highlight to make it more visible
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
                ctx.beginPath();
                ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                // Also draw a splash effect on the ground
                if (fadeProgress > 0.3) {
                    const splashSize = particle.size * 1.5 * fadeProgress;
                    const splashOpacity = (1 - fadeProgress) * 0.3;
                    ctx.fillStyle = `rgba(0, 100, 200, ${splashOpacity})`;
                    ctx.beginPath();
                    ctx.ellipse(particle.x, particle.y + particle.size, splashSize * 1.5, splashSize * 0.6, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Draw dirt particles when tilling
        if (this.isWatering && this.toolType === 'till' && this.dirtParticles.length > 0) {
            // Update and draw dirt particles with physics for a more dynamic effect
            for (let particle of this.dirtParticles) {
                // Apply gravity and update position
                particle.vy += particle.gravity;
                particle.x += particle.vx * progress * 2; // Adjust speed based on progress
                particle.y += particle.vy * progress * 2;
                
                // Calculate fade based on lifetime with a quicker fade
                const fadeProgress = progress * 1.2; // Fade out slightly quicker than the animation
                const opacity = particle.opacity * (1 - fadeProgress);
                
                // Skip if fully faded
                if (opacity <= 0) continue;
                
                // Draw dirt particle
                ctx.fillStyle = `rgba(${particle.color === '#5E3A1C' ? '94, 58, 28' : '139, 69, 19'}, ${opacity})`;
                ctx.beginPath();
                
                // Draw slightly irregular shapes for dirt
                if (Math.random() > 0.5) {
                    // Circle
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                } else {
                    // Small rectangle
                    ctx.rect(
                        particle.x - particle.size/2, 
                        particle.y - particle.size/2, 
                        particle.size, 
                        particle.size
                    );
                }
                ctx.fill();
            }
        }
    }
}