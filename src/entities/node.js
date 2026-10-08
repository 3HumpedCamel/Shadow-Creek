import { CONFIG } from '../config.js';

export class ResourceNode {
    constructor(id, x, y, type) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 20;

        // Setup specifics based on type
        switch(type) {
            case 'Plasma Quartz Vein':
                this.color = CONFIG.COLORS.nodeQuartz;
                this.yieldItem = 'Raw Oxite Ore';
                this.yieldSkill = 'mining';
                this.xp = 25;
                break;
            case 'Salvage Conduit':
                this.color = CONFIG.COLORS.nodeScrap;
                this.yieldItem = 'Scrap Electronics';
                this.yieldSkill = 'electronics';
                this.xp = 20;
                break;
            case 'Alien Fungi Patch':
                this.color = CONFIG.COLORS.nodeFungi;
                this.yieldItem = 'Bioluminescent Spores';
                this.yieldSkill = 'gathering';
                this.xp = 15;
                break;
        }

        this.interactRange = 40;
        this.isBeingHarvested = false;
        this.harvestTimeMax = 2.0; // 2 seconds
        this.harvestTimeCurrent = 0;
    }

    startHarvest() {
        if (!this.isBeingHarvested) {
            this.isBeingHarvested = true;
            this.harvestTimeCurrent = 0;
            return true;
        }
        return false;
    }

    cancelHarvest() {
        this.isBeingHarvested = false;
        this.harvestTimeCurrent = 0;
    }

    update(dt) {
        if (this.isBeingHarvested) {
            this.harvestTimeCurrent += dt;
            if (this.harvestTimeCurrent >= this.harvestTimeMax) {
                this.isBeingHarvested = false;
                this.harvestTimeCurrent = 0;
                // Harvesting complete signal handled by the main loop/system
                return { complete: true, item: this.yieldItem, skill: this.yieldSkill, xp: this.xp };
            }
        }
        return null;
    }

    render(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(sx, sy, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // Timer bar
        if (this.isBeingHarvested) {
            const barWidth = 30;
            const barHeight = 4;
            const pct = this.harvestTimeCurrent / this.harvestTimeMax;

            ctx.fillStyle = '#000';
            ctx.fillRect(sx - barWidth/2, sy - this.size - 10, barWidth, barHeight);

            ctx.fillStyle = '#4caf50';
            ctx.fillRect(sx - barWidth/2, sy - this.size - 10, barWidth * pct, barHeight);
        }
    }
}
