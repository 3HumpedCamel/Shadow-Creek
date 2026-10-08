export class EntityManager {
    constructor() {
        this.entities = [];
    }

    add(entity) {
        this.entities.push(entity);
    }

    remove(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    update(dt) {
        for (const entity of this.entities) {
            if (entity.update) entity.update(dt);
        }
    }

    render(ctx, camera) {
        // Sort by Y for simple depth rendering
        this.entities.sort((a, b) => a.y - b.y);
        for (const entity of this.entities) {
            if (entity.render) entity.render(ctx, camera);
        }
    }

    getEntitiesInRange(x, y, range) {
        return this.entities.filter(e => {
            const dx = e.x - x;
            const dy = e.y - y;
            return (dx*dx + dy*dy) <= range*range;
        });
    }
}
