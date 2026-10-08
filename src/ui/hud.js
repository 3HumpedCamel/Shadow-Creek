export class HUD {
    constructor() {
        this.els = {
            credits: document.getElementById('credit-balance'),
            resources: document.getElementById('resource-counters'),
            invGrid: document.getElementById('inventory-grid'),
            skillMining: document.getElementById('skill-mining'),
            skillElectronics: document.getElementById('skill-electronics'),
            skillGathering: document.getElementById('skill-gathering'),
            skillMetallurgy: document.getElementById('skill-metallurgy'),
            tabs: document.querySelectorAll('.tab-btn'),
            panes: document.querySelectorAll('.tab-pane')
        };

        // Initialize tabs
        this.els.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.els.tabs.forEach(t => t.classList.remove('active'));
                this.els.panes.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    updateInventory(inventory, dropCallback) {
        this.els.invGrid.innerHTML = '';
        for (let i = 0; i < inventory.maxSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';

            if (i < inventory.items.length) {
                const item = inventory.items[i];
                slot.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-count">${item.count}</div>
                `;
                slot.addEventListener('click', () => {
                    if (dropCallback) dropCallback(item.name);
                });
            }

            this.els.invGrid.appendChild(slot);
        }
    }

    updateSkills(skills) {
        const updateSkillUI = (el, name, skillData) => {
            const nameEl = el.querySelector('.skill-name');
            const fillEl = el.querySelector('.progress-fill');
            nameEl.textContent = `${name} (Lv ${skillData.level})`;
            const nextLevelXp = skillData.level * 100;
            const pct = Math.min(100, (skillData.xp / nextLevelXp) * 100);
            fillEl.style.width = `${pct}%`;
        };

        updateSkillUI(this.els.skillMining, 'Mining', skills.mining);
        updateSkillUI(this.els.skillElectronics, 'Electronics', skills.electronics);
        updateSkillUI(this.els.skillGathering, 'Gathering', skills.gathering);
        updateSkillUI(this.els.skillMetallurgy, 'Metallurgy', skills.metallurgy);
    }

    updateTopBar(credits, resourcesCount) {
        this.els.credits.textContent = `Credits: ${credits}`;
        this.els.resources.textContent = `Resources: ${resourcesCount}`;
    }
}
