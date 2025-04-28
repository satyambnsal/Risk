import * as Phaser from 'phaser'
import { TerritoryManager } from '../objects/TerritoryManager'
import { Territory } from '../objects/Territory'
import { TerritoryData, ContinentData, Player } from '../types'
import { NetworkManager } from '../network/NetworkManager'

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
  private territoryManager!: TerritoryManager
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
  private networkManager!: NetworkManager
  private isLocalPlayerTurn: boolean = false
  private myPlayerId: number = -1

  constructor() {
    super({ key: 'GameScene' })
    this.continents = continentsData
  }

  create() {
    // Add a dark background
    this.add.rectangle(600, 400, 1200, 800, 0x000000).setOrigin(0.5)

    // Start with camera faded out, then fade in
    this.cameras.main.fadeIn(800, 0, 0, 0)

    // Initialize territory manager
    this.territoryManager = new TerritoryManager(this, adjacencyMapData)

    // Set up territory click handler
    this.territoryManager.onTerritoryClick = (territory) => {
      this.handleTerritoryClick(territory)
    }

    // Create territories
    this.territoryManager.createTerritories(territoriesData)

    // Draw connection lines between territories
    const graphics = this.add.graphics()
    this.territoryManager.drawConnectionLines(graphics)

    // Initialize game info display
    this.setupGameInfo()

    // Create dice display
    this.createDiceDisplay()

    // Create action button
    this.setupButtons()

    // Initialize network manager
    this.networkManager = new NetworkManager(this)
    this.initializeNetworking()
  }

  private async initializeNetworking() {
    // Connect to the Colyseus server
    const connected = await this.networkManager.connect()

    if (connected) {
      console.log('Connected to game server!')

      // Set up callbacks for server state changes
      this.networkManager.setOnStateChangeCallback((state) => {
        this.handleStateUpdate(state)
      })

      this.networkManager.setOnGameOverCallback((data) => {
        this.gameOver(data.winnerId)
      })
    } else {
      console.error('Failed to connect to game server!')
      // Show an error message to the user
      this.showConnectionError()
    }
  }

  private handleStateUpdate(state: any) {
    // Store my player ID based on session ID
    if (this.myPlayerId === -1) {
      const sessionId = this.networkManager.getSessionId()
      const myPlayerData = state.players[sessionId]
      if (myPlayerData) {
        this.myPlayerId = myPlayerData.id
        console.log('My player ID:', this.myPlayerId)
      }
    }

    // Update territories
    for (const [id, territory] of Object.entries(state.territories)) {
      const territoryId = parseInt(id)
      const territoryObject = this.territoryManager.getTerritory(territoryId)
      if (territoryObject) {
        // Update territory owner
        if (territory.owner !== -1) {
          const player = this.findPlayerById(territory.owner)
          if (player) {
            this.territoryManager.setTerritoryOwner(territoryId, player)
          }
        }

        // Update territory armies
        this.territoryManager.setTerritoryArmies(territoryId, territory.armies)

        // Update territory selection
        const isSelected = territoryId === state.selectedTerritoryId
        this.territoryManager.setTerritorySelected(territoryId, isSelected)
      }
    }

    // Update game phase
    window.gameState.gamePhase = state.gamePhase
    window.gameState.currentPlayerIndex = state.currentPlayerIndex
    window.gameState.selectedTerritoryId = state.selectedTerritoryId
    window.gameState.targetTerritoryId = state.targetTerritoryId
    window.gameState.initialPlacementDone = state.initialPlacementDone

    // Update player info
    for (const [sessionId, playerData] of Object.entries(state.players)) {
      // Find the corresponding local player
      const localPlayerIndex = playerData.id
      if (localPlayerIndex < window.gameState.players.length) {
        const player = window.gameState.players[localPlayerIndex]
        player.armies = 0 // Reset and recalculate
        player.reinforcements = playerData.reinforcements
        player.eliminated = playerData.eliminated

        // Update player territories
        player.territories = []
        for (const territoryId of playerData.territories) {
          player.territories.push(territoryId)
        }
      }
    }

    this.isLocalPlayerTurn = window.gameState.currentPlayerIndex === this.myPlayerId

    // Enable/disable end turn button based on turn
    if (this.isLocalPlayerTurn && window.gameState.gamePhase !== 'initialPlacement') {
      this.endTurnButton.setInteractive()
      this.endTurnButton.setFillStyle(0x444444)
    } else {
      this.endTurnButton.disableInteractive()
      this.endTurnButton.setFillStyle(0x333333)
    }

    // Update game UI
    this.updateGameInfo()
  }

  private findPlayerById(id: number): any {
    return window.gameState.players.find((p) => p.id === id) || null
  }

  private showConnectionError() {
    // Display an error message in the game
    const errorText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        'Could not connect to game server.\nPlease refresh the page to try again.',
        {
          fontSize: '24px',
          color: '#FF0000',
          align: 'center',
        }
      )
      .setOrigin(0.5)
      .setDepth(1000)

    // Add a background for better visibility
    const bg = this.add
      .rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 500, 150, 0x000000, 0.7)
      .setOrigin(0.5)
      .setDepth(999)
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

  updateGameInfo() {
    const currentPlayer = window.gameState.players[window.gameState.currentPlayerIndex]

    if (currentPlayer?.eliminated) {
      // Skip to next player if current one is eliminated
      this.endTurn()
      return
    }

    // Update player text with color
    this.playerText.setText(`Player: ${window.gameState.currentPlayerIndex + 1}`)
    if (currentPlayer) {
      this.playerText.setColor(this.hexNumToHexString(currentPlayer.color))
    }

    // Update phase text
    if (window.gameState.gamePhase === 'initialPlacement') {
      this.phaseText.setText('Phase: Initial Placement')
    } else {
      this.phaseText.setText(`Phase: ${this.capitalizeFirstLetter(window.gameState.gamePhase)}`)
    }

    // Update action text based on game phase and whether it's the local player's turn
    if (this.isLocalPlayerTurn) {
      // Update end turn button text based on phase
      if (window.gameState.gamePhase === 'placement') {
        this.endTurnText.setText('Start Attack Phase')
      } else if (window.gameState.gamePhase === 'attack') {
        this.endTurnText.setText('Start Fortify Phase')
      } else if (window.gameState.gamePhase === 'fortify') {
        this.endTurnText.setText('End Turn')
      } else {
        // Initial placement phase
        this.endTurnText.setText('Please Place Armies')
      }

      // Action text for local player's turn
      if (window.gameState.gamePhase === 'initialPlacement') {
        this.actionText.setText(
          `Your Turn: Initial Placement\nRemaining: ${currentPlayer?.reinforcements ?? 0}`
        )
      } else if (window.gameState.gamePhase === 'placement') {
        this.actionText.setText(
          `Your Turn: Place your reinforcements\nRemaining: ${currentPlayer?.reinforcements ?? 0}`
        )
      } else if (window.gameState.gamePhase === 'attack') {
        this.actionText.setText('Your Turn: Select your territory to attack from')
      } else if (window.gameState.gamePhase === 'fortify') {
        this.actionText.setText('Your Turn: Select territory to move armies from or end turn')
      }
    } else {
      // It's another player's turn
      if (window.gameState.gamePhase === 'initialPlacement') {
        this.actionText.setText(
          `Player ${window.gameState.currentPlayerIndex + 1}'s turn\nInitial Placement`
        )
      } else if (window.gameState.gamePhase === 'placement') {
        this.actionText.setText(
          `Player ${window.gameState.currentPlayerIndex + 1}'s turn\nPlacement Phase`
        )
      } else if (window.gameState.gamePhase === 'attack') {
        this.actionText.setText(
          `Player ${window.gameState.currentPlayerIndex + 1}'s turn\nAttack Phase`
        )
      } else if (window.gameState.gamePhase === 'fortify') {
        this.actionText.setText(
          `Player ${window.gameState.currentPlayerIndex + 1}'s turn\nFortify Phase`
        )
      }
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
    // Send end phase message to server
    this.networkManager.endPhase()
  }

  handleTerritoryClick(territory: Territory) {
    // Only allow interactions during the local player's turn
    if (!this.isLocalPlayerTurn && window.gameState.gamePhase !== 'waiting') {
      this.actionText.setText(`It's not your turn!`)
      return
    }

    // Send territory selection to the server
    this.networkManager.selectTerritory(territory.id)
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

  rollDice(count: number): number[] {
    const results = []
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * 6) + 1)
    }
    return results
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
        color: this.hexNumToHexString(window.gameState.players[winnerIndex].color),
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

    const bg = this.add.rectangle(0, 0, 600, 300, 0x000000, 0.8)
    messageBox.add(bg)

    const message = this.add
      .text(0, -30, `Player ${playerId + 1} Eliminated!`, {
        fontSize: '28px',
        color: this.hexNumToHexString(window.gameState.players[playerId].color),
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
