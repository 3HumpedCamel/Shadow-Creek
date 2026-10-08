import { CONFIG } from '../config.js';

export class GameMap {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.tileSize = CONFIG.TILE_SIZE;
        this.pixelWidth = this.cols * this.tileSize;
        this.pixelHeight = this.rows * this.tileSize;

        // 1D array for tiles: 0 = grass, 1 = dirt road, 2 = building, 3 = fence (collidable), 4 = tree (collidable)
        this.tiles = new Array(this.cols * this.rows).fill(0);
    }

    getTile(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return -1;
        return this.tiles[row * this.cols + col];
    }

    setTile(col, row, value) {
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            this.tiles[row * this.cols + col] = value;
        }
    }

    isCollidable(col, row) {
        const tile = this.getTile(col, row);
        return tile === -1 || tile === 2 || tile === 3 || tile === 4; // Bounds or collidable tiles
    }

    pixelToGrid(x, y) {
        return {
            col: Math.floor(x / this.tileSize),
            row: Math.floor(y / this.tileSize)
        };
    }
}
