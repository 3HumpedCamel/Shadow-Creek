export class InputManager {
    constructor(canvasEngine) {
        this.canvasEngine = canvasEngine;
        this.keys = {};
        this.mouse = {
            clicked: false,
            worldX: 0,
            worldY: 0,
            screenX: 0,
            screenY: 0
        };

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        const canvas = this.canvasEngine.canvas;
        canvas.addEventListener('mousedown', (e) => {
            if(e.button === 0) { // left click
                const rect = canvas.getBoundingClientRect();
                const sx = e.clientX - rect.left;
                const sy = e.clientY - rect.top;

                this.mouse.screenX = sx;
                this.mouse.screenY = sy;

                const worldPos = this.canvasEngine.screenToWorld(sx, sy);
                this.mouse.worldX = worldPos.x;
                this.mouse.worldY = worldPos.y;
                this.mouse.clicked = true;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.screenX = e.clientX - rect.left;
            this.mouse.screenY = e.clientY - rect.top;

            const worldPos = this.canvasEngine.screenToWorld(this.mouse.screenX, this.mouse.screenY);
            this.mouse.worldHoverX = worldPos.x;
            this.mouse.worldHoverY = worldPos.y;
        });
    }

    isPressed(key) {
        return !!this.keys[key];
    }

    consumeClick() {
        if(this.mouse.clicked) {
            this.mouse.clicked = false;
            return { x: this.mouse.worldX, y: this.mouse.worldY };
        }
        return null;
    }
}
