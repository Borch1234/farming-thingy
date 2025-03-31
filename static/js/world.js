class World {
    constructor(canvas) {
        this.tileSize = 32;
        this.width = 25;  // Map width
        this.height = 18; // Map height
        this.tiles = this.generateWorld();
        this.actionRange = 4; // Increased range to 4 blocks
        this.hoveredTile = null;

        // Load grass texture
        this.grassTexture = new Image();
        this.grassTexture.src = '/static/assets/hierba.png';

        // Set canvas size to match world dimensions
        canvas.width = this.width * this.tileSize;
        canvas.height = this.height * this.tileSize;
    }

    generateWorld() {
        const tiles = [];
        // Create larger irregular island shape with continuous pond
        const islandShape = [
            [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [1,1,1,1,1,1,1,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0]
        ];

        for (let y = 0; y < this.height; y++) {
            tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                const tileType = y < islandShape.length && x < islandShape[0].length ? 
                    islandShape[y][x] : 0;

                switch(tileType) {
                    case 0: // Sky
                        tiles[y][x] = 'sky';
                        break;
                    case 1: // Grass
                        tiles[y][x] = 'grass';
                        break;
                    case 2: // Water
                        tiles[y][x] = 'water';
                        break;
                    default:
                        tiles[y][x] = 'sky';
                }
            }
        }
        return tiles;
    }

    getTileCoords(mouseX, mouseY) {
        const gridX = Math.floor(mouseX / this.tileSize);
        const gridY = Math.floor(mouseY / this.tileSize);
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            return { x: gridX, y: gridY };
        }
        return null;
    }

    isInRange(tileX, tileY, playerX, playerY) {
        const playerTileX = Math.floor(playerX / this.tileSize);
        const playerTileY = Math.floor(playerY / this.tileSize);
        const distance = Math.sqrt(
            Math.pow(tileX - playerTileX, 2) + 
            Math.pow(tileY - playerTileY, 2)
        );
        return distance <= this.actionRange;
    }

    draw(ctx, playerX, playerY) {
        // Draw sky background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const screenX = x * this.tileSize;
                const screenY = y * this.tileSize;

                switch(this.tiles[y][x]) {
                    case 'grass':
                        // Draw grass texture
                        ctx.drawImage(this.grassTexture, screenX, screenY, this.tileSize, this.tileSize);
                        break;
                    case 'water':
                        ctx.fillStyle = '#2196F3';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        // Add water ripple effect
                        ctx.strokeStyle = '#1E88E5';
                        ctx.beginPath();
                        ctx.arc(screenX + this.tileSize/2, screenY + this.tileSize/2, 
                              this.tileSize/4, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                }

                // Draw hover highlight if this is the hovered tile
                if (this.hoveredTile && 
                    this.hoveredTile.x === x && 
                    this.hoveredTile.y === y) {
                    const inRange = this.isInRange(x, y, playerX, playerY);

                    // Save the current context state
                    ctx.save();

                    // Set consistent line properties
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = inRange ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';

                    // Draw the highlight with consistent border width on all sides
                    ctx.strokeRect(screenX + 1, screenY + 1, this.tileSize - 2, this.tileSize - 2);

                    // Restore the context state
                    ctx.restore();
                }
            }
        }
    }
    isTileWalkable(x, y) {
        // Convert pixel coordinates to grid coordinates
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);

        // Check if coordinates are within bounds
        if (gridY >= 0 && gridY < this.height && gridX >= 0 && gridX < this.width) {
            // Return true if the tile is grass (1) or water (2)
            return this.tiles[gridY][gridX] !== 'sky';
        }
        return false;
    }
}