class Inventory {
    constructor() {
        this.items = {
            seeds: 10,  // Starting with 10 seeds
            crops: 0
        };
        this.element = document.getElementById('inventory');
        this.render();
    }

    hasSeeds() {
        return this.items.seeds > 0;
    }

    useItem(item) {
        if (this.items[item] > 0) {
            this.items[item]--;
            this.render();
        }
    }

    addItem(item, amount) {
        this.items[item] += amount;
        this.render();
    }

    render() {
        this.element.innerHTML = '';
        Object.entries(this.items).forEach(([item, count]) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.textContent = `${item}: ${count}`;
            this.element.appendChild(itemElement);
        });
    }
}