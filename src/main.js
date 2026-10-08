import { CONFIG } from './config.js';
import { CanvasEngine } from './engine/canvas.js';
import { InputManager } from './engine/input.js';
import { GameLoop } from './engine/loop.js';

import { generateCampGorian } from './world/procedural.js';
import { EntityManager } from './world/entities.js';

import { Player } from './entities/player.js';
import { ResourceNode } from './entities/node.js';

import { SkillsManager } from './systems/skills.js';
import { InventorySystem } from './systems/inventory.js';
import { PersistenceSystem } from './systems/persistence.js';

import { HUD } from './ui/hud.js';
import { EventLog } from './ui/log.js';

class Game {
    constructor() {
        this.engine = new CanvasEngine('game-canvas');
        this.input = new InputManager(this.engine);

        this.map = generateCampGorian(CONFIG.MAP_COLS, CONFIG.MAP_ROWS);
        this.entityManager = new EntityManager();

        this.skills = new SkillsManager();
        this.inventory = new InventorySystem();
        this.persistence = new PersistenceSystem();

        this.hud = new HUD();
        this.log = new EventLog();

        // Spawn Player roughly in middle
        const startX = (CONFIG.MAP_COLS / 2) * CONFIG.TILE_SIZE;
        const startY = (CONFIG.MAP_ROWS / 2) * CONFIG.TILE_SIZE;
        this.player = new Player(startX, startY, this.map);

        // Spawn some nodes around the map
        this.nodes = [
            new ResourceNode('node1', startX + 100, startY + 50, 'Plasma Quartz Vein'),
            new ResourceNode('node2', startX - 100, startY - 80, 'Salvage Conduit'),
            new ResourceNode('node3', startX + 50, startY - 120, 'Alien Fungi Patch')
        ];

        this.nodes.forEach(n => this.entityManager.add(n));

        this.loop = new GameLoop(this.update.bind(this), this.render.bind(this));

        this.saveTimer = 0;
    }

    async init() {
        // Load state
        const savedData = await this.persistence.loadPlayerState();
        if (savedData) {
            this.player.x = savedData.x;
            this.player.y = savedData.y;
            // Restore inventory & skills
            this.inventory.items = savedData.inventory || [];
            if(savedData.skills) this.skills.skills = savedData.skills;
            this.log.add('Save state loaded.', 'system');
        } else {
            this.log.add('New game started.', 'system');
        }

        this.updateUI();
        this.loop.start();
    }

    updateUI() {
        this.hud.updateInventory(this.inventory, (itemName) => {
            if (this.inventory.removeItem(itemName, 1)) {
                this.log.add(`You dropped 1x ${itemName}.`, 'system');
                this.updateUI();
                this.saveGame();
            }
        });
        this.hud.updateSkills(this.skills.skills);

        const totalItems = this.inventory.items.reduce((sum, item) => sum + item.count, 0);
        this.hud.updateTopBar(0, totalItems);
    }

    async saveGame() {
        const data = {
            x: this.player.x,
            y: this.player.y,
            inventory: this.inventory.items,
            skills: this.skills.skills
        };
        await this.persistence.savePlayerState(data);
        this.log.add('Game saved.', 'system');
    }

    update(dt) {
        // Update player
        this.player.update(dt, this.input);

        // Update entities (nodes)
        for(let node of this.nodes) {
            const result = node.update(dt);
            if (result && result.complete) {
                // Harvesting done
                if (this.inventory.isFull() && !this.inventory.items.find(i => i.name === result.item)) {
                    this.log.warn('Inventory full! Cannot gather ' + result.item);
                } else {
                    this.inventory.addItem(result.item, 1);
                    const xpResult = this.skills.addXp(result.skill, result.xp);

                    this.log.xp(`You extract 1x ${result.item} (+${result.xp} ${result.skill} XP)`);
                    if (xpResult.leveledUp) {
                        this.log.xp(`Level Up! ${result.skill} is now level ${xpResult.level}`);
                    }

                    this.updateUI();
                    this.saveGame(); // Save on gather
                }
            }
        }

        // Interaction Logic & Click-to-move
        const clickTarget = this.input.consumeClick();
        if (clickTarget) {
            const mx = clickTarget.x;
            const my = clickTarget.y;

            let clickedNode = false;
            for(let node of this.nodes) {
                const dx = node.x - mx;
                const dy = node.y - my;
                if (Math.sqrt(dx*dx + dy*dy) <= node.size) {
                    clickedNode = true;
                    // Check range
                    const pdx = node.x - this.player.x;
                    const pdy = node.y - this.player.y;
                    if (Math.sqrt(pdx*pdx + pdy*pdy) <= node.interactRange) {
                        if (this.inventory.isFull() && !this.inventory.items.find(i => i.name === node.yieldItem)) {
                            this.log.warn('Inventory full!');
                        } else {
                            if(node.startHarvest()) {
                                // Stop player moving
                                this.player.target = null;
                            }
                        }
                    } else {
                        this.log.warn('Too far away to interact.');
                    }
                }
            }

            // If click was not on a node, set click-to-move target
            if (!clickedNode) {
                this.player.target = clickTarget;
                this.nodes.forEach(n => n.cancelHarvest());
            }
        }

        // Cancel harvest if player moves out of range
        for(let node of this.nodes) {
            if (node.isBeingHarvested) {
                const pdx = node.x - this.player.x;
                const pdy = node.y - this.player.y;
                if (Math.sqrt(pdx*pdx + pdy*pdy) > node.interactRange) {
                    node.cancelHarvest();
                    this.log.warn('Harvest cancelled (moved too far).');
                }
            }
        }

        // Auto save
        this.saveTimer += dt * 1000;
        if (this.saveTimer >= CONFIG.SAVE_INTERVAL) {
            this.saveTimer = 0;
            this.saveGame();
        }

        // Update Camera
        this.engine.updateCamera(this.player.x, this.player.y, this.map.pixelWidth, this.map.pixelHeight, dt);
    }

    render(alpha) {
        this.engine.clear();

        // Render Map
        const startCol = Math.max(0, Math.floor(this.engine.camera.x / this.map.tileSize));
        const endCol = Math.min(this.map.cols, startCol + Math.ceil(this.engine.camera.width / this.map.tileSize) + 1);
        const startRow = Math.max(0, Math.floor(this.engine.camera.y / this.map.tileSize));
        const endRow = Math.min(this.map.rows, startRow + Math.ceil(this.engine.camera.height / this.map.tileSize) + 1);

        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const tile = this.map.getTile(c, r);
                const sx = c * this.map.tileSize - this.engine.camera.x;
                const sy = r * this.map.tileSize - this.engine.camera.y;

                switch(tile) {
                    case 0: this.engine.ctx.fillStyle = CONFIG.COLORS.grass; break;
                    case 1: this.engine.ctx.fillStyle = CONFIG.COLORS.dirt; break;
                    case 2: this.engine.ctx.fillStyle = CONFIG.COLORS.building; break;
                    case 3: this.engine.ctx.fillStyle = CONFIG.COLORS.fence; break;
                    case 4: this.engine.ctx.fillStyle = '#2e7d32'; break; // tree
                    default: this.engine.ctx.fillStyle = '#000';
                }

                this.engine.ctx.fillRect(sx, sy, this.map.tileSize, this.map.tileSize);

                // Draw grid lines optional for debugging
                // this.engine.ctx.strokeStyle = '#222';
                // this.engine.ctx.strokeRect(sx, sy, this.map.tileSize, this.map.tileSize);
            }
        }

        // Render Entities
        this.entityManager.render(this.engine.ctx, this.engine.camera);

        // Render Player
        this.player.render(this.engine.ctx, this.engine.camera);
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();

    // Initial UI setup
    game.hud.updateInventory(game.inventory);
});
