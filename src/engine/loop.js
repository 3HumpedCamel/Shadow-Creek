export class GameLoop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;

        this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 1 / 60; // Fixed timestep 60fps
        this.running = false;

        this.loop = this.loop.bind(this);
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    stop() {
        this.running = false;
    }

    loop(time) {
        if (!this.running) return;

        let frameTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // Prevent spiral of death
        if (frameTime > 0.25) frameTime = 0.25;

        this.accumulator += frameTime;

        while (this.accumulator >= this.deltaTime) {
            this.updateFn(this.deltaTime);
            this.accumulator -= this.deltaTime;
        }

        // Pass alpha (accumulator / deltaTime) for potential render interpolation if desired
        this.renderFn(this.accumulator / this.deltaTime);

        requestAnimationFrame(this.loop);
    }
}
