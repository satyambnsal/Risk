import { Room, Client } from 'colyseus'
import { FogOfNoirState, Player, Territory } from './schema/FogOfNoirState'
import { ArraySchema } from '@colyseus/schema'

export class FogOfNoirRoom extends Room<FogOfNoirState> {
  maxClients = 6 // Supports 2-6 players

  private territoriesData = [
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

  private adjacencyMapData = {
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

  private continentsData = {
    'North America': {
      territories: [0, 1, 2, 3],
      bonus: 5,
    },
    Europe: {
      territories: [4, 5, 6, 7, 8, 9],
      bonus: 5,
    },
    Africa: {
      territories: [10, 11, 12, 13, 14],
      bonus: 3,
    },
    'South America': {
      territories: [15, 16, 17, 18, 19],
      bonus: 2,
    },
    Australia: {
      territories: [20, 21, 22, 23, 24],
      bonus: 2,
    },
  }

  // Player colors
  private colors = [0xcf402e, 0x2ca5c7, 0x96c72c, 0xc7b52c, 0xb52cc7, 0x00ffff]

  onCreate(options: any) {
    // Initialize room state
    this.setState(new FogOfNoirState())

    // Store adjacency map
    for (const [territoryId, adjacentIds] of Object.entries(this.adjacencyMapData)) {
      const adjacentArray = new ArraySchema<number>()
      for (const id of adjacentIds) {
        adjacentArray.push(id)
      }
      this.state.adjacencyMapData = JSON.stringify(this.adjacencyMapData)
    }

    // Store continent data
    this.state.continentData = JSON.stringify(this.continentsData)

    // Create territories
    this.territoriesData.forEach((data) => {
      const territory = new Territory()
      territory.id = data.id
      territory.name = data.name
      territory.continent = data.continent
      territory.x = data.x
      territory.y = data.y
      territory.owner = -1 // No owner initially
      territory.armies = 0

      this.state.territories.set(data.id.toString(), territory)
    })

    // Set up message handlers
    this.setupMessageHandlers()
  }

  setupMessageHandlers() {
    // Message handler for territory selection
    this.onMessage('selectTerritory', (client, territoryId: number) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return

      // Handle based on current game phase
      if (this.state.gamePhase === 'initialPlacement' || this.state.gamePhase === 'placement') {
        this.handlePlacementAction(client, territoryId)
      } else if (this.state.gamePhase === 'attack') {
        this.handleAttackSelection(client, territoryId)
      } else if (this.state.gamePhase === 'fortify') {
        this.handleFortifySelection(client, territoryId)
      }
    })

    // Message handler for ending phases/turns
    this.onMessage('endPhase', (client) => {
      const playerIndex = this.getPlayerIndex(client)
      if (playerIndex !== this.state.currentPlayerIndex) return

      this.handleEndPhase()
    })

    // Add other message handlers as needed
  }

  getPlayerIndex(client: Client): number {
    const playerIds = Array.from(this.state.players.keys())
    return playerIds.findIndex((id) => id === client.sessionId)
  }

  handlePlacementAction(client: Client, territoryId: number) {
    const playerIndex = this.getPlayerIndex(client)
    if (playerIndex !== this.state.currentPlayerIndex) return

    const player = this.state.players.get(client.sessionId)
    const territory = this.state.territories.get(territoryId.toString())

    if (!player || !territory) return

    // INITIAL PLACEMENT PHASE
    if (this.state.gamePhase === 'initialPlacement') {
      if (territory.owner === player.id && player.reinforcements > 0) {
        // Place an army
        territory.armies += 1
        player.reinforcements--

        // If current player has placed all armies, move to next player
        if (player.reinforcements === 0) {
          // Move to the next player
          this.advanceToNextPlayer()

          // Check if all players have placed their initial armies
          let allPlaced = true
          this.state.players.forEach((player) => {
            if (player.reinforcements > 0) {
              allPlaced = false
            }
          })

          // If all players have placed their armies, start regular game flow
          if (allPlaced) {
            this.state.initialPlacementDone = true
            this.state.gamePhase = 'placement'

            // Reset to first player and give reinforcements
            this.state.currentPlayerIndex = 0
            const firstPlayerSessionId = Array.from(this.state.players.keys())[0]
            const firstPlayer = this.state.players.get(firstPlayerSessionId)
            if (firstPlayer) {
              firstPlayer.reinforcements = this.calculateReinforcements(firstPlayer)
            }
          }
        }
      }
    }
    // REGULAR PLACEMENT PHASE
    else if (this.state.gamePhase === 'placement') {
      if (territory.owner === player.id && player.reinforcements > 0) {
        // Place an army
        territory.armies += 1
        player.reinforcements--
      }
    }
  }

  handleAttackSelection(client: Client, territoryId: number) {
    const playerIndex = this.getPlayerIndex(client)
    if (playerIndex !== this.state.currentPlayerIndex) return

    const player = this.state.players.get(client.sessionId)
    if (!player) return

    if (this.state.selectedTerritoryId === -1) {
      // Selecting the attacking territory
      const territory = this.state.territories.get(territoryId.toString())
      if (!territory) return

      if (territory.owner === player.id && territory.armies > 1) {
        this.state.selectedTerritoryId = territoryId
        // We don't need to set isSelected in state since frontend will show selection based on selectedTerritoryId
      }
    } else {
      // Selecting the defending territory and attack
      const targetTerritory = this.state.territories.get(territoryId.toString())
      if (!targetTerritory) return

      const selectedTerritory = this.state.territories.get(
        this.state.selectedTerritoryId.toString()
      )
      if (!selectedTerritory) return

      // Check if target is owned by enemy and adjacent
      if (
        targetTerritory.owner !== player.id &&
        this.areTerritoriesAdjacent(this.state.selectedTerritoryId, territoryId)
      ) {
        this.state.targetTerritoryId = territoryId
        this.resolveAttack()
      } else {
        // If clicking on own territory, deselect
        if (territoryId === this.state.selectedTerritoryId) {
          this.state.selectedTerritoryId = -1
        } else {
          // Invalid target, reset selection
          this.state.selectedTerritoryId = -1
        }
      }
    }
  }

  handleFortifySelection(client: Client, territoryId: number) {
    const playerIndex = this.getPlayerIndex(client)
    if (playerIndex !== this.state.currentPlayerIndex) return

    const player = this.state.players.get(client.sessionId)
    if (!player) return

    if (this.state.selectedTerritoryId === -1) {
      // Selecting the source territory
      const territory = this.state.territories.get(territoryId.toString())
      if (!territory) return

      if (territory.owner === player.id && territory.armies > 1) {
        this.state.selectedTerritoryId = territoryId
      }
    } else {
      // Selecting the destination territory
      const targetTerritory = this.state.territories.get(territoryId.toString())
      if (!targetTerritory) return

      const selectedTerritory = this.state.territories.get(
        this.state.selectedTerritoryId.toString()
      )
      if (!selectedTerritory) return

      // Check if target is owned by player and not the same as source
      if (targetTerritory.owner === player.id && territoryId !== this.state.selectedTerritoryId) {
        this.state.targetTerritoryId = territoryId

        // Calculate move armies (half by default, min 1, max armies-1)
        const maxArmies = selectedTerritory.armies - 1
        const armiesToMove = Math.max(1, Math.floor(maxArmies / 2))

        // Execute the fortify move
        selectedTerritory.armies -= armiesToMove
        targetTerritory.armies += armiesToMove

        // Reset selections
        this.state.selectedTerritoryId = -1
        this.state.targetTerritoryId = -1
      } else if (territoryId === this.state.selectedTerritoryId) {
        // Deselect if clicking same territory
        this.state.selectedTerritoryId = -1
      } else {
        // Invalid target, reset selection
        this.state.selectedTerritoryId = -1
      }
    }
  }

  handleEndPhase() {
    // Handle different phase transitions
    if (this.state.gamePhase === 'placement') {
      // From placement -> attack (same player)
      this.state.gamePhase = 'attack'
      this.state.selectedTerritoryId = -1
      this.state.targetTerritoryId = -1
    } else if (this.state.gamePhase === 'attack') {
      // From attack -> fortify (same player)
      this.state.gamePhase = 'fortify'
      this.state.selectedTerritoryId = -1
      this.state.targetTerritoryId = -1
    } else if (this.state.gamePhase === 'fortify') {
      // Reset selected territories
      this.state.selectedTerritoryId = -1
      this.state.targetTerritoryId = -1

      // Find the next active player (not eliminated)
      let nextPlayerFound = false
      let nextPlayerIndex = this.state.currentPlayerIndex
      const playerSessionIds = Array.from(this.state.players.keys())
      const playerCount = playerSessionIds.length

      for (let i = 1; i <= playerCount; i++) {
        // Calculate next player index with wrapping
        nextPlayerIndex = (this.state.currentPlayerIndex + i) % playerCount
        const nextPlayerSessionId = playerSessionIds[nextPlayerIndex]
        const nextPlayer = this.state.players.get(nextPlayerSessionId)

        // Check if this player is still in the game
        if (nextPlayer && !nextPlayer.eliminated) {
          nextPlayerFound = true
          break
        }
      }

      // If no active players found besides current one, game is over
      if (!nextPlayerFound) {
        // Current player wins!
        this.gameOver(this.state.currentPlayerIndex)
        return
      }

      // Move to the next active player
      this.state.currentPlayerIndex = nextPlayerIndex
      const currentPlayerSessionId = playerSessionIds[this.state.currentPlayerIndex]
      const currentPlayer = this.state.players.get(currentPlayerSessionId)

      if (currentPlayer) {
        // Calculate reinforcements including continent bonuses for the new player
        currentPlayer.reinforcements = this.calculateReinforcements(currentPlayer)

        // Move to placement phase for next player
        this.state.gamePhase = 'placement'
      }
    }
  }

  // Helper methods to support the main functions

  areTerritoriesAdjacent(territoryId1: number, territoryId2: number): boolean {
    const adjacencyMap = JSON.parse(this.state.adjacencyMapData)
    return adjacencyMap[territoryId1]?.includes(territoryId2) || false
  }

  advanceToNextPlayer() {
    const playerSessionIds = Array.from(this.state.players.keys())
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % playerSessionIds.length
  }

  resolveAttack() {
    if (this.state.selectedTerritoryId === -1 || this.state.targetTerritoryId === -1) return

    const attackerTerritory = this.state.territories.get(this.state.selectedTerritoryId.toString())
    const defenderTerritory = this.state.territories.get(this.state.targetTerritoryId.toString())

    if (!attackerTerritory || !defenderTerritory) return

    // Maximum number of dice
    const maxAttackerDice = Math.min(3, attackerTerritory.armies - 1)
    const maxDefenderDice = Math.min(2, defenderTerritory.armies)

    // Roll dice
    const attackerDice = this.rollDice(maxAttackerDice).sort((a, b) => b - a)
    const defenderDice = this.rollDice(maxDefenderDice).sort((a, b) => b - a)

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
    attackerTerritory.armies -= attackerLosses
    defenderTerritory.armies -= defenderLosses

    // Check if defender was defeated
    if (defenderTerritory.armies <= 0) {
      // Get defender player
      let defenderPlayer = null
      for (const [sessionId, player] of this.state.players.entries()) {
        if (player.id === defenderTerritory.owner) {
          defenderPlayer = player
          break
        }
      }

      // Get attacker player
      const attackerPlayer = Array.from(this.state.players.values()).find(
        (player) => player.id === attackerTerritory.owner
      )

      if (!attackerPlayer) return

      // Calculate armies to move (all but 1 from attacker)
      const armiesToMove = attackerTerritory.armies - 1

      // Update territory ownership
      attackerTerritory.armies -= armiesToMove
      defenderTerritory.armies = armiesToMove

      // Update territory owner
      const oldOwner = defenderTerritory.owner
      defenderTerritory.owner = attackerPlayer.id

      // Update players' territory lists
      if (defenderPlayer) {
        const index = defenderPlayer.territories.indexOf(this.state.targetTerritoryId)
        if (index > -1) {
          defenderPlayer.territories.splice(index, 1)
        }

        // Check if the defender player has been eliminated
        if (defenderPlayer.territories.length === 0) {
          defenderPlayer.eliminated = true
        }
      }

      attackerPlayer.territories.push(this.state.targetTerritoryId)

      // Check for game over
      this.checkGameOver()
    }

    // Reset selections
    this.state.selectedTerritoryId = -1
    this.state.targetTerritoryId = -1
  }

  rollDice(count: number): number[] {
    const results: number[] = []
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * 6) + 1)
    }
    return results
  }

  calculateReinforcements(player: Player): number {
    // Base reinforcements from territories
    let reinforcements = Math.max(Math.floor(player.territories.length / 3), 3)

    // Add bonuses for continents
    const continents = JSON.parse(this.state.continentData)

    for (const continent in continents) {
      const continentTerritories = continents[continent].territories
      const bonus = continents[continent].bonus

      // Check if player owns all territories in the continent
      const ownsAll = continentTerritories.every((territoryId: number) =>
        player.territories.includes(territoryId)
      )

      if (ownsAll) {
        reinforcements += bonus
      }
    }

    return reinforcements
  }

  checkGameOver() {
    let activePlayers = 0
    let lastActivePlayerIndex = -1

    this.state.players.forEach((player, sessionId) => {
      if (!player.eliminated) {
        activePlayers++
        lastActivePlayerIndex = player.id
      }
    })

    // If only one player remains, they win
    if (activePlayers === 1) {
      this.gameOver(lastActivePlayerIndex)
      return true
    }

    // Also check if any player has conquered all territories
    this.state.players.forEach((player) => {
      if (player.territories.length === this.state.territories.size) {
        this.gameOver(player.id)
        return true
      }
    })

    return false
  }

  gameOver(winnerIndex: number) {
    // Set game phase to finished
    this.state.gamePhase = 'gameOver'

    // Broadcast game over message
    this.broadcast('gameOver', { winnerId: winnerIndex })
  }

  onJoin(client: Client, options: any) {
    console.log(`Player ${client.sessionId} joined the game`)

    // Create a new player
    const player = new Player()
    player.id = this.state.players.size
    player.color = this.colors[player.id]
    player.reinforcements = 0

    this.state.players.set(client.sessionId, player)

    // Start game if we have enough players (for testing, start with 2)
    if (this.state.players.size >= 2 && this.state.gamePhase === 'waiting') {
      this.startGame()
    }
  }

  startGame() {
    console.log('Starting game...')
    this.state.gamePhase = 'initialPlacement'

    // Calculate initial armies based on player count
    const numPlayers = this.state.players.size
    const initialArmies = Math.max(40 - (numPlayers - 2) * 5, 20)

    // Set initial armies for each player
    this.state.players.forEach((player) => {
      player.reinforcements = initialArmies
    })

    // Randomly assign territories
    this.assignTerritories()
  }

  assignTerritories() {
    // Get all territory IDs
    const territoryIds = Array.from(this.state.territories.keys()).map((id) => parseInt(id))

    // Shuffle territory IDs
    for (let i = territoryIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[territoryIds[i], territoryIds[j]] = [territoryIds[j], territoryIds[i]]
    }

    // Get player IDs in an array for easy cycling
    const playerSessionIds = Array.from(this.state.players.keys())
    const numPlayers = playerSessionIds.length

    // Assign territories evenly to players
    for (let i = 0; i < territoryIds.length; i++) {
      const territoryId = territoryIds[i]
      const playerSessionId = playerSessionIds[i % numPlayers]
      const player = this.state.players.get(playerSessionId)
      const territory = this.state.territories.get(territoryId.toString())

      if (player && territory) {
        territory.owner = player.id
        territory.armies = 1
        player.territories.push(territoryId)
        player.reinforcements--
      }
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Player ${client.sessionId} left the game`)

    // Handle player leaving
    if (this.state.players.has(client.sessionId)) {
      // TODO: Handle player leaving mid-game
      this.state.players.delete(client.sessionId)
    }
  }

  onDispose() {
    console.log('Room disposed')
  }
}
