import { GameMap } from './map.js';

export function generateCampGorian(cols, rows) {
    const map = new GameMap(cols, rows);

    // Fill with grass (0)
    for (let i = 0; i < cols * rows; i++) {
        map.tiles[i] = 0;
    }

    // Add perimeter fence (3)
    for (let c = 0; c < cols; c++) {
        map.setTile(c, 0, 3);
        map.setTile(c, rows - 1, 3);
    }
    for (let r = 0; r < rows; r++) {
        map.setTile(0, r, 3);
        map.setTile(cols - 1, r, 3);
    }

    // Dirt road (1) down the middle and branching
    const midCol = Math.floor(cols / 2);
    for (let r = 1; r < rows - 1; r++) {
        map.setTile(midCol, r, 1);
        map.setTile(midCol - 1, r, 1);
        map.setTile(midCol + 1, r, 1);
    }
    for (let c = 5; c < midCol; c++) {
        map.setTile(c, Math.floor(rows/2), 1);
        map.setTile(c, Math.floor(rows/2)+1, 1);
    }

    // Building (2) - Company Store
    for(let r = 5; r < 12; r++) {
        for(let c = 5; c < 15; c++) {
            map.setTile(c, r, 2);
        }
    }

    // Mine Shaft portal (fake building for now)
    for(let r = rows - 10; r < rows - 5; r++) {
        for(let c = midCol + 5; c < midCol + 12; c++) {
            map.setTile(c, r, 2);
        }
    }

    // Random Trees (4)
    for (let i = 0; i < 150; i++) {
        let c = Math.floor(Math.random() * cols);
        let r = Math.floor(Math.random() * rows);
        if (map.getTile(c, r) === 0) {
            map.setTile(c, r, 4);
        }
    }

    return map;
}
