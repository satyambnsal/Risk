export interface TerritoryInterface {
  id: number
  name: string
  owner: number | null
  armies: number
  isSelected: boolean
  continent: string
  territoryImage: Phaser.GameObjects.Image
  originalScale: number
  setSelected(selected: boolean): void
  setOwner(player: Player): void
  addArmies(count: number): void
  removeArmies(count: number): void
  setArmies(count: number): void
}
export interface TerritoryHandler {
  handleTerritoryClick(territory: TerritoryInterface): void
}

export interface Player {
  id: number
  color: number
  armies: number
  territories: number[]
  reinforcements: number
  eliminated: boolean
}

export interface TerritoryData {
  id: number
  name: string
  x: number
  y: number
  continent: string
}

export interface ContinentData {
  territories: number[]
  bonus: number
}

export interface GameVars {
  players: Player[]
  currentPlayerIndex: number
  gamePhase: 'initialPlacement' | 'placement' | 'attack' | 'fortify'
  selectedTerritory: TerritoryInterface | null
  targetTerritory: TerritoryInterface | null
  initialPlacementDone: boolean
}

// Extend Window interface once to avoid duplicate declarations
declare global {
  interface Window {
    gameVars: GameVars
  }
}
