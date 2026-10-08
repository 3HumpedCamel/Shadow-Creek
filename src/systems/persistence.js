export class PersistenceSystem {
    constructor(saveKey = 'shadowCreekSave') {
        this.saveKey = saveKey;
    }

    async savePlayerState(playerData) {
        // Mock async for Cloudflare D1 readiness
        return new Promise((resolve) => {
            try {
                const dataString = JSON.stringify(playerData);
                localStorage.setItem(this.saveKey, dataString);
                resolve(true);
            } catch (e) {
                console.error("Save failed", e);
                resolve(false);
            }
        });
    }

    async loadPlayerState() {
        return new Promise((resolve) => {
            try {
                const dataString = localStorage.getItem(this.saveKey);
                if (dataString) {
                    resolve(JSON.parse(dataString));
                } else {
                    resolve(null);
                }
            } catch (e) {
                console.error("Load failed", e);
                resolve(null);
            }
        });
    }
}
