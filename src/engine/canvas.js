import { CONFIG } from '../config.js';

export class CanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Ensure exact config size
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        this.camera = {
            x: 0,
            y: 0,
            width: CONFIG.CANVAS_WIDTH,
            height: CONFIG.CANVAS_HEIGHT
        };
    }

    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // World coordinates to screen coordinates
    worldToScreen(wx, wy) {
        return {
            x: wx - this.camera.x,
            y: wy - this.camera.y
        };
    }

    // Screen coordinates to world coordinates
    screenToWorld(sx, sy) {
        return {
            x: sx + this.camera.x,
            y: sy + this.camera.y
        };
    }

    // Update camera to follow target smoothly (lerp)
    updateCamera(targetX, targetY, mapPixelWidth, mapPixelHeight, dt) {
        // Ideal camera center
        const targetCamX = targetX - this.camera.width / 2;
        const targetCamY = targetY - this.camera.height / 2;

        // Lerp
        const lerpFactor = 5 * dt; // 5 is smoothness factor
        this.camera.x += (targetCamX - this.camera.x) * lerpFactor;
        this.camera.y += (targetCamY - this.camera.y) * lerpFactor;

        // Clamp to map bounds
        this.camera.x = Math.max(0, Math.min(this.camera.x, mapPixelWidth - this.camera.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, mapPixelHeight - this.camera.height));
    }
}
