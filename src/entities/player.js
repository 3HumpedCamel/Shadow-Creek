import { CONFIG } from '../config.js';

export class Player {
    constructor(x, y, map) {
        this.x = x;
        this.y = y;
        this.map = map;
        this.speed = CONFIG.PLAYER_SPEED;
        this.size = CONFIG.PLAYER_SIZE;
        this.color = CONFIG.COLORS.player;

        // WASD movement vector
        this.vx = 0;
        this.vy = 0;

        // Click-to-move target
        this.target = null;

        // Facing direction: 'N', 'S', 'E', 'W'
        this.facing = 'S';
    }

    update(dt, inputManager) {
        let moving = false;
        this.vx = 0;
        this.vy = 0;

        // WASD / Arrows
        if (inputManager.isPressed('w') || inputManager.isPressed('arrowup')) { this.vy = -1; moving = true; }
        if (inputManager.isPressed('s') || inputManager.isPressed('arrowdown')) { this.vy = 1; moving = true; }
        if (inputManager.isPressed('a') || inputManager.isPressed('arrowleft')) { this.vx = -1; moving = true; }
        if (inputManager.isPressed('d') || inputManager.isPressed('arrowright')) { this.vx = 1; moving = true; }

        // Interrupt pathing if WASD is pressed
        if (moving) {
            this.target = null;
        }

        // Apply movement vector
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < this.speed * dt) {
                this.x = this.target.x;
                this.y = this.target.y;
                this.target = null;
            } else {
                this.vx = dx / dist;
                this.vy = dy / dist;
            }
        }

        // Normalize velocity
        if (this.vx !== 0 && this.vy !== 0) {
            const len = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            this.vx /= len;
            this.vy /= len;
        }

        // Determine facing
        if (Math.abs(this.vx) > Math.abs(this.vy)) {
            if (this.vx > 0) this.facing = 'E';
            else if (this.vx < 0) this.facing = 'W';
        } else if (this.vy !== 0) {
            if (this.vy > 0) this.facing = 'S';
            else if (this.vy < 0) this.facing = 'N';
        }

        // Proposed new position
        const nx = this.x + this.vx * this.speed * dt;
        const ny = this.y + this.vy * this.speed * dt;

        // Simple AABB Collision against map tiles
        const halfSize = this.size / 2;

        // Check X axis
        const gridX1 = Math.floor((nx - halfSize) / this.map.tileSize);
        const gridX2 = Math.floor((nx + halfSize) / this.map.tileSize);
        const gridY1 = Math.floor((this.y - halfSize) / this.map.tileSize);
        const gridY2 = Math.floor((this.y + halfSize) / this.map.tileSize);

        let collideX = false;
        for(let r=gridY1; r<=gridY2; r++) {
            for(let c=gridX1; c<=gridX2; c++) {
                if(this.map.isCollidable(c, r)) collideX = true;
            }
        }
        if (!collideX) this.x = nx;

        // Check Y axis
        const gridY3 = Math.floor((ny - halfSize) / this.map.tileSize);
        const gridY4 = Math.floor((ny + halfSize) / this.map.tileSize);
        const gridX3 = Math.floor((this.x - halfSize) / this.map.tileSize);
        const gridX4 = Math.floor((this.x + halfSize) / this.map.tileSize);

        let collideY = false;
        for(let r=gridY3; r<=gridY4; r++) {
            for(let c=gridX3; c<=gridX4; c++) {
                if(this.map.isCollidable(c, r)) collideY = true;
            }
        }
        if (!collideY) this.y = ny;
    }

    render(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        ctx.fillStyle = this.color;
        ctx.fillRect(sx - this.size/2, sy - this.size/2, this.size, this.size);

        // Direction indicator
        ctx.fillStyle = '#fff';
        const eyeSize = 4;
        if (this.facing === 'N') ctx.fillRect(sx - eyeSize/2, sy - this.size/2, eyeSize, eyeSize);
        else if (this.facing === 'S') ctx.fillRect(sx - eyeSize/2, sy + this.size/2 - eyeSize, eyeSize, eyeSize);
        else if (this.facing === 'E') ctx.fillRect(sx + this.size/2 - eyeSize, sy - eyeSize/2, eyeSize, eyeSize);
        else if (this.facing === 'W') ctx.fillRect(sx - this.size/2, sy - eyeSize/2, eyeSize, eyeSize);
    }
}
