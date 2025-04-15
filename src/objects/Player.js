class Player {
    constructor(id, color) {
        this.id = id;
        this.color = color;
        this.armies = 0;
        this.territories = [];
        this.reinforcements = 0;
        this.cards = [];
    }

    // Calculate reinforcements based on territories and continents
    calculateReinforcements(continents) {
        // Base reinforcements from territories
        let reinforcements = Math.max(Math.floor(this.territories.length / 3), 3);

        // Additional reinforcements from continents
        for (const continent of Object.keys(continents)) {
            const continentTerritories = continents[continent].territories;
            const playerOwnsAll = continentTerritories.every(territoryId =>
                this.territories.includes(territoryId)
            );

            if (playerOwnsAll) {
                reinforcements += continents[continent].bonus;
            }
        }

        return reinforcements;
    }

    // Add a card to player's hand
    addCard(card) {
        this.cards.push(card);
    }

    // Remove a card from player's hand
    removeCard(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.cards.length) {
            return this.cards.splice(cardIndex, 1)[0];
        }
        return null;
    }
}