class CropManager {
    constructor() {
        this.crops = new Map();
        this.growthStages = ['tilled', 'seeded', 'growing', 'ready'];
        this.growthTime = 8000; // 8 seconds per stage (increased from 5000 to balance with slower movement)

        // Load farmland tile sprite
        this.farmlandSprite = new Image();
        this.farmlandSprite.src = '/static/assets/FarmLand_Tile.png';
    }

    getKey(x, y) {
        return `${x},${y}`;
    }

    tillSoil(x, y) {
        const key = this.getKey(x, y);
        if (!this.crops.has(key)) {
            this.crops.set(key, {
                stage: 'tilled',
                water: 0,
                timeInStage: 0
            });
        }
    }

    plantSeed(x, y) {
        const key = this.getKey(x, y);
        const crop = this.crops.get(key);
        if (crop && crop.stage === 'tilled') {
            crop.stage = 'seeded';
            crop.timeInStage = 0;
            return true;
        }
        return false;
    }

    waterCrop(x, y) {
        const key = this.getKey(x, y);
        const crop = this.crops.get(key);
        if (crop && crop.stage !== 'ready') {
            crop.water = Math.min(crop.water + 1, 3);
        }
    }

    harvestCrop(x, y) {
        const key = this.getKey(x, y);
        const crop = this.crops.get(key);
        if (crop && crop.stage === 'ready') {
            this.crops.delete(key);
            return true;
        }
        return false;
    }

    update() {
        this.crops.forEach((crop, key) => {
            if (crop.water > 0 && crop.stage !== 'tilled' && crop.stage !== 'ready') {
                crop.timeInStage += 16; // Assuming 60fps
                if (crop.timeInStage >= this.growthTime) {
                    const currentIndex = this.growthStages.indexOf(crop.stage);
                    if (currentIndex < this.growthStages.length - 1) {
                        crop.stage = this.growthStages[currentIndex + 1];
                        crop.timeInStage = 0;
                        crop.water = Math.max(0, crop.water - 1);
                    }
                }
            }
        });
    }

    draw(ctx) {
        this.crops.forEach((crop, key) => {
            const [x, y] = key.split(',').map(Number);
            const screenX = x * 32;
            const screenY = y * 32;

            // Draw the farmland tile with improved visual effect based on water level
            ctx.drawImage(this.farmlandSprite, screenX, screenY, 32, 32);
            
            // Add darker tint to soil when watered
            if (crop.water > 0) {
                ctx.fillStyle = `rgba(90, 50, 30, ${crop.water * 0.15})`;
                ctx.fillRect(screenX, screenY, 32, 32);
            }

            // Add growth stage indicators with improved visuals
            if (crop.stage !== 'tilled') {
                const colors = {
                    'seeded': '#8d6e63',
                    'growing': '#81c784',
                    'ready': '#ffeb3b'
                };
                
                if (crop.stage === 'seeded') {
                    // Draw small seed
                    ctx.fillStyle = colors.seeded;
                    ctx.beginPath();
                    ctx.arc(screenX + 16, screenY + 16, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (crop.stage === 'growing') {
                    // Draw small plant
                    ctx.fillStyle = colors.growing;
                    // Plant stem
                    ctx.fillRect(screenX + 15, screenY + 10, 2, 6);
                    // Leaves
                    ctx.beginPath();
                    ctx.ellipse(screenX + 12, screenY + 12, 3, 2, Math.PI / 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(screenX + 19, screenY + 12, 3, 2, -Math.PI / 4, 0, Math.PI * 2);
                    ctx.fill();
                } else if (crop.stage === 'ready') {
                    // Draw mature plant
                    // Plant stem
                    ctx.fillStyle = '#558b2f';
                    ctx.fillRect(screenX + 15, screenY + 8, 2, 10);
                    // Crop product
                    ctx.fillStyle = colors.ready;
                    ctx.beginPath();
                    ctx.arc(screenX + 16, screenY + 8, 5, 0, Math.PI * 2);
                    ctx.fill();
                    // Leaves
                    ctx.fillStyle = '#7cb342';
                    ctx.beginPath();
                    ctx.ellipse(screenX + 11, screenY + 14, 4, 2, Math.PI / 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(screenX + 21, screenY + 14, 4, 2, -Math.PI / 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw water level indicator with improved visibility
            if (crop.water > 0) {
                ctx.fillStyle = 'rgba(33, 150, 243, 0.8)';
                ctx.fillRect(screenX, screenY, 32 * (crop.water / 3), 4);
                ctx.strokeStyle = 'rgba(25, 118, 210, 0.8)';
                ctx.strokeRect(screenX, screenY, 32, 4);
            }
        });
    }
}