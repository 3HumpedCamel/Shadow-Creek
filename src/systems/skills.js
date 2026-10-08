export class SkillsManager {
    constructor() {
        this.skills = {
            mining: { xp: 0, level: 1 },
            electronics: { xp: 0, level: 1 },
            gathering: { xp: 0, level: 1 },
            metallurgy: { xp: 0, level: 1 }
        };
    }

    addXp(skillId, amount) {
        if (!this.skills[skillId]) return false;

        this.skills[skillId].xp += amount;

        // Simple level curve
        const nextLevelXp = this.skills[skillId].level * 100;
        let leveledUp = false;
        if (this.skills[skillId].xp >= nextLevelXp) {
            this.skills[skillId].level++;
            // Don't carry over xp for simplicity in this demo, just reset to next tier threshold
            this.skills[skillId].xp = 0;
            leveledUp = true;
        }

        return {
            level: this.skills[skillId].level,
            xp: this.skills[skillId].xp,
            leveledUp: leveledUp
        };
    }

    getSkill(skillId) {
        return this.skills[skillId];
    }
}
