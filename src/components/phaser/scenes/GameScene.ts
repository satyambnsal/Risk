import * as Phaser from 'phaser'
import { Territory } from '../objects/Territory'
import { TerritoryData, ContinentData, Player } from '../types'

// Territory data
const territoriesData: TerritoryData[] = [
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
  { id: 24, name: 'AU-5', x: 430, y: 509, continent: 'Australia' },
]

// Adjacency map data
const adjacencyMapData: Record<number, number[]> = {
  // North America connections
  0: [1, 2, 15], // NA-1 connects to NA-2, NA-3, SA-1
  1: [0, 2, 3], // NA-2 connects to NA-1, NA-3, NA-4
  2: [0, 1, 3, 8, 10], // NA-3 connects to NA-1, NA-2, NA-4, EU-5, AF-1
  3: [1, 2, 5], // NA-4 connects to NA-2, NA-3, EU-2

  // Europe connections
  4: [7, 9, 11, 20], // EU-1 connects to EU-4, EU-6, AF-2, AU-1
  5: [3, 6, 8], // EU-2 connects to NA-4, EU-3, EU-5
  6: [5, 7, 8, 9], // EU-3 connects to EU-2, EU-4, EU-5, EU-6
  7: [4, 6, 9, 11], // EU-4 connects to EU-1, EU-3, EU-6, AF-2
  8: [2, 5, 6, 10], // EU-5 connects to NA-3, EU-2, EU-3, AF-1
  9: [4, 6, 7], // EU-6 connects to EU-1, EU-3, EU-4

  // Africa connections
  10: [2, 8, 11, 14], // AF-1 connects to NA-3, EU-5, AF-2, AF-5
  11: [4, 7, 10, 12, 20, 14], // AF-2 connects to EU-1, EU-4, AF-1, AF-3, AU-1, AF-5
  12: [11, 13, 14, 20, 21], // AF-3 connects to AF-2, AF-4, AF-5, AU-1, AU-2
  13: [12, 14, 21, 17], // AF-4 connects to AF-3, AF-5, AU-2, SF-3
  14: [10, 11, 12, 13, 15], // AF-5  connects to AF-1, AF-2, AF-3, AF-4, SA-1

  // South America connections
  15: [0, 16, 17, 14], // SA-1 connects to NA-1,, SA-2, SA-3, AF-5
  16: [15, 17, 18], // SA-2 connects to SA-1, SA-3, SA-4
  17: [15, 16, 18, 19, 13], // SA-3 connects to SA-1, SA-2, SA-4, SA-5, AF-4
  18: [16, 17, 19], // SA-4 connects to SA-2, SA-3, SA-5
  19: [17, 18, 24], // SA-5 connects to  SA-3, SA-4, AU-5

  // Australia connections
  20: [4, 11, 13, 21, 22], // AU-1 connects to EU-1, AF-2, AF-3, AU-2, AU-3
  21: [12, 13, 20, 22, 23, 24], // AU-2 connects to AF-3, AF-4,  AU-1, AU-3, AU-4, AU-5
  22: [20, 21, 23], // AU-3 connects to AU-1, AU-2, AU-4
  23: [21, 22, 24], // AU-4 connects to  AU-2, AU-3, AU-5
  24: [19, 21, 23], // AU-5 connects to SA-5, AU-2, AU-4
}

// Define continents and their bonus values
const continentsData: Record<string, ContinentData> = {
  'North America': { territories: [0, 1, 2, 3], bonus: 5 },
  Europe: { territories: [4, 5, 6, 7, 8, 9], bonus: 5 },
  Africa: { territories: [10, 11, 12, 13, 14], bonus: 3 },
  'South America': { territories: [15, 16, 17, 18, 19], bonus: 2 },
  Australia: { territories: [20, 21, 22, 23, 24], bonus: 2 },
}

export class GameScene extends Phaser.Scene {
  private territories: Territory[] = []
  private adjacencyMap: Record<number, number[]>
  private phaseText!: Phaser.GameObjects.Text
  private playerText!: Phaser.GameObjects.Text
  private actionText!: Phaser.GameObjects.Text
  private diceText!: Phaser.GameObjects.Text
  private diceResults: number[] = []
  private continents: Record<string, ContinentData>
  private hasFortified: boolean = false
  private endTurnButton!: Phaser.GameObjects.Rectangle
  private endTurnText!: Phaser.GameObjects.Text
  private diceContainer!: Phaser.GameObjects.Container
  private attackerDiceSprites: Phaser.GameObjects.Sprite[] = []
  private defenderDiceSprites: Phaser.GameObjects.Sprite[] = []
  private resultIndicators: Phaser.GameObjects.Text[] = []

  constructor() {
    super({ key: 'GameScene' })
    this.adjacencyMap = adjacencyMapData
    this.continents = continentsData
  }

  create() {
    // Add a dark background
    this.add.rectangle(600, 400, 1200, 800, 0x000000).setOrigin(0.5)

    // Start with camera faded out, then fade in
    this.cameras.main.fadeIn(800, 0, 0, 0)

    // Create territories
    this.createTerritories()

    // Draw connection lines between territories
    this.drawConnectionLines()

    // Initialize game info display
    this.setupGameInfo()

    // Create dice display
    this.createDiceDisplay()

    // Create action button
    this.setupButtons()

    // Start the initial placement phase
    this.startPlacementPhase()
  }

  createTerritories() {
    // Create territory objects
    this.territories = territoriesData.map((data) => {
      const territory = new Territory(this, data.x, data.y, data.name, data.id, data.continent)
      return territory
    })
  }

  drawConnectionLines() {
    // Create a graphics object for drawing lines
    const graphics = this.add.graphics()
    graphics.lineStyle(2, 0x444444, 0.8)

    // Draw lines between adjacent territories
    for (let i = 0; i < this.territories.length; i++) {
      const territory = this.territories[i]
      const adjacentIds = this.adjacencyMap[territory.id]

      for (let j = 0; j < adjacentIds.length; j++) {
        const adjacentId = adjacentIds[j]

        // Only draw each connection once
        if (adjacentId > territory.id) {
          const adjacentTerritory = this.territories.find((t) => t.id === adjacentId)
          if (adjacentTerritory) {
            graphics.lineBetween(
              territory.territoryImage.x,
              territory.territoryImage.y,
              adjacentTerritory.territoryImage.x,
              adjacentTerritory.territoryImage.y
            )
          }
        }
      }
    }
  }

  setupGameInfo() {
    // Background for game info
    this.add.rectangle(950, 400, 340, 750, 0x222222)

    // Game phase text
    this.phaseText = this.add
      .text(950, 100, 'Phase: Placement', {
        fontSize: '20px',
        color: '#FFF',
      })
      .setOrigin(0.5)

    // Current player text
    this.playerText = this.add
      .text(950, 140, 'Player: 1', {
        fontSize: '20px',
        color: '#FFF',
      })
      .setOrigin(0.5)

    // Action text/Instructions
    this.actionText = this.add
      .text(950, 180, 'Place your armies', {
        fontSize: '16px',
        color: '#FFF',
        align: 'center',
        wordWrap: { width: 280 },
      })
      .setOrigin(0.5)

    // Dice results (will be updated during battles)
    this.diceText = this.add
      .text(950, 240, '', {
        fontSize: '16px',
        color: '#FFF',
        align: 'center',
      })
      .setOrigin(0.5)

    // Continent bonus information
    let yPos = 500
    this.add
      .text(950, yPos, 'Continent Bonuses:', {
        fontSize: '16px',
        color: '#FFF',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    yPos += 30
    for (const continent in this.continents) {
      this.add
        .text(950, yPos, `${continent}: +${this.continents[continent].bonus}`, {
          fontSize: '14px',
          color: '#FFF',
        })
        .setOrigin(0.5)
      yPos += 20
    }
  }

  setupButtons() {
    // End turn button
    this.endTurnButton = this.add.rectangle(950, 700, 240, 40, 0x444444).setInteractive()
    this.endTurnText = this.add
      .text(950, 700, 'End Phase', {
        fontSize: '18px',
        color: '#FFF',
      })
      .setOrigin(0.5)

    this.endTurnButton.on('pointerdown', () => {
      // Add button press animation
      this.tweens.add({
        targets: this.endTurnButton,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.endTurn()
        },
      })
    })

    this.endTurnButton.on('pointerover', () => {
      this.endTurnButton.setFillStyle(0x666666)

      // Add hover scale animation
      this.tweens.add({
        targets: this.endTurnButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Sine.easeOut',
      })

      // Also scale the text
      this.tweens.add({
        targets: this.endTurnText,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Sine.easeOut',
      })
    })

    this.endTurnButton.on('pointerout', () => {
      this.endTurnButton.setFillStyle(0x444444)

      // Reset scale on hover out
      this.tweens.add({
        targets: [this.endTurnButton, this.endTurnText],
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Sine.easeOut',
      })
    })

    // Initially disable end turn button during placement
    this.endTurnButton.disableInteractive()
    this.endTurnButton.setFillStyle(0x333333)
  }

  startPlacementPhase() {
    window.gameVars.gamePhase = 'initialPlacement'
    window.gameVars.initialPlacementDone = false
    this.phaseText.setText('Phase: Initial Placement')

    // Calculate initial armies based on players
    const numPlayers = window.gameVars.players.length
    const initialArmies = Math.max(40 - (numPlayers - 2) * 5, 20)

    window.gameVars.players.forEach((player) => {
      player.armies = initialArmies
      player.reinforcements = initialArmies
    })

    // Randomly assign territories to players
    this.assignTerritories()

    // Update display
    this.updateGameInfo()

    // Disable end turn button during initial placement
    this.endTurnButton.disableInteractive()
    this.endTurnButton.setFillStyle(0x333333)
  }

  assignTerritories() {
    // Create a copy of territory IDs
    const territoryIds = this.territories.map((t) => t.id)

    // Shuffle territory Ids
    for (let i = territoryIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[territoryIds[i], territoryIds[j]] = [territoryIds[j], territoryIds[i]]
    }

    // Assign territories evenly to players with animation
    const numPlayers = window.gameVars.players.length

    // Display an "assigning territories" message
    const assignText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'ASSIGNING TERRITORIES', {
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(1000)

    // Animate text
    this.tweens.add({
      targets: assignText,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Fade out after a short delay
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: assignText,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              assignText.destroy()
            },
          })
        })
      },
    })

    for (let i = 0; i < territoryIds.length; i++) {
      const territoryId = territoryIds[i]
      const playerId = i % numPlayers
      const player = window.gameVars.players[playerId]
      const territory = this.territories.find((t) => t.id === territoryId)

      if (territory) {
        // Use delayed call to create staggered assignment animation
        this.time.delayedCall(1500 + i * 50, () => {
          // Assign territory to player
          territory.setOwner(player)

          // Places one army on the territory
          territory.setArmies(1)

          // a flash effect for territory assignment
          this.tweens.add({
            targets: territory.territoryImage,
            scaleX: territory.originalScale * 1.2,
            scaleY: territory.originalScale * 1.2,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut',
          })

          // Add territory to player's list
          player.territories.push(territoryId)

          // Reduce player's reinforcements
          player.reinforcements--
        })
      }
    }
  }

  // Other methods would be converted similarly...

  // Example method conversion:
  updateGameInfo() {
    const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex]

    if (currentPlayer.eliminated) {
      // Skip to next player if current one is eliminated
      this.endTurn()
      return
    }

    // Update player text with color
    this.playerText.setText(`Player: ${window.gameVars.currentPlayerIndex + 1}`)
    this.playerText.setColor(this.hexNumToHexString(currentPlayer.color))

    // Update phase text
    if (window.gameVars.gamePhase === 'initialPlacement') {
      this.phaseText.setText('Phase: Initial Placement')
    } else {
      this.phaseText.setText(`Phase: ${this.capitalizeFirstLetter(window.gameVars.gamePhase)}`)
    }

    // Update end turn button text based on phase
    if (window.gameVars.gamePhase === 'placement') {
      this.endTurnText.setText('Start Attack Phase')
    } else if (window.gameVars.gamePhase === 'attack') {
      this.endTurnText.setText('Start Fortify Phase')
    } else if (window.gameVars.gamePhase === 'fortify') {
      this.endTurnText.setText('End Turn')
    } else {
      // Initial placement phase
      this.endTurnText.setText('Please Place Armies')
    }

    // Update action text based on game phase
    if (window.gameVars.gamePhase === 'initialPlacement') {
      this.actionText.setText(
        `Initial Placement\nPlayer ${window.gameVars.currentPlayerIndex + 1}'s turn\nRemaining: ${
          currentPlayer.reinforcements
        }`
      )
    } else if (window.gameVars.gamePhase === 'placement') {
      this.actionText.setText(
        `Player ${
          window.gameVars.currentPlayerIndex + 1
        }'s turn\nPlace your reinforcements\nRemaining: ${currentPlayer.reinforcements}`
      )
    } else if (window.gameVars.gamePhase === 'attack') {
      this.actionText.setText('Select your territory to attack from')
    } else if (window.gameVars.gamePhase === 'fortify') {
      this.actionText.setText('Select territory to move armies from or end turn')
    }
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  hexNumToHexString(color: number): string {
    // Convert RGB color to hex string
    return '#' + color.toString(16).padStart(6, '0')
  }

  endTurn() {
    // Handle different phase transitions
    if (window.gameVars.gamePhase === 'placement') {
      // From placement -> attack (same player)
      window.gameVars.gamePhase = 'attack'

      //  phase transition animation
      this.createPhaseTransitionAnimation('attack')

      this.updateGameInfo()
      return
    } else if (window.gameVars.gamePhase === 'attack') {
      // From attack -> fortify (same player)
      window.gameVars.gamePhase = 'fortify'
      this.hasFortified = false

      //  phase transition animation
      this.createPhaseTransitionAnimation('fortify')

      // Reset selections
      if (window.gameVars.selectedTerritory) {
        window.gameVars.selectedTerritory.setSelected(false)
      }
      window.gameVars.selectedTerritory = null
      window.gameVars.targetTerritory = null

      this.updateGameInfo()
      return
    } else if (window.gameVars.gamePhase === 'fortify') {
      // Reset selected territories
      if (window.gameVars.selectedTerritory) {
        window.gameVars.selectedTerritory.setSelected(false)
      }
      window.gameVars.selectedTerritory = null
      window.gameVars.targetTerritory = null

      // Find the next active player (not eliminated)
      let nextPlayerFound = false
      let nextPlayerIndex = window.gameVars.currentPlayerIndex
      const playerCount = window.gameVars.players.length

      for (let i = 1; i <= playerCount; i++) {
        // Calculate next player index with wrapping
        nextPlayerIndex = (window.gameVars.currentPlayerIndex + i) % playerCount

        // Check if this player is still in the game
        if (!window.gameVars.players[nextPlayerIndex].eliminated) {
          nextPlayerFound = true
          break
        }
      }

      // If no active players found besides current one, game is over
      if (!nextPlayerFound) {
        // Current player wins!
        this.gameOver(window.gameVars.currentPlayerIndex)
        return
      }

      // Move to the next active player
      window.gameVars.currentPlayerIndex = nextPlayerIndex
      const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex]

      // Calculate reinforcements including continent bonuses for the new player
      currentPlayer.reinforcements = this.calculateReinforcements(currentPlayer)

      // Create player turn change animation
      this.createPlayerTurnAnimation(window.gameVars.currentPlayerIndex)

      // Move to placement phase for next player
      window.gameVars.gamePhase = 'placement'

      // Add slight delay, then show placement phase animation
      this.time.delayedCall(1500, () => {
        this.createPhaseTransitionAnimation('placement')
      })

      // Update display
      this.updateGameInfo()

      // Disable end turn button until player places all armies
      this.endTurnButton.disableInteractive()
      this.endTurnButton.setFillStyle(0x333333)
    }
  }

  createPhaseTransitionAnimation(newPhase: string) {
    // Create a text overlay for the phase change
    const phaseText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        newPhase.toUpperCase() + ' PHASE',
        {
          fontSize: '64px',
          fontStyle: 'bold',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 6,
          align: 'center',
        }
      )
      .setOrigin(0.5)

    phaseText.setAlpha(0)
    phaseText.setScale(0.5)
    phaseText.setDepth(1000)

    // First tween - fade in and scale up
    this.tweens.add({
      targets: phaseText,
      alpha: 1,
      scale: 1.2,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Second tween - hold for a moment
        this.time.delayedCall(800, () => {
          // Third tween - fade out and scale up more
          this.tweens.add({
            targets: phaseText,
            alpha: 0,
            scale: 1.5,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
              phaseText.destroy()
            },
          })
        })
      },
    })
  }

  handleTerritoryClick(territory: Territory) {
    const currentPlayer = window.gameVars.players[window.gameVars.currentPlayerIndex]

    // INITIAL PLACEMENT PHASE
    if (window.gameVars.gamePhase === 'initialPlacement') {
      if (territory.owner === currentPlayer.id && currentPlayer.reinforcements > 0) {
        // Place an army
        territory.addArmies(1)
        currentPlayer.reinforcements--
        this.updateGameInfo()

        // If current player has placed all armies, move to next player
        if (currentPlayer.reinforcements === 0) {
          // Move to the next player
          window.gameVars.currentPlayerIndex =
            (window.gameVars.currentPlayerIndex + 1) % window.gameVars.players.length

          // Check if all players have placed their initial armies
          let allPlaced = true
          for (const player of window.gameVars.players) {
            if (player.reinforcements > 0) {
              allPlaced = false
              break
            }
          }

          // If all players have placed their armies, start regular game flow
          if (allPlaced) {
            window.gameVars.initialPlacementDone = true
            window.gameVars.gamePhase = 'placement'

            // Reset to first player and give reinforcements
            window.gameVars.currentPlayerIndex = 0
            const firstPlayer = window.gameVars.players[0]
            firstPlayer.reinforcements = this.calculateReinforcements(firstPlayer)

            // Enable end phase button
            this.endTurnButton.setInteractive()
            this.endTurnButton.setFillStyle(0x444444)
          }

          this.updateGameInfo()
        }
      }
    }
    // REGULAR PLACEMENT PHASE
    else if (window.gameVars.gamePhase === 'placement') {
      if (territory.owner === currentPlayer.id && currentPlayer.reinforcements > 0) {
        // Place an army
        territory.addArmies(1)
        currentPlayer.reinforcements--
        this.updateGameInfo()

        // If all reinforcements placed, enable the end phase button
        if (currentPlayer.reinforcements === 0) {
          // Enable end turn button - player can now move to attack phase
          this.endTurnButton.setInteractive()
          this.endTurnButton.setFillStyle(0x444444)
          this.updateGameInfo()
        }
      }
    }
    // ATTACK PHASE
    else if (window.gameVars.gamePhase === 'attack') {
      if (window.gameVars.selectedTerritory === null) {
        // selecting the attacking territory
        if (territory.owner === currentPlayer.id && territory.armies > 1) {
          window.gameVars.selectedTerritory = territory
          territory.setSelected(true)
          this.actionText.setText('Select an adjacent territory to attack')
        } else if (territory.owner === currentPlayer.id && territory.armies <= 1) {
          this.actionText.setText('Need at least 2 armies to attack')
        }
      } else {
        // Selecting the defending territory and attack
        if (
          territory.owner !== currentPlayer.id &&
          this.areAdjacent(window.gameVars.selectedTerritory.id, territory.id)
        ) {
          window.gameVars.targetTerritory = territory
          this.resolveAttack()
        } else if (territory === window.gameVars.selectedTerritory) {
          window.gameVars.selectedTerritory.setSelected(false)
          window.gameVars.selectedTerritory = null
          this.actionText.setText('Select your territory to attack from')
        } else {
          // Invalid target, reset selection
          window.gameVars.selectedTerritory.setSelected(false)
          window.gameVars.selectedTerritory = null
          this.actionText.setText('Invalid target. Select your territory to attack from')
        }
      }
    }
    // FORTIFY PHASE
    else if (window.gameVars.gamePhase === 'fortify') {
      if (this.hasFortified) {
        this.actionText.setText("You've already fortified this turn. Please end your turn.")
        return
      }

      if (window.gameVars.selectedTerritory === null) {
        // Selecting the source territory
        if (territory.owner === currentPlayer.id && territory.armies > 1) {
          window.gameVars.selectedTerritory = territory
          territory.setSelected(true)
          this.actionText.setText('Select an adjacent friendly territory to fortify')
        }
      } else {
        // Selection the destination territory
        if (
          territory.owner === currentPlayer.id &&
          territory !== window.gameVars.selectedTerritory &&
          this.areAdjacent(window.gameVars.selectedTerritory.id, territory.id)
        ) {
          window.gameVars.targetTerritory = territory
          this.fortifyTerritory()
        } else if (territory === window.gameVars.selectedTerritory) {
          // Deselect
          window.gameVars.selectedTerritory.setSelected(false)
          window.gameVars.selectedTerritory = null
          this.actionText.setText('Select territory to move armies from or end turn')
        } else {
          // Invalid target, reset selection
          window.gameVars.selectedTerritory.setSelected(false)
          window.gameVars.selectedTerritory = null
          this.actionText.setText('Invalid target. Select territory to move armies or end turn')
        }
      }
    }
  }

  createDiceDisplay() {
    // Create a container for dice display
    this.diceContainer = this.add.container(950, 280)
    this.diceContainer.setVisible(false)

    // Title text
    this.diceContainer.add(
      this.add
        .text(0, -40, 'DICE BATTLE', {
          fontSize: '18px',
          color: '#FFFFFF',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    )

    // Attacker label
    this.diceContainer.add(
      this.add
        .text(-100, -20, 'Attacker', {
          fontSize: '14px',
          color: '#FF0000',
        })
        .setOrigin(0.5)
    )

    // Defender label
    this.diceContainer.add(
      this.add
        .text(100, -20, 'Defender', {
          fontSize: '14px',
          color: '#0000FF',
        })
        .setOrigin(0.5)
    )

    // Create placeholders for attacker dice
    this.attackerDiceSprites = []
    for (let i = 0; i < 3; i++) {
      const diceSprite = this.add.sprite(-100, 20 + i * 70, 'dice', 0)
      diceSprite.setVisible(false)
      this.diceContainer.add(diceSprite)
      this.attackerDiceSprites.push(diceSprite)
    }

    // Create placeholders for defender dice
    this.defenderDiceSprites = []
    for (let i = 0; i < 2; i++) {
      const diceSprite = this.add.sprite(100, 20 + i * 70, 'dice', 0)
      diceSprite.setVisible(false)
      this.diceContainer.add(diceSprite)
      this.defenderDiceSprites.push(diceSprite)
    }

    // Result indicators (win/loss)
    this.resultIndicators = []
    for (let i = 0; i < 3; i++) {
      const winIndicator = this.add
        .text(0, 20 + i * 70, '', {
          fontSize: '24px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
      this.diceContainer.add(winIndicator)
      this.resultIndicators.push(winIndicator)
    }
  }

  areAdjacent(territory1Id: number, territory2Id: number): boolean {
    return this.adjacencyMap[territory1Id].includes(territory2Id)
  }

  calculateReinforcements(player: Player): number {
    // Base reinforcements from territories
    let reinforcements = Math.max(Math.floor(player.territories.length / 3), 3)

    // Add bonuses for continents
    for (const continent in this.continents) {
      const continentTerritories = this.continents[continent].territories
      const bonus = this.continents[continent].bonus

      // Check if player owns all territories in the continent
      const ownsAll = continentTerritories.every((territoryId) =>
        player.territories.includes(territoryId)
      )

      if (ownsAll) {
        reinforcements += bonus
      }
    }

    return reinforcements
  }

  resolveAttack() {
    const attacker = window.gameVars.selectedTerritory
    const defender = window.gameVars.targetTerritory

    if (!attacker || !defender) return

    // Maximum number of dice
    const maxAttackerDice = Math.min(3, attacker.armies - 1)
    const maxDefenderDice = Math.min(2, defender.armies)

    // Roll dice
    const attackerDice = this.rollDice(maxAttackerDice).sort((a, b) => b - a)
    const defenderDice = this.rollDice(maxDefenderDice).sort((a, b) => b - a)

    // Display dice results visually
    this.showDiceRoll(attackerDice, defenderDice)

    // Compare dice pairs
    let attackerLosses = 0
    let defenderLosses = 0

    for (let i = 0; i < Math.min(attackerDice.length, defenderDice.length); i++) {
      if (attackerDice[i] > defenderDice[i]) {
        defenderLosses++
      } else {
        attackerLosses++
      }
    }

    // Apply losses
    attacker.removeArmies(attackerLosses)
    defender.removeArmies(defenderLosses)

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
    attacker.setSelected(false)
    window.gameVars.selectedTerritory = null
    window.gameVars.targetTerritory = null

    // Check for game over
    this.checkGameOver()
  }

  rollDice(count: number): number[] {
    const results = []
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * 6) + 1)
    }
    return results
  }

  showDiceRoll(attackerDice: number[], defenderDice: number[]) {
    this.diceContainer.setVisible(true)

    // Create a background flash effect for dice battle
    const flashOverlay = this.add
      .rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0xffffff,
        0.3
      )
      .setDepth(500)

    // Animate flash overlay
    this.tweens.add({
      targets: flashOverlay,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        flashOverlay.destroy()
      },
    })

    // Set up dice animation
    const rollDuration = 1000 // 1 second for dice animation
    const rollFrames = 10 // Number of "rolls" before settling

    // Hide all dice initially
    this.attackerDiceSprites.forEach((dice) => dice.setVisible(false))
    this.defenderDiceSprites.forEach((dice) => dice.setVisible(false))
    this.resultIndicators.forEach((indicator) => indicator.setText(''))

    // Show only the dice being used
    for (let i = 0; i < attackerDice.length; i++) {
      this.attackerDiceSprites[i].setVisible(true)
      this.attackerDiceSprites[i].setScale(0) // Start small for animation

      // Animate dice appearance
      this.tweens.add({
        targets: this.attackerDiceSprites[i],
        scale: 1,
        duration: 200,
        delay: i * 100,
        ease: 'Back.easeOut',
      })
    }

    for (let i = 0; i < defenderDice.length; i++) {
      this.defenderDiceSprites[i].setVisible(true)
      this.defenderDiceSprites[i].setScale(0) // Start small for animation

      // Animate dice appearance
      this.tweens.add({
        targets: this.defenderDiceSprites[i],
        scale: 1,
        duration: 200,
        delay: i * 100 + 300, // Slight delay after attacker dice
        ease: 'Back.easeOut',
      })
    }

    // Animate dice rolling
    let rollCount = 0
    const rollInterval = setInterval(() => {
      rollCount++

      // Show random dice faces during roll animation with rotation
      for (let i = 0; i < attackerDice.length; i++) {
        const randomFace = Math.floor(Math.random() * 6)
        this.attackerDiceSprites[i].setFrame(randomFace)

        // Add a small rotation to make it look like it's tumbling
        this.attackerDiceSprites[i].setAngle(Math.random() * 20 - 10)
      }

      for (let i = 0; i < defenderDice.length; i++) {
        const randomFace = Math.floor(Math.random() * 6)
        this.defenderDiceSprites[i].setFrame(randomFace)

        // Add a small rotation
        this.defenderDiceSprites[i].setAngle(Math.random() * 20 - 10)
      }

      // On the last frame, show the actual results
      if (rollCount >= rollFrames) {
        clearInterval(rollInterval)

        // Add a small delay before showing final results
        this.time.delayedCall(200, () => {
          // Reset rotation
          for (let i = 0; i < attackerDice.length; i++) {
            this.attackerDiceSprites[i].setAngle(0)
          }

          for (let i = 0; i < defenderDice.length; i++) {
            this.defenderDiceSprites[i].setAngle(0)
          }

          this.showDiceResults(attackerDice, defenderDice)
        })
      }
    }, rollDuration / rollFrames)
  }

  showDiceResults(attackerDice: number[], defenderDice: number[]) {
    // Set the actual dice faces (dice values are 1-6, sprite frames are 0-5)
    for (let i = 0; i < attackerDice.length; i++) {
      this.attackerDiceSprites[i].setFrame(attackerDice[i] - 1)

      // a bounce effect when showing final value
      this.tweens.add({
        targets: this.attackerDiceSprites[i],
        y: this.attackerDiceSprites[i].y - 10,
        duration: 150,
        yoyo: true,
        ease: 'Bounce.easeOut',
      })
    }

    for (let i = 0; i < defenderDice.length; i++) {
      this.defenderDiceSprites[i].setFrame(defenderDice[i] - 1)

      // a bounce effect when showing final value
      this.tweens.add({
        targets: this.defenderDiceSprites[i],
        y: this.defenderDiceSprites[i].y - 10,
        duration: 150,
        yoyo: true,
        ease: 'Bounce.easeOut',
      })
    }

    // Compare dice and show results with animation
    const comparisons = []

    for (let i = 0; i < Math.min(attackerDice.length, defenderDice.length); i++) {
      comparisons.push({ index: i, attackerValue: attackerDice[i], defenderValue: defenderDice[i] })
    }

    // Animate results with a staggered delay
    comparisons.forEach((comparison, idx) => {
      const i = comparison.index

      this.time.delayedCall(300 + idx * 400, () => {
        if (comparison.attackerValue > comparison.defenderValue) {
          // Attacker wins
          this.resultIndicators[i].setText('>')
          this.resultIndicators[i].setColor('#00FF00')
          this.defenderDiceSprites[i].setTint(0xff0000) // Red tint for loser

          // Add shake animation to defender's die
          this.tweens.add({
            targets: this.defenderDiceSprites[i],
            x: this.defenderDiceSprites[i].x + 5,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
          })

          // Scale up the result indicator with a nice animation
          this.resultIndicators[i].setScale(0)
          this.tweens.add({
            targets: this.resultIndicators[i],
            scale: 1.5,
            duration: 200,
            ease: 'Back.easeOut',
          })
        } else {
          // Defender wins or ties
          this.resultIndicators[i].setText('<')
          this.resultIndicators[i].setColor('#FF0000')
          this.attackerDiceSprites[i].setTint(0xff0000) // Red tint for loser

          // Add shake animation to attacker's die
          this.tweens.add({
            targets: this.attackerDiceSprites[i],
            x: this.attackerDiceSprites[i].x - 5,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
          })

          // Scale up the result indicator with a nice animation
          this.resultIndicators[i].setScale(0)
          this.tweens.add({
            targets: this.resultIndicators[i],
            scale: 1.5,
            duration: 200,
            ease: 'Back.easeOut',
          })
        }
      })
    })
  }

  captureTerritory(attacker: Territory, defender: Territory) {
    const attackerPlayer = window.gameVars.players[attacker.owner!]
    const defenderPlayer = window.gameVars.players[defender.owner!]

    if (!attackerPlayer || !defenderPlayer) return

    // Remove territory from defender's list
    const index = defenderPlayer.territories.indexOf(defender.id)
    if (index > -1) {
      defenderPlayer.territories.splice(index, 1)
    }

    // Add territory to attacker's list
    attackerPlayer.territories.push(defender.id)

    // capture animation before changing ownership
    this.createCaptureAnimation(defender, attackerPlayer)

    // Transfer ownership and move armies (with delay so animation shows first)
    this.time.delayedCall(500, () => {
      defender.setOwner(attackerPlayer)

      // Move armies (minimum of 1, up to attacker.armies - 1)
      const armiesToMove = Math.max(attacker.armies - 1, 1)
      defender.setArmies(armiesToMove)
      attacker.setArmies(1)
    })

    this.actionText.setText(`You captured ${defender.name}!`)

    // Check if the defender player has been eliminated
    if (defenderPlayer.territories.length === 0) {
      defenderPlayer.eliminated = true
      this.showPlayerEliminationMessage(defenderPlayer.id)
    }
  }

  createPlayerTurnAnimation(playerIndex: number) {
    const player = window.gameVars.players[playerIndex]

    // Convert numeric color to hex string
    const colorString = this.hexNumToHexString(player.color)

    // Create the player turn announcement
    const playerText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 40,
        'PLAYER ' + (playerIndex + 1) + "'S TURN",
        {
          fontSize: '52px',
          fontStyle: 'bold',
          color: colorString,
          stroke: '#000000',
          strokeThickness: 6,
          align: 'center',
        }
      )
      .setOrigin(0.5)

    // Create reinforcements text
    const reinforcementsText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 30,
        `Reinforcements: ${player.reinforcements}`,
        {
          fontSize: '32px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 4,
          align: 'center',
        }
      )
      .setOrigin(0.5)

    // Set initial properties for animation
    playerText.setAlpha(0)
    playerText.setScale(0.5)
    reinforcementsText.setAlpha(0)
    reinforcementsText.setScale(0.5)

    // Set high depth to appear above everything
    playerText.setDepth(1000)
    reinforcementsText.setDepth(1000)

    // First tween - fade in and scale up
    this.tweens.add({
      targets: [playerText, reinforcementsText],
      alpha: 1,
      scale: 1,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // Hold for a moment, then fade out
        this.time.delayedCall(1200, () => {
          // Fade out and scale up more
          this.tweens.add({
            targets: [playerText, reinforcementsText],
            alpha: 0,
            scale: 1.3,
            duration: 500,
            ease: 'Sine.easeIn',
            onComplete: () => {
              playerText.destroy()
              reinforcementsText.destroy()
            },
          })
        })
      },
    })
  }

  createCaptureAnimation(territory: Territory, newOwner: any) {
    // Create a flash effect
    const flash = this.add.circle(
      territory.territoryImage.x,
      territory.territoryImage.y,
      50,
      newOwner.color,
      0.7
    )
    flash.setDepth(300)

    // Add animation for the flash
    this.tweens.add({
      targets: flash,
      radius: 100,
      alpha: 0,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => {
        flash.destroy()
      },
    })

    // Also make territory briefly glow
    territory.territoryImage.setTint(newOwner.color)

    // Add a scale pulse animation
    this.tweens.add({
      targets: territory.territoryImage,
      scaleX: territory.originalScale * 1.3,
      scaleY: territory.originalScale * 1.3,
      duration: 300,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        territory.territoryImage.clearTint()
        territory.territoryImage.setScale(territory.originalScale)
      },
    })
  }

  fortifyTerritory() {
    const source = window.gameVars.selectedTerritory
    const destination = window.gameVars.targetTerritory

    if (!source || !destination) return

    if (source.armies <= 1) {
      this.actionText.setText('Not enough armies to fortify')

      // Reset selections
      source.setSelected(false)
      window.gameVars.selectedTerritory = null
      window.gameVars.targetTerritory = null
      return
    }

    // Show the army selection UI
    this.createArmySelectionUI(source, destination)
  }

  createArmySelectionUI(source: Territory, destination: Territory) {
    // Background panel with semi-transparent background
    const panel = this.add
      .rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 400, 300, 0x222222, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff)
      .setDepth(1000)

    // Title
    const title = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 100,
        'Select Armies to Move',
        {
          fontSize: '24px',
          color: '#FFF',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5)
      .setDepth(1000)

    // Territory info
    const infoText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 60,
        `From ${source.name} (${source.armies} armies) to ${destination.name} (${destination.armies} armies)`,
        {
          fontSize: '16px',
          color: '#FFF',
        }
      )
      .setOrigin(0.5)
      .setDepth(1000)

    // Calculate max armies that can be moved (leaving at least 1 behind)
    const maxArmies = source.armies - 1
    let currentArmies = Math.floor(maxArmies / 2) // Default to half, rounding down

    // Current selection text
    const selectionText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        `Armies to move: ${currentArmies}`,
        {
          fontSize: '20px',
          color: '#FFF',
        }
      )
      .setOrigin(0.5)
      .setDepth(1000)

    // Create minus button
    const minusButton = this.add
      .rectangle(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2, 40, 40, 0x444444)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000)

    const minusText = this.add
      .text(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2, '-', {
        fontSize: '24px',
        color: '#FFF',
      })
      .setOrigin(0.5)
      .setDepth(1000)

    // Create plus button
    const plusButton = this.add
      .rectangle(this.cameras.main.width / 2 + 150, this.cameras.main.height / 2, 40, 40, 0x444444)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000)

    const plusText = this.add
      .text(this.cameras.main.width / 2 + 150, this.cameras.main.height / 2, '+', {
        fontSize: '24px',
        color: '#FFF',
      })
      .setOrigin(0.5)
      .setDepth(1000)

    // Create slider background
    const sliderBg = this.add
      .rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 200, 20, 0x555555)
      .setOrigin(0.5)
      .setDepth(1000)

    // Create slider handle
    const sliderHandle = this.add
      .rectangle(
        this.cameras.main.width / 2 - 100 + 200 * (currentArmies / maxArmies),
        this.cameras.main.height / 2 + 50,
        20,
        30,
        0xffffff
      )
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000)
    sliderHandle.setData('value', currentArmies)

    // Make slider handle draggable
    this.input.setDraggable(sliderHandle)

    // Max and Min labels for slider
    const minLabel = this.add
      .text(this.cameras.main.width / 2 - 110, this.cameras.main.height / 2 + 50, '1', {
        fontSize: '14px',
        color: '#FFF',
      })
      .setOrigin(1, 0.5)
      .setDepth(1000)

    const maxLabel = this.add
      .text(
        this.cameras.main.width / 2 + 110,
        this.cameras.main.height / 2 + 50,
        maxArmies.toString(),
        { fontSize: '14px', color: '#FFF' }
      )
      .setOrigin(0, 0.5)
      .setDepth(1000)

    // Create confirm button
    const confirmButton = this.add
      .rectangle(
        this.cameras.main.width / 2 - 80,
        this.cameras.main.height / 2 + 100,
        120,
        40,
        0x33aa33
      )
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000)

    const confirmText = this.add
      .text(this.cameras.main.width / 2 - 80, this.cameras.main.height / 2 + 100, 'Confirm', {
        fontSize: '18px',
        color: '#FFF',
      })
      .setOrigin(0.5)
      .setDepth(1000)

    // Create cancel button
    const cancelButton = this.add
      .rectangle(
        this.cameras.main.width / 2 + 80,
        this.cameras.main.height / 2 + 100,
        120,
        40,
        0xaa3333
      )
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(1000)

    const cancelText = this.add
      .text(this.cameras.main.width / 2 + 80, this.cameras.main.height / 2 + 100, 'Cancel', {
        fontSize: '18px',
        color: '#FFF',
      })
      .setOrigin(0.5)
      .setDepth(1000)

    // Group all UI elements for easy cleanup
    const uiElements = [
      panel,
      title,
      infoText,
      selectionText,
      minusButton,
      minusText,
      plusButton,
      plusText,
      sliderBg,
      sliderHandle,
      minLabel,
      maxLabel,
      confirmButton,
      confirmText,
      cancelButton,
      cancelText,
    ]

    // Function to update the display
    const updateArmySelection = (value: number) => {
      // Constrain to valid range (1 to maxArmies)
      const armiesValue = Math.min(Math.max(1, Math.round(value)), maxArmies)
      currentArmies = armiesValue

      // Update text
      selectionText.setText(`Armies to move: ${armiesValue}`)

      // Update slider position
      const newX = this.cameras.main.width / 2 - 100 + 200 * (armiesValue / maxArmies)
      sliderHandle.x = newX
    }

    // Minus button click
    minusButton.on('pointerdown', () => {
      if (currentArmies > 1) {
        updateArmySelection(currentArmies - 1)
      }
    })

    // Add hover effects for minus button
    minusButton.on('pointerover', () => {
      minusButton.setFillStyle(0x666666)
    })
    minusButton.on('pointerout', () => {
      minusButton.setFillStyle(0x444444)
    })

    // Plus button click
    plusButton.on('pointerdown', () => {
      if (currentArmies < maxArmies) {
        updateArmySelection(currentArmies + 1)
      }
    })

    // Add hover effects for plus button
    plusButton.on('pointerover', () => {
      plusButton.setFillStyle(0x666666)
    })
    plusButton.on('pointerout', () => {
      plusButton.setFillStyle(0x444444)
    })

    // Slider drag
    this.input.on(
      'drag',
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number
      ) => {
        if (gameObject === sliderHandle) {
          // Constrain x position to slider bounds
          const minX = this.cameras.main.width / 2 - 100
          const maxX = this.cameras.main.width / 2 + 100
          const newX = Math.min(Math.max(dragX, minX), maxX)

          // Update position
          gameObject.x = newX

          // Calculate value based on position
          const percentage = (newX - minX) / (maxX - minX)
          const value = Math.max(1, Math.min(Math.round(percentage * maxArmies), maxArmies))

          // Update display
          updateArmySelection(value)
        }
      }
    )

    // Cancel drag when pointer is released
    this.input.on('dragend', () => {
      // This ensures we don't keep dragging after release
    })

    // Confirm button hover effects
    confirmButton.on('pointerover', () => {
      confirmButton.setFillStyle(0x44cc44)
    })
    confirmButton.on('pointerout', () => {
      confirmButton.setFillStyle(0x33aa33)
    })

    // Cancel button hover effects
    cancelButton.on('pointerover', () => {
      cancelButton.setFillStyle(0xcc4444)
    })
    cancelButton.on('pointerout', () => {
      cancelButton.setFillStyle(0xaa3333)
    })

    // Confirm button click - move the armies
    confirmButton.on('pointerdown', () => {
      // Create button press animation
      this.tweens.add({
        targets: confirmButton,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Move the armies
          source.removeArmies(currentArmies)
          destination.addArmies(currentArmies)
          this.actionText.setText(
            `Moved ${currentArmies} armies from ${source.name} to ${destination.name}. You cannot fortify again this turn.`
          )

          this.hasFortified = true

          // Clean up UI and event listeners
          this.input.off('drag')
          this.input.off('dragend')
          uiElements.forEach((element) => element.destroy())

          // Reset selections
          source.setSelected(false)
          window.gameVars.selectedTerritory = null
          window.gameVars.targetTerritory = null
        },
      })
    })

    // Cancel button click
    cancelButton.on('pointerdown', () => {
      // Create button press animation
      this.tweens.add({
        targets: cancelButton,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Clean up UI and event listeners
          this.input.off('drag')
          this.input.off('dragend')
          uiElements.forEach((element) => element.destroy())

          // Reset selections
          source.setSelected(false)
          window.gameVars.selectedTerritory = null
          window.gameVars.targetTerritory = null

          this.actionText.setText('Fortify canceled')
        },
      })
    })

    // Initial setup - start with current value
    updateArmySelection(currentArmies)
  }

  checkGameOver() {
    let activePlayers = 0
    let lastActivePlayerIndex = -1

    window.gameVars.players.forEach((player, index) => {
      if (!player.eliminated) {
        activePlayers++
        lastActivePlayerIndex = index
      }
    })

    // If only one player remains, they win
    if (activePlayers === 1) {
      this.gameOver(lastActivePlayerIndex)
      return
    }

    // Also check if any player has conquered all territories
    window.gameVars.players.forEach((player, index) => {
      if (player.territories.length === this.territories.length) {
        this.gameOver(index)
      }
    })
  }

  gameOver(winnerIndex: number) {
    // Display game over message
    const overlay = this.add.rectangle(600, 400, 600, 300, 0x000000, 0.8).setDepth(1000)

    // Add fade-in animation for game over screen
    overlay.alpha = 0
    this.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 800,
      ease: 'Power2',
    })

    this.add
      .text(600, 350, 'GAME OVER', {
        fontSize: '48px',
        color: '#FFF',
      })
      .setOrigin(0.5)
      .setDepth(1000)

    this.add
      .text(600, 425, `Player ${winnerIndex + 1} Wins!`, {
        fontSize: '32px',
        color: this.hexNumToHexString(window.gameVars.players[winnerIndex].color),
      })
      .setOrigin(0.5)
      .setDepth(1000)

    // Add restart button with animation
    const restartButton = this.add.rectangle(600, 500, 200, 50, 0x444444).setInteractive()
    this.add
      .text(600, 500, 'Play Again', {
        fontSize: '24px',
        color: '#FFF',
      })
      .setOrigin(0.5)
      .setDepth(1000)

    // Add button hover effect
    restartButton.on('pointerover', () => {
      this.tweens.add({
        targets: restartButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: 'Sine.easeOut',
      })
    })

    restartButton.on('pointerout', () => {
      this.tweens.add({
        targets: restartButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Sine.easeOut',
      })
    })

    restartButton.on('pointerdown', () => {
      // Add fade out transition
      this.cameras.main.fadeOut(500, 0, 0, 0)

      // Start MainMenuScene after fade completes
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MainMenuScene')
      })
    })
  }

  showPlayerEliminationMessage(playerId: number) {
    const messageBox = this.add.container(600, 400)

    const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.8)
    messageBox.add(bg)

    const message = this.add
      .text(0, -30, `Player ${playerId + 1} Eliminated!`, {
        fontSize: '28px',
        color: this.hexNumToHexString(window.gameVars.players[playerId].color),
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
    messageBox.add(message)

    const subtext = this.add
      .text(0, 10, 'Lost all territories and is out of the game', {
        fontSize: '18px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
    messageBox.add(subtext)

    const continueButton = this.add.rectangle(0, 60, 160, 40, 0x444444).setInteractive()
    const buttonText = this.add
      .text(0, 60, 'Continue', {
        fontSize: '18px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)

    messageBox.add(continueButton)
    messageBox.add(buttonText)

    continueButton.on('pointerover', () => continueButton.setFillStyle(0x666666))
    continueButton.on('pointerout', () => continueButton.setFillStyle(0x444444))
    continueButton.on('pointerdown', () => {
      messageBox.destroy()
      // Resume game flow
      this.updateGameInfo()
    })

    messageBox.setDepth(1000)
  }
}
