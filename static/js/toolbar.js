class Toolbar {
    constructor() {
        this.tools = [
            { name: 'Till', key: '1', action: 'till', icon: '/static/assets/hoe.svg' },
            { name: 'Plant', key: '2', action: 'plant', icon: '/static/assets/seed.svg' },
            { name: 'Water', key: '3', action: 'water', icon: '/static/assets/water.svg' },
            { name: 'Harvest', key: '4', action: 'harvest', icon: '/static/assets/harvest.svg' }
        ];
        this.selectedTool = 0;
        this.createToolbar();
        
        // Set initial player tool type to match the selected tool
        if (window.game && window.game.player) {
            window.game.player.toolType = this.tools[this.selectedTool].action;
        }
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar';

        this.tools.forEach((tool, index) => {
            const slot = document.createElement('div');
            slot.className = `toolbar-slot ${index === this.selectedTool ? 'selected' : ''}`;
            
            // Add icon if available
            const iconHTML = tool.icon ? `<img src="${tool.icon}" class="tool-icon" width="32" height="32">` : '';
            
            slot.innerHTML = `
                ${iconHTML}
                <div>${tool.name}</div>
                <span class="key-hint">${tool.key}</span>
            `;
            toolbar.appendChild(slot);
        });

        const toolbarContainer = document.querySelector('.toolbar-container');
        toolbarContainer.appendChild(toolbar);
        this.toolbarElement = toolbar;
    }

    selectTool(index) {
        if (index >= 0 && index < this.tools.length) {
            const oldSelected = this.toolbarElement.querySelector('.selected');
            if (oldSelected) {
                oldSelected.classList.remove('selected');
            }
            this.selectedTool = index;
            this.toolbarElement.children[index].classList.add('selected');
            
            // Update player's tool type to match selected tool
            if (window.game && window.game.player) {
                const toolAction = this.tools[index].action;
                console.log("Toolbar: Setting player tool type to:", toolAction);
                window.game.player.toolType = toolAction;
            }
        }
    }

    getCurrentTool() {
        return this.tools[this.selectedTool];
    }
}