
// TODO: need more with proper shapes

const territoriesData = [
    { id: 0, name: 'North America 1', x: 250, y: 200 },
    { id: 1, name: 'North America 2', x: 350, y: 250 },
    { id: 2, name: 'North America 3', x: 300, y: 350 },
    { id: 3, name: 'South America 1', x: 300, y: 500 },
    { id: 4, name: 'South America 2', x: 350, y: 600 },
    { id: 5, name: 'Europe 1', x: 550, y: 200 },
    { id: 6, name: 'Europe 2', x: 600, y: 300 },
    { id: 7, name: 'Africa 1', x: 550, y: 450 },
    { id: 8, name: 'Africa 2', x: 600, y: 550 },
    { id: 9, name: 'Asia 1', x: 750, y: 200 },
    { id: 10, name: 'Asia 2', x: 850, y: 250 },
    { id: 11, name: 'Asia 3', x: 800, y: 350 },
    { id: 12, name: 'Australia 1', x: 900, y: 550 },
    { id: 13, name: 'Australia 2', x: 950, y: 650 }
];

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.territories = [];
        this.adjacencyMap = {};
        this.phaseText = null;
        this.playerText = null;
        this.actionText = null;
        this.diceRestuls = [];
    }

    create() {
        // TODO: Add background
        this.add.image(600, 400, "world-map").setScale(1.5);

        // Create territories
        this.createTerritories()

        // Setup connections between territories
        this.setupAdjacenyMap()

        // Initialize game info display
        this.setupGameInfo()

        // Create action button
        this.setupButtons();

        // Start the initial placement phase
        this.startPlacementPhase()

    }

    createTerritories() {


        // Create territory objects
        this.territories = territoriesData.map(data => {
            const territory = new Territory(this, data.x, data.y, data.name, data.id);
            return territory;
        })
    }

    setupAdjacenyMap() {
        // Define which territories are adjacent
        this.adjacencyMap = {
            0: [1, 5],     // North America 1 connects to North America 2 and Europe 1
            1: [0, 2, 6],  // North America 2 connects to North America 1, North America 3, and Europe 2
            2: [1, 3],     // North America 3 connects to North America 2 and South America 1
            3: [2, 4, 7],  // South America 1 connects to North America 3, South America 2, and Africa 1
            4: [3, 8],     // South America 2 connects to South America 1 and Africa 2
            5: [0, 6, 9],  // Europe 1 connects to North America 1, Europe 2, and Asia 1
            6: [1, 5, 7, 11], // Europe 2 connects to North America 2, Europe 1, Africa 1, and Asia 3
            7: [3, 6, 8],  // Africa 1 connects to South America 1, Europe 2, and Africa 2
            8: [4, 7, 12], // Africa 2 connects to South America 2, Africa 1, and Australia 1
            9: [5, 10],    // Asia 1 connects to Europe 1 and Asia 2
            10: [9, 11],   // Asia 2 connects to Asia 1 and Asia 3
            11: [6, 10, 12], // Asia 3 connects to Europe 2, Asia 2, and Australia 1
            12: [8, 11, 13], // Australia 1 connects to Africa 2, Asia 3, and Australia 2
            13: [12]       // Australia 2 connects to Australia 1
        };
    }

    setupGameInfo() {
        // Background for game info
        this.add.rectangle(1000, 400, 300, 750, 0x222222);

        // Game phase text
        this.phaseText = this.add.text(1000, 100, "Phase: Placement", {
            fontSize: "20px",
            fill: "#FFF"
        }).setOrigin(0.5)

        // Current player text

        this.playerText = this.add.text(1000, 140, "Player: 1", {
            fontSize: "20px",
            fill: "#FFF"
        }).setOrigin(0.5);

        // Action text/Instructions

        this.actionText = this.add.text(1000, 180, "Place your armies", {
            fontSize: "16px",
            fill: "#FFF",
            align: "center",
            wordWrap: { width: 280 }
        }).setOrigin(0.5);

        // Dice results (will be updated during battles)
        this.diceText = this.add.text(1000, 240, "", {
            fontSize: "16px",
            fill: "#FFF",
            align: "center"
        }).setOrigin(0.5)

    }

    setupButtons() {
        // End turn button
        this.endTurnButton = this.add.rectangle(1000, 700, 200, 40, 0x444444).setInteractive();
        this.endTurnText = this.add.text(1000, 700, "End Turn", {
            fontSize: "18px",
            fill: "#FFF"
        }).setOrigin(0.5)

        this.endTurnButton.on('pointerdown', () => {
            // TODO: end turn functionality
        })

        this.endTurnButton.on("pointerover", () => {
            this.endTurnButton.setFillStyle(0x666666)
        })

        this.endTurnButton.on("pointerout", () => {
            this.endTurnButton.setFillStyle(0x444444)
        })

        // Initially disable end turn button during placement
        this.endTurnButton.disableInteractive();
        this.endTurnButton.setFillStyle(0x333333);
    }

    startPlacementPhase() {
        window.gameVars.gamePhase = "placement";
        this.phaseText.setText("Phase: Initial placement");

        // Calculate initial armies based on players
        const numPlayers = window.gameVars.players.length;
        const initialArmies = Math.max(40 - (numPlayers - 2) * 5, 20) // 40 for 2 players, 35 for 3, etc

        window.gameVars.players.forEach(player => {
            player.armies = initialArmies;
            player.reinforcements = initialArmies;
        })

        // Randomly assign territories to players
        this.assignTerritories()

        // Update display
        this.updateGameInfo()
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

            // Places one arty on the territory because every territory mush have atleast 1 army according to risk rule
            territory.setArmies(1);

            // Add territory to player's list 
            player.territories.push(territoryId);

            // Reduce player's reinforcements because one army was used to claim the territory above,
            // The player has one less reinforcement
            player.reinforcements--;
        }

    }

    updateGameInfo() {
        const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex]

        // Update player text with color
        this.playerText.setText(`Player: ${window.gameVars.currentPlayerIndex + 1}`);
        this.playerText.setColor(this.hexNumToHexString(currentPlayer.color));

        // Update phase text
        this.phaseText.setText(`Phase: ${this.capitalizeFirstLetter(window.gameVars.gamePhase)}`)


        // Update action text based on game phase
        if (window.gameVars.gamePhase === "placement") {
            this.actionText.setText(`Place your armies\nRemaining ${currentPlayer.reinforcements}`)
        } else if (window.gameVars.gamePhase === "attack") {
            this.actionText.setText("Select your territory to attack from");
        } else if (window.gameVars.gamePhase === "fortify") {
            this.actionText.setText("Select territory to move armies from or end turn")
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
        // Move to the next player
        window.gameVars.currentPlayerIndex = (window.gameVars.currentPlayerIndex + 1) % window.gameVars.players.length;
        const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex];

        // Reset selected territories
        window.gameVars.selectedTerritory = null;
        window.gameVars.targetTerritory = null;


        // Calculate reinforcement 
        const territoriesCount = currentPlayer.territories.length;
        currentPlayer.reinforcements = Math.max(Math.floor(territoriesCount / 3), 3);

        // Move to reinforcement phase 
        window.gameVars.gamePhase = "placement";

        // Update display
        this.updateGameInfo();

        // Disable end turn button during placement
        this.endTurnButton.disableInteractive();
        this.endTurnButton.setFillStyle(0x333333);
    }

    handleTerritoryClick(territory) {

        const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex];

        if (window.gameVars.gamePhase === "placement") {
            if (territory.owner === currentPlayer.id && currentPlayer.reinforcements > 0) {
                // Place an army

                territory.addArmies(1);
                currentPlayer.reinforcements--;
                this.updateGameInfo();

                // If all reinforcements placed, move to attack phase
                if (currentPlayer.reinforcements === 0) {
                    window.gameVars.gamePhase = "attack";
                    this.updateGameInfo();

                    // Enable end turn button
                    this.endTurnButton.setInteractive();
                    this.endTurnButton.setFillStyle(0x444444)
                }
            }
        } else if (window.gameVars.gamePhase === "attack") {
            if (window.gameVars.selectedTerritory === null) {
                // selecting the attacking territory
                // TODO: When user clicks on territory having just 1 army show some toast or something to inform user that you can not attack from territory that have just one troop
                if (territory.owner === currentPlayer.id && territory.armies > 1) {
                    window.gameVars.selectedTerritory = territory;
                    territory.setSelected(true);
                    this.actionText.setText("Select an adjacent territory to attack");
                }
                // If user is not the owner of selected territory or have less than 1 army on the territory then do nothing
            } else {

                // Selecting the defending territory and attack
                if (territory.owner !== currentPlayer.id &&
                    this.areAdjacent(window.gameVars.selectedTerritory.id, territory.id)
                ) {
                    window.gameVars.targetTerritory = territory;
                    this.resolveAttack()
                } else if (territory === window.gameVars.selectedTerritory) {
                    window.gameVars.selectedTerritory.setSelected(false);
                    window.gameVars.selectedTerritory = null;
                    this.actionText.setText("Select your territory to attack from")
                } else {
                    // Invalid target, reset selection
                    window.gameVars.selectedTerritory.setSelected(false);
                    window.gameVars.selectedTerritory = null;
                    this.actionText.setText("Invalid target. Select your territory to attack from")
                }
            }
        } else if (window.gameVars.gamePhase === "fortify") {
            if (window.gameVars.selectedTerritory === null) {
                // Selecting the source territory
                if (territory.owner === currentPlayer.id && territory.armies > 1) {
                    window.gameVars.selectedTerritory = territory;
                    territory.setSelected(true);
                    this.actionText.setText("Select an adjacent friendly territory to fortity")
                }
            } else {
                // selection the destination territory
                if (territory.owner === currentPlayer.id &&
                    territory !== window.gameVars.selectedTerritory &&
                    this.areAdjacent(window.gameVars.selectedTerritory.id, territory.id)
                ) {
                    window.gameVars.targetTerritory = territory;
                    this.fortifyTerritory()
                } else if (territory === window.gameVars.selectedTerritory) {
                    // Deselect
                    window.gameVars.selectedTerritory.setSelected(false);
                    window.gameVars.selectedTerritory = null;
                    this.actionText.setText("Select territory to move armies from or end turn")
                } else {
                    // Invalid target, reset selection
                    window.gameVars.selectedTerritory.setSelected(false);
                    window.gameVars.selectedTerritory = null;
                    this.actionText.setText("Invalid target. Select territory to move armies or end turn")
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


        // we put 3 here because attacker can roll a max of 3 dice,
        // we are doing `attacker.armies - 1` here because in any case attacker can not leave his territory empty
        // In the case if attacker has 3 army if attacker attacks with all 3 army and wins his territory will be empty
        // that's why we are taking one less than the count of army
        const maxAttackerDice = Math.min(3, attacker.armies - 1);


        // we put 2 here because defender can roll a max of 2 dice,
        // And can not role more than the number or armies in the territory
        const maxDefenderDice = Math.min(2, defender.armies);


        // Roll dice
        const attackerDice = this.rollDice(maxAttackerDice).sort((a, b) => b - a);
        const defenderDice = this.rollDice(maxDefenderDice).sort((a, b) => b - a)

        // Display dice results
        this.diceText.setText(
            `Attacker rolls : ${attackerDice.join(', ')}\n` +
            `Defender rolls: ${defenderDice.join(', ')}`
        );

        // Compare dice pairs
        let attackerLosses = 0;
        let defenderLosses = 0;


        for (let i = 0; i < Math.min(attackerDice.length, defenderDice.length); i++) {
            // Even if the defender got equals to attacker defender wins and attacker losses
            if (attackerDice[i] > defenderDice[i]) {
                defenderLosses++
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
        )

        // Check if defender was defeated
        if (defender.armies <= 0) {
            this.captureTerritory(attacker, defender)
        }

        // Reset selections
        attacker.setSelected(false);
        window.gameVars.selectedTerritory = null;
        window.gameVars.targetTerritory = null;

        // Check for game over
        this.checkGameOver()
    }

    rollDice(count) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(Math.floor(Math.random() * 6) + 1)
        }

        return results
    }

    // attacker and defender are territories
    captureTerritory(attacker, defender) {
        const attackerPlayer = window.gameVars.players[attacker.owner];
        const defenderPlayer = window.gameVars.players[defender.owner];

        // Remove territory from defender's list
        const index = defenderPlayer.territories.indexOf(defender.id);
        // If index is -1 means territory doesn't find the defender player
        if (index > -1) {
            defenderPlayer.territories.splice(index, 1);
        }

        // Add territory to attacker's list
        attackerPlayer.territories.push(defender.id);

        // Transfer ownership and move armies
        defender.setOwner(attackerPlayer);
        defender.setArmies(Math.max(attacker.armies - 1, 1));
        attacker.setArmies(1);

        this.actionText.setText(`You captured ${defender.name}`)
    }

    fortifyTerritory() {
        const source = window.gameVars.selectedTerritory;
        const destination = window.gameVars.targetTerritory;

        // Move armies (right now just moving half of armies)
        const armiesToMove = Math.floor((source.armies - 1) / 2);
        if (armiesToMove > 0) {
            source.removeArmies(armiesToMove);
            destination.addArmies(armiesToMove);
            this.actionText.setText(`Moved ${armiesToMove} armies from ${source.name} to ${destination.name}`)
        } else {
            this.actionText.setText("Not enough armies to fortity")
        }

        // Reset selections
        source.setSelected(false)
        window.gameVars.selectedTerritory = null;
        window.gameVars.targetTerritory = null;
    }

    checkGameOver() {
        // Check if any player has conquered all territories
        window.gameVars.players.forEach((player, index) => {
            if (player.territories.length === this.territories.length) {
                this.gameOver(index)
            }
        })
    }

    gameOver(winnerIndex) {
        // Display game over message
        this.add.rectangle(600, 400, 600, 300, 0x000000, 0.8);
        this.add.text(600, 350, "GAME OVER", {
            fontSize: "48px",
            fill: "#FFF"
        }).setOrigin(0.5)


        this.add.text(600, 425, `Player ${winnerIndex + 1} Wins!`, {
            fontSize: "32px",
            fill: this.hexNumToHexString(window.gameVars.players[winnerIndex].color)
        }).setOrigin(0.5)

        // Add restart button
        const restartButton = this.add.rectangle(600, 500, 200, 50, 0x444444).setInteractive();
        this.add.text(600, 500, "Play Again", {
            fontSize: "24px",
            fill: "#FFF"
        }).setOrigin(0.5);


        restartButton.on("pointerdown", () => {
            this.scene.start("MainMenuScene")
        })
    }
}