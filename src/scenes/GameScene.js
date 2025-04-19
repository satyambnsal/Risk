const territoriesData = [
    // North America (Red) - 4 territories
    { id: 0, name: 'NA-1', x: 155, y: 240, continent: 'North America' },
    { id: 1, name: 'NA-2', x: 152, y: 162, continent: 'North America' },
    { id: 2, name: 'NA-3', x: 240, y: 186, continent: 'North America' },
    { id: 3, name: 'NA-4', x: 201, y: 115, continent: 'North America' },

    // Europe (Green) - 6 territories
    { id: 4, name: 'EU-1', x: 516, y: 247, continent: 'Europe' },
    { id: 5, name: 'EU-2', x: 440, y: 88, continent: 'Europe' },
    { id: 6, name: 'EU-3', x: 523, y: 123, continent: 'Europe' },
    { id: 7, name: 'EU-4', x: 454, y: 200, continent: 'Europe' },
    { id: 8, name: 'EU-5', x: 423, y: 150, continent: 'Europe' },
    { id: 9, name: 'EU-6', x: 543, y: 182, continent: 'Europe' },

    // Africa (Blue) - 5 territories
    { id: 10, name: 'AF-1', x: 339, y: 223, continent: 'Africa' },
    { id: 11, name: 'AF-2', x: 386, y: 263, continent: 'Africa' },
    { id: 12, name: 'AF-3', x: 384, y: 348, continent: 'Africa' },
    { id: 13, name: 'AF-4', x: 298, y: 375, continent: 'Africa' },
    { id: 14, name: 'AF-5', x: 308, y: 296, continent: 'Africa' },

    // South America (Yellow) - 5 territories
    { id: 15, name: 'SA-1', x: 155, y: 355, continent: 'South America' },
    { id: 16, name: 'SA-2', x: 140, y: 416, continent: 'South America' },
    { id: 17, name: 'SA-3', x: 199, y: 427, continent: 'South America' },
    { id: 18, name: 'SA-4', x: 155, y: 504, continent: 'South America' },
    { id: 19, name: 'SA-5', x: 241, y: 494, continent: 'South America' },

    // Australia (Purple) - 5 territories
    { id: 20, name: 'AU-1', x: 510, y: 345, continent: 'Australia' },
    { id: 21, name: 'AU-2', x: 450, y: 424, continent: 'Australia' },
    { id: 22, name: 'AU-3', x: 569, y: 411, continent: 'Australia' },
    { id: 23, name: 'AU-4', x: 508, y: 497, continent: 'Australia' },
    { id: 24, name: 'AU-5', x: 430, y: 509, continent: 'Australia' }
];

const adjacencyMapData = {
    // North America connections
    0: [1, 2, 15],          // NA-1 connects to NA-2, NA-3, SA-1
    1: [0, 2, 3],           // NA-2 connects to NA-1, NA-3, NA-4
    2: [0, 1, 3, 8, 10],    // NA-3 connects to NA-1, NA-2, NA-4, EU-5, AF-1
    3: [1, 2, 5],           // NA-4 connects to NA-2, NA-3, EU-2

    // Europe connections
    4: [7, 9, 11, 20],      // EU-1 connects to EU-4, EU-6, AF-2, AU-1
    5: [3, 6, 8],           // EU-2 connects to NA-4, EU-3, EU-5
    6: [5, 7, 8, 9],        // EU-3 connects to EU-2, EU-4, EU-5, EU-6
    7: [4, 6, 9, 11],       // EU-4 connects to EU-1, EU-3, EU-6, AF-2
    8: [2, 5, 6, 10],       // EU-5 connects to NA-3, EU-2, EU-3, AF-1
    9: [4, 6, 7],           // EU-6 connects to EU-1, EU-3, EU-4

    // Africa connections
    10: [2, 8, 11, 14],     // AF-1 connects to NA-3, EU-5, AF-2, AF-5
    11: [4, 7, 10, 12, 20, 14], // AF-2 connects to EU-1, EU-4, AF-1, AF-3, AU-1, AF-5
    12: [11, 13, 14, 20, 21],      // AF-3 connects to AF-2, AF-4, AF-5, AU-1, AU-2
    13: [12, 14, 21, 17],       // AF-4 connects to AF-3, AF-5, AU-2, SF-3
    14: [10, 11, 12, 13, 15],       // AF-5  connects to AF-1, AF-2, AF-3, AF-4, SA-1

    // South America connections
    15: [0, 16, 17, 14],    // SA-1 connects to NA-1,, SA-2, SA-3, AF-5
    16: [15, 17, 18],       // SA-2 connects to SA-1, SA-3, SA-4
    17: [15, 16, 18, 19, 13],   // SA-3 connects to SA-1, SA-2, SA-4, SA-5, AF-4
    18: [16, 17, 19],       // SA-4 connects to SA-2, SA-3, SA-5
    19: [17, 18, 24],   // SA-5 connects to  SA-3, SA-4, AU-5

    // Australia connections
    20: [4, 11, 13, 21, 22],// AU-1 connects to EU-1, AF-2, AF-3, AU-2, AU-3
    21: [12, 13, 20, 22, 23, 24], // AU-2 connects to AF-3, AF-4,  AU-1, AU-3, AU-4, AU-5
    22: [20, 21, 23],   // AU-3 connects to AU-1, AU-2, AU-4
    23: [21, 22, 24],       // AU-4 connects to  AU-2, AU-3, AU-5
    24: [19, 21, 23]        // AU-5 connects to SA-5, AU-2, AU-4
};


// Define continents and their bonus values
const continentsData = {
    'North America': { territories: [0, 1, 2, 3], bonus: 5 },
    'Europe': { territories: [4, 5, 6, 7, 8, 9], bonus: 5 },
    'Africa': { territories: [10, 11, 12, 13, 14], bonus: 3 },
    'South America': { territories: [15, 16, 17, 18, 19], bonus: 2 },
    'Australia': { territories: [20, 21, 22, 23, 24], bonus: 2 }
};

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.territories = [];
        this.adjacencyMap = adjacencyMapData;
        this.phaseText = null;
        this.playerText = null;
        this.actionText = null;
        this.diceResults = [];
        this.continents = continentsData;
    }

    create() {
        // Add a dark background
        this.add.rectangle(600, 400, 1200, 800, 0x000000).setOrigin(0.5);

        // Create territories
        this.createTerritories();

        // Draw connection lines between territories
        this.drawConnectionLines();

        // Initialize game info display
        this.setupGameInfo();

        // Create dice display
        this.createDiceDisplay();

        // Create action button
        this.setupButtons();

        // Start the initial placement phase
        this.startPlacementPhase();
    }

    createTerritories() {
        // Create territory objects
        this.territories = territoriesData.map(data => {
            const territory = new Territory(
                this,
                data.x,
                data.y,
                data.name,
                data.id,
                data.continent
            );
            return territory;
        });
    }

    drawConnectionLines() {
        // Create a graphics object for drawing lines
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x444444, 0.8);

        // Draw lines between adjacent territories
        for (let i = 0; i < this.territories.length; i++) {
            const territory = this.territories[i];
            const adjacentIds = this.adjacencyMap[territory.id];

            for (let j = 0; j < adjacentIds.length; j++) {
                const adjacentId = adjacentIds[j];

                // Only draw each connection once
                if (adjacentId > territory.id) {
                    const adjacentTerritory = this.territories.find(t => t.id === adjacentId);
                    graphics.lineBetween(
                        territory.territoryImage.x,
                        territory.territoryImage.y,
                        adjacentTerritory.territoryImage.x,
                        adjacentTerritory.territoryImage.y
                    );
                }
            }
        }
    }

    setupGameInfo() {
        // Background for game info
        this.add.rectangle(950, 400, 340, 750, 0x222222);

        // Game phase text
        this.phaseText = this.add.text(950, 100, "Phase: Placement", {
            fontSize: "20px",
            fill: "#FFF"
        }).setOrigin(0.5);

        // Current player text
        this.playerText = this.add.text(950, 140, "Player: 1", {
            fontSize: "20px",
            fill: "#FFF"
        }).setOrigin(0.5);

        // Action text/Instructions
        this.actionText = this.add.text(950, 180, "Place your armies", {
            fontSize: "16px",
            fill: "#FFF",
            align: "center",
            wordWrap: { width: 280 }
        }).setOrigin(0.5);

        // Dice results (will be updated during battles)
        this.diceText = this.add.text(950, 240, "", {
            fontSize: "16px",
            fill: "#FFF",
            align: "center"
        }).setOrigin(0.5);

        // Continent bonus information
        // yPos = y position
        let yPos = 500;
        this.add.text(950, yPos, "Continent Bonuses:", {
            fontSize: "16px",
            fill: "#FFF",
            fontStyle: "bold"
        }).setOrigin(0.5);

        yPos += 30;
        for (const continent in this.continents) {
            this.add.text(950, yPos, `${continent}: +${this.continents[continent].bonus}`, {
                fontSize: "14px",
                fill: "#FFF"
            }).setOrigin(0.5);
            yPos += 20;
        }
    }

    setupButtons() {
        // End turn button
        this.endTurnButton = this.add.rectangle(950, 700, 240, 40, 0x444444).setInteractive();
        this.endTurnText = this.add.text(950, 700, "End Phase", {
            fontSize: "18px",
            fill: "#FFF"
        }).setOrigin(0.5);

        this.endTurnButton.on('pointerdown', () => {
            this.endTurn();
        });

        this.endTurnButton.on("pointerover", () => {
            this.endTurnButton.setFillStyle(0x666666);
        });

        this.endTurnButton.on("pointerout", () => {
            this.endTurnButton.setFillStyle(0x444444);
        });

        // Initially disable end turn button during placement
        this.endTurnButton.disableInteractive();
        this.endTurnButton.setFillStyle(0x333333);
    }

    startPlacementPhase() {
        window.gameVars.gamePhase = "initialPlacement";
        window.gameVars.initialPlacementDone = false;
        this.phaseText.setText("Phase: Initial Placement");

        // Calculate initial armies based on players
        const numPlayers = window.gameVars.players.length;
        const initialArmies = Math.max(40 - (numPlayers - 2) * 5, 20);

        window.gameVars.players.forEach(player => {
            player.armies = initialArmies;
            player.reinforcements = initialArmies;
        });

        // Randomly assign territories to players
        this.assignTerritories();

        // Update display
        this.updateGameInfo();

        // Disable end turn button during initial placement
        this.endTurnButton.disableInteractive();
        this.endTurnButton.setFillStyle(0x333333);
    }

    assignTerritories() {
        // Create a copy of territory IDs
        const territoryIds = this.territories.map(t => t.id);

        // Shuffle territory Ids
        for (let i = territoryIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [territoryIds[i], territoryIds[j]] = [territoryIds[j], territoryIds[i]];
        }

        // Assign territories evenly to players
        const numPlayers = window.gameVars.players.length;

        for (let i = 0; i < territoryIds.length; i++) {
            const territoryId = territoryIds[i];
            const playerId = i % numPlayers;
            const player = window.gameVars.players[playerId];
            const territory = this.territories.find(t => t.id === territoryId);

            // Assign territory to player
            territory.setOwner(player);

            // Places one army on the territory because every territory must have at least 1 army according to risk rule
            territory.setArmies(1);

            // Add territory to player's list 
            player.territories.push(territoryId);

            // Reduce player's reinforcements because one army was used to claim the territory above,
            // The player has one less reinforcement
            player.reinforcements--;
        }
    }

    updateGameInfo() {
        const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex];

        // Update player text with color
        this.playerText.setText(`Player: ${window.gameVars.currentPlayerIndex + 1}`);
        this.playerText.setColor(this.hexNumToHexString(currentPlayer.color));

        // Update phase text
        if (window.gameVars.gamePhase === "initialPlacement") {
            this.phaseText.setText("Phase: Initial Placement");
        } else {
            this.phaseText.setText(`Phase: ${this.capitalizeFirstLetter(window.gameVars.gamePhase)}`);
        }

        // Update end turn button text based on phase
        if (window.gameVars.gamePhase === "placement") {
            this.endTurnText.setText("Start Attack Phase");
        } else if (window.gameVars.gamePhase === "attack") {
            this.endTurnText.setText("Start Fortify Phase");
        } else if (window.gameVars.gamePhase === "fortify") {
            this.endTurnText.setText("End Turn");
        } else {
            // Initial placement phase
            this.endTurnText.setText("Please Place Armies");
        }

        // Update action text based on game phase
        if (window.gameVars.gamePhase === "initialPlacement") {
            this.actionText.setText(`Initial Placement\nPlayer ${window.gameVars.currentPlayerIndex + 1}'s turn\nRemaining: ${currentPlayer.reinforcements}`);
        } else if (window.gameVars.gamePhase === "placement") {
            this.actionText.setText(`Player ${window.gameVars.currentPlayerIndex + 1}'s turn\nPlace your reinforcements\nRemaining: ${currentPlayer.reinforcements}`);
        } else if (window.gameVars.gamePhase === "attack") {
            this.actionText.setText("Select your territory to attack from");
        } else if (window.gameVars.gamePhase === "fortify") {
            this.actionText.setText("Select territory to move armies from or end turn");
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    hexNumToHexString(color) {
        // Convert RGB color to hex string
        return "#" + color.toString(16).padStart(6, "0");
    }

    endTurn() {
        // Handle different phase transitions
        if (window.gameVars.gamePhase === "placement") {
            // From placement -> attack (same player)
            window.gameVars.gamePhase = "attack";
            this.updateGameInfo();
            return;
        }
        else if (window.gameVars.gamePhase === "attack") {
            // From attack -> fortify (same player)
            window.gameVars.gamePhase = "fortify";

            // Reset selections
            if (window.gameVars.selectedTerritory) {
                window.gameVars.selectedTerritory.setSelected(false);
            }
            window.gameVars.selectedTerritory = null;
            window.gameVars.targetTerritory = null;

            this.updateGameInfo();
            return;
        }
        else if (window.gameVars.gamePhase === "fortify") {
            // From fortify -> placement (next player)

            // Move to the next player
            window.gameVars.currentPlayerIndex = (window.gameVars.currentPlayerIndex + 1) % window.gameVars.players.length;
            const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex];

            // Reset selected territories
            if (window.gameVars.selectedTerritory) {
                window.gameVars.selectedTerritory.setSelected(false);
            }
            window.gameVars.selectedTerritory = null;
            window.gameVars.targetTerritory = null;

            // Calculate reinforcements including continent bonuses for the new player
            currentPlayer.reinforcements = this.calculateReinforcements(currentPlayer);

            // Move to placement phase for next player
            window.gameVars.gamePhase = "placement";

            // Update display
            this.updateGameInfo();

            // Disable end turn button until player places all armies
            this.endTurnButton.disableInteractive();
            this.endTurnButton.setFillStyle(0x333333);
        }
    }

    calculateReinforcements(player) {
        // Base reinforcements from territories
        let reinforcements = Math.max(Math.floor(player.territories.length / 3), 3);

        // Add bonuses for continents
        for (const continent in this.continents) {
            const continentTerritories = this.continents[continent].territories;
            const bonus = this.continents[continent].bonus;

            // Check if player owns all territories in the continent
            const ownsAll = continentTerritories.every(territoryId => player.territories.includes(territoryId));

            if (ownsAll) {
                reinforcements += bonus;
            }
        }

        return reinforcements;
    }

    handleTerritoryClick(territory) {
        const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex];

        // INITIAL PLACEMENT PHASE
        if (window.gameVars.gamePhase === "initialPlacement") {
            if (territory.owner === currentPlayer.id && currentPlayer.reinforcements > 0) {
                // Place an army
                territory.addArmies(1);
                currentPlayer.reinforcements--;
                this.updateGameInfo();

                // If current player has placed all armies, move to next player
                if (currentPlayer.reinforcements === 0) {
                    // Move to the next player
                    window.gameVars.currentPlayerIndex = (window.gameVars.currentPlayerIndex + 1) % window.gameVars.players.length;

                    // Check if all players have placed their initial armies
                    let allPlaced = true;
                    for (let player of window.gameVars.players) {
                        if (player.reinforcements > 0) {
                            allPlaced = false;
                            break;
                        }
                    }

                    // If all players have placed their armies, start regular game flow
                    if (allPlaced) {
                        window.gameVars.initialPlacementDone = true;
                        window.gameVars.gamePhase = "placement";

                        // Reset to first player and give reinforcements
                        window.gameVars.currentPlayerIndex = 0;
                        const firstPlayer = window.gameVars.players[0];
                        firstPlayer.reinforcements = this.calculateReinforcements(firstPlayer);

                        // Enable end phase button
                        this.endTurnButton.setInteractive();
                        this.endTurnButton.setFillStyle(0x444444);
                    }

                    this.updateGameInfo();
                }
            }
        }
        // REGULAR PLACEMENT PHASE
        else if (window.gameVars.gamePhase === "placement") {
            if (territory.owner === currentPlayer.id && currentPlayer.reinforcements > 0) {
                // Place an army
                territory.addArmies(1);
                currentPlayer.reinforcements--;
                this.updateGameInfo();

                // If all reinforcements placed, enable the end phase button
                if (currentPlayer.reinforcements === 0) {
                    // Enable end turn button - player can now move to attack phase
                    this.endTurnButton.setInteractive();
                    this.endTurnButton.setFillStyle(0x444444);
                    this.updateGameInfo();
                }
            }
        }
        // ATTACK PHASE
        else if (window.gameVars.gamePhase === "attack") {
            if (window.gameVars.selectedTerritory === null) {
                // selecting the attacking territory
                if (territory.owner === currentPlayer.id && territory.armies > 1) {
                    window.gameVars.selectedTerritory = territory;
                    territory.setSelected(true);
                    this.actionText.setText("Select an adjacent territory to attack");
                } else if (territory.owner === currentPlayer.id && territory.armies <= 1) {
                    this.actionText.setText("Need at least 2 armies to attack");
                }
            } else {
                // Selecting the defending territory and attack
                if (territory.owner !== currentPlayer.id &&
                    this.areAdjacent(window.gameVars.selectedTerritory.id, territory.id)
                ) {
                    window.gameVars.targetTerritory = territory;
                    this.resolveAttack();
                } else if (territory === window.gameVars.selectedTerritory) {
                    window.gameVars.selectedTerritory.setSelected(false);
                    window.gameVars.selectedTerritory = null;
                    this.actionText.setText("Select your territory to attack from");
                } else {
                    // Invalid target, reset selection
                    window.gameVars.selectedTerritory.setSelected(false);
                    window.gameVars.selectedTerritory = null;
                    this.actionText.setText("Invalid target. Select your territory to attack from");
                }
            }
        }
        // FORTIFY PHASE
        else if (window.gameVars.gamePhase === "fortify") {
            if (window.gameVars.selectedTerritory === null) {
                // Selecting the source territory
                if (territory.owner === currentPlayer.id && territory.armies > 1) {
                    window.gameVars.selectedTerritory = territory;
                    territory.setSelected(true);
                    this.actionText.setText("Select an adjacent friendly territory to fortify");
                }
            } else {
                // Selection the destination territory
                if (territory.owner === currentPlayer.id &&
                    territory !== window.gameVars.selectedTerritory &&
                    this.areAdjacent(window.gameVars.selectedTerritory.id, territory.id)
                ) {
                    window.gameVars.targetTerritory = territory;
                    this.fortifyTerritory();
                } else if (territory === window.gameVars.selectedTerritory) {
                    // Deselect
                    window.gameVars.selectedTerritory.setSelected(false);
                    window.gameVars.selectedTerritory = null;
                    this.actionText.setText("Select territory to move armies from or end turn");
                } else {
                    // Invalid target, reset selection
                    window.gameVars.selectedTerritory.setSelected(false);
                    window.gameVars.selectedTerritory = null;
                    this.actionText.setText("Invalid target. Select territory to move armies or end turn");
                }
            }
        }
    }

    areAdjacent(territory1Id, territory2Id) {
        return this.adjacencyMap[territory1Id].includes(territory2Id);
    }

    resolveAttack() {
        const attacker = window.gameVars.selectedTerritory;
        const defender = window.gameVars.targetTerritory;

        // Maximum number of dice
        const maxAttackerDice = Math.min(3, attacker.armies - 1);
        const maxDefenderDice = Math.min(2, defender.armies);

        // Roll dice
        const attackerDice = this.rollDice(maxAttackerDice).sort((a, b) => b - a);
        const defenderDice = this.rollDice(maxDefenderDice).sort((a, b) => b - a);

        // attackerDice and defender dice are the final number both the attacker and defender gets after rolling dice

        // Display dice results visually
        this.showDiceRoll(attackerDice, defenderDice);

        // Compare dice pairs
        let attackerLosses = 0;
        let defenderLosses = 0;

        for (let i = 0; i < Math.min(attackerDice.length, defenderDice.length); i++) {
            if (attackerDice[i] > defenderDice[i]) {
                defenderLosses++;
            } else {
                attackerLosses++;
            }
        }

        // Apply losses
        attacker.removeArmies(attackerLosses);
        defender.removeArmies(defenderLosses);

        // Update text with results
        this.actionText.setText(
            `Battle results\n` +
            `Attacker lost ${attackerLosses} armies\n` +
            `Defender lost ${defenderLosses} armies`
        );

        // Check if defender was defeated
        if (defender.armies <= 0) {
            this.captureTerritory(attacker, defender);
        }

        // Reset selections
        attacker.setSelected(false);
        window.gameVars.selectedTerritory = null;
        window.gameVars.targetTerritory = null;

        // Check for game over
        this.checkGameOver();
    }

    rollDice(count) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(Math.floor(Math.random() * 6) + 1);
        }
        return results;
    }

    captureTerritory(attacker, defender) {
        const attackerPlayer = window.gameVars.players[attacker.owner];
        const defenderPlayer = window.gameVars.players[defender.owner];

        // Remove territory from defender's list
        const index = defenderPlayer.territories.indexOf(defender.id);
        if (index > -1) {
            defenderPlayer.territories.splice(index, 1);
        }

        // Add territory to attacker's list
        attackerPlayer.territories.push(defender.id);

        // Transfer ownership and move armies
        defender.setOwner(attackerPlayer);

        // Move armies (minimum of 1, up to attacker.armies - 1)
        const armiesToMove = Math.max(attacker.armies - 1, 1);
        defender.setArmies(armiesToMove);
        attacker.setArmies(1);

        this.actionText.setText(`You captured ${defender.name}!`);
    }

    fortifyTerritory() {
        const source = window.gameVars.selectedTerritory;
        const destination = window.gameVars.targetTerritory;

        // Move armies (right now just moving half of armies)
        const armiesToMove = Math.floor((source.armies - 1) / 2);
        if (armiesToMove > 0) {
            source.removeArmies(armiesToMove);
            destination.addArmies(armiesToMove);
            this.actionText.setText(`Moved ${armiesToMove} armies from ${source.name} to ${destination.name}`);
        } else {
            this.actionText.setText("Not enough armies to fortify");
        }

        // Reset selections
        source.setSelected(false);
        window.gameVars.selectedTerritory = null;
        window.gameVars.targetTerritory = null;
    }

    checkGameOver() {
        // Check if any player has conquered all territories
        window.gameVars.players.forEach((player, index) => {
            if (player.territories.length === this.territories.length) {
                this.gameOver(index);
            }
        });
    }

    gameOver(winnerIndex) {
        // Display game over message
        this.add.rectangle(600, 400, 600, 300, 0x000000, 0.8);
        this.add.text(600, 350, "GAME OVER", {
            fontSize: "48px",
            fill: "#FFF"
        }).setOrigin(0.5);

        this.add.text(600, 425, `Player ${winnerIndex + 1} Wins!`, {
            fontSize: "32px",
            fill: this.hexNumToHexString(window.gameVars.players[winnerIndex].color)
        }).setOrigin(0.5);

        // Add restart button
        const restartButton = this.add.rectangle(600, 500, 200, 50, 0x444444).setInteractive();
        this.add.text(600, 500, "Play Again", {
            fontSize: "24px",
            fill: "#FFF"
        }).setOrigin(0.5);

        restartButton.on("pointerdown", () => {
            this.scene.start("MainMenuScene");
        });
    }

    createDiceDisplay() {
        // Create a container for dice display
        this.diceContainer = this.add.container(950, 280);
        this.diceContainer.setVisible(false);

        // Title text
        this.diceContainer.add(this.add.text(0, -40, "DICE BATTLE", {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        // Attacker label
        this.diceContainer.add(this.add.text(-100, -20, "Attacker", {
            fontSize: '14px',
            fill: '#FF0000'
        }).setOrigin(0.5));

        // Defender label
        this.diceContainer.add(this.add.text(100, -20, "Defender", {
            fontSize: '14px',
            fill: '#0000FF'
        }).setOrigin(0.5));

        // Create placeholders for attacker dice
        this.attackerDiceSprites = [];
        for (let i = 0; i < 3; i++) {
            const diceSprite = this.add.sprite(-100, 20 + i * 70, 'dice', 0);
            diceSprite.setVisible(false);
            this.diceContainer.add(diceSprite);
            this.attackerDiceSprites.push(diceSprite);
        }

        // Create placeholders for defender dice
        this.defenderDiceSprites = [];
        for (let i = 0; i < 2; i++) {
            const diceSprite = this.add.sprite(100, 20 + i * 70, 'dice', 0);
            diceSprite.setVisible(false);
            this.diceContainer.add(diceSprite);
            this.defenderDiceSprites.push(diceSprite);
        }

        // Result indicators (win/loss)
        this.resultIndicators = [];
        for (let i = 0; i < 3; i++) {
            const winIndicator = this.add.text(0, 20 + i * 70, "", {
                fontSize: '24px',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.diceContainer.add(winIndicator);
            this.resultIndicators.push(winIndicator);
        }
    }

    showDiceRoll(attackerDice, defenderDice) {
        this.diceContainer.setVisible(true);

        // Set up dice animation
        const rollDuration = 1000; // 1 second for dice animation
        const rollFrames = 10; // Number of "rolls" before settling

        // Hide all dice initially
        this.attackerDiceSprites.forEach(dice => dice.setVisible(false));
        this.defenderDiceSprites.forEach(dice => dice.setVisible(false));
        this.resultIndicators.forEach(indicator => indicator.setText(""));

        // Show only the dice being used
        for (let i = 0; i < attackerDice.length; i++) {
            this.attackerDiceSprites[i].setVisible(true);
        }

        for (let i = 0; i < defenderDice.length; i++) {
            this.defenderDiceSprites[i].setVisible(true);
        }

        // Animate dice rolling
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            rollCount++;

            // Show random dice faces during roll animation
            for (let i = 0; i < attackerDice.length; i++) {
                const randomFace = Math.floor(Math.random() * 6);
                this.attackerDiceSprites[i].setFrame(randomFace);
            }

            for (let i = 0; i < defenderDice.length; i++) {
                const randomFace = Math.floor(Math.random() * 6);
                this.defenderDiceSprites[i].setFrame(randomFace);
            }

            // On the last frame, show the actual results
            if (rollCount >= rollFrames) {
                clearInterval(rollInterval);
                this.showDiceResults(attackerDice, defenderDice);
            }
        }, rollDuration / rollFrames);
    }

    showDiceResults(attackerDice, defenderDice) {
        // Set the actual dice faces (dice values are 1-6, sprite frames are 0-5)
        for (let i = 0; i < attackerDice.length; i++) {
            this.attackerDiceSprites[i].setFrame(attackerDice[i] - 1);
        }

        for (let i = 0; i < defenderDice.length; i++) {
            this.defenderDiceSprites[i].setFrame(defenderDice[i] - 1);
        }

        // Compare dice and show results
        for (let i = 0; i < Math.min(attackerDice.length, defenderDice.length); i++) {
            if (attackerDice[i] > defenderDice[i]) {
                // Attacker wins
                this.resultIndicators[i].setText(">");
                this.resultIndicators[i].setColor("#00FF00");
                this.defenderDiceSprites[i].setTint(0xFF0000); // Red tint for loser
            } else {
                // Defender wins or ties
                this.resultIndicators[i].setText("<");
                this.resultIndicators[i].setColor("#FF0000");
                this.attackerDiceSprites[i].setTint(0xFF0000); // Red tint for loser
            }
        }
    }







}