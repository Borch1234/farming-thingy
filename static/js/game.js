class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.world = new World(this.canvas);
        this.crops = new CropManager();
        this.inventory = new Inventory();
        this.toolbar = new Toolbar();
        
        // Make global for easy reference
        window.game = this;
        
        // Initialize player after setting window.game 
        // so player can reference it during initialization
        this.player = new Player(400, 300);

        this.activeKeys = new Set();
        this.setupEventListeners();
        this.setCanvasSize(); 
        this.gameLoop();
        
        // Log for debugging
        console.log("Game initialized with toolbar:", this.toolbar);
    }

    setCanvasSize() {
        this.canvas.width = this.world.width * this.world.tileSize;
        this.canvas.height = this.world.height * this.world.tileSize;
    }

    handleInput() {
        let isMoving = false;

        // Handle movement with boundaries matching the world size
        if (this.activeKeys.has('arrowup') || this.activeKeys.has('w')) {
            this.player.move('up', this.world);
            isMoving = true;
        }
        if (this.activeKeys.has('arrowdown') || this.activeKeys.has('s')) {
            this.player.move('down', this.world);
            isMoving = true;
        }
        if (this.activeKeys.has('arrowleft') || this.activeKeys.has('a')) {
            this.player.move('left', this.world);
            isMoving = true;
        }
        if (this.activeKeys.has('arrowright') || this.activeKeys.has('d')) {
            this.player.move('right', this.world);
            isMoving = true;
        }

        // Update player movement state
        this.player.isMoving = isMoving;
    }

    handleToolAction(tileX, tileY) {
        if (!this.world.isInRange(tileX, tileY, this.player.x, this.player.y)) {
            return; // Tile is out of range
        }

        const currentTool = this.toolbar.getCurrentTool();
        
        // For all tools, make the player face the clicked tile
        this.updatePlayerDirection(tileX, tileY);
        
        switch (currentTool.action) {
            case 'till':
                // Start tilling animation 
                this.player.startToolAnimation('till');
                
                // After animation completes, till the soil
                this.crops.tillSoil(tileX, tileY);
                break;
            case 'plant':
                if (this.inventory.hasSeeds()) {
                    // Start planting animation
                    this.player.startToolAnimation('plant');
                    
                    // Plant seed after animation
                    if (this.crops.plantSeed(tileX, tileY)) {
                        this.inventory.useItem('seeds');
                    }
                }
                break;
            case 'water':
                // Start watering animation with water particles
                this.player.startWatering(); // This calls startToolAnimation('water')
                
                // Water the crop
                this.crops.waterCrop(tileX, tileY);
                break;
            case 'harvest':
                // Start harvesting animation
                this.player.startToolAnimation('harvest');
                
                // Harvest after animation
                const harvested = this.crops.harvestCrop(tileX, tileY);
                if (harvested) {
                    this.inventory.addItem('crops', 1);
                    this.inventory.addItem('seeds', 2);
                }
                break;
        }
    }
    
    updatePlayerDirection(tileX, tileY) {
        // Calculate the relative position of the tile to the player
        const playerTileX = Math.floor(this.player.x / this.world.tileSize);
        const playerTileY = Math.floor(this.player.y / this.world.tileSize);
        
        // Calculate the delta positions
        const dx = tileX - playerTileX;
        const dy = tileY - playerTileY;
        
        // Determine the dominant direction
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal direction is dominant
            this.player.direction = dx > 0 ? 'right' : 'left';
        } else {
            // Vertical direction is dominant
            this.player.direction = dy > 0 ? 'down' : 'up';
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.activeKeys.add(key);

            // Handle number keys for tool selection
            if (key >= '1' && key <= '4') {
                this.toolbar.selectTool(parseInt(key) - 1);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.activeKeys.delete(e.key.toLowerCase());
        });

        // Add mouse move event listener
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.world.hoveredTile = this.world.getTileCoords(mouseX, mouseY);
        });

        // Add click event listener
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const tileCoords = this.world.getTileCoords(mouseX, mouseY);

            if (tileCoords) {
                this.handleToolAction(tileCoords.x, tileCoords.y);
            }
        });

        // Clear hover state when mouse leaves canvas
        this.canvas.addEventListener('mouseleave', () => {
            this.world.hoveredTile = null;
        });
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.handleInput();
        this.crops.update();

        this.world.draw(this.ctx, this.player.x, this.player.y);
        this.crops.draw(this.ctx);
        this.player.draw(this.ctx);

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.onload = () => {
    new Game();
};