export class InventorySystem {
    constructor(slots = 20) {
        this.maxSlots = slots;
        this.items = []; // Array of { name: string, count: number }
    }

    addItem(itemName, amount = 1) {
        // Check if exists
        const existing = this.items.find(i => i.name === itemName);
        if (existing) {
            existing.count += amount;
            return true;
        }

        // Add new
        if (this.items.length < this.maxSlots) {
            this.items.push({ name: itemName, count: amount });
            return true;
        }

        return false; // Full
    }

    removeItem(itemName, amount = 1) {
        const index = this.items.findIndex(i => i.name === itemName);
        if (index > -1) {
            this.items[index].count -= amount;
            if (this.items[index].count <= 0) {
                this.items.splice(index, 1);
            }
            return true;
        }
        return false;
    }

    isFull() {
        return this.items.length >= this.maxSlots;
    }
}
