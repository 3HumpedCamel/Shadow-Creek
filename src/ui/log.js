export class EventLog {
    constructor() {
        this.container = document.getElementById('event-log');
        this.maxLines = 50;
    }

    add(message, type = 'system') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;

        this.container.appendChild(entry);

        while (this.container.children.length > this.maxLines) {
            this.container.removeChild(this.container.firstChild);
        }

        // Auto-scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }

    warn(message) {
        this.add(message, 'warn');
    }

    xp(message) {
        this.add(message, 'xp');
    }
}
