import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema'

// territory schema
export class Territory extends Schema {
  @type('uint8') id: number
  @type('string') name: string
  @type('string') continent: string
  @type('int8') owner: number = -1
  @type('uint8') armies: number = 0
  @type('uint16') x: number
  @type('uint16') y: number
}

// player schema
export class Player extends Schema {
  @type('uint8') id: number
  @type('uint32') color: number
  @type('uint8') reinforcements: number = 0
  @type('boolean') eliminated: boolean = false
  @type(['uint8']) territories = new ArraySchema<number>()
}

// game state schema
export class FogOfNoirState extends Schema {
  @type('string') gamePhase: string = 'waiting' // waiting, initialPlacement, placement, attack, fortify
  @type('uint8') currentPlayerIndex: number = 0
  @type('boolean') initialPlacementDone: boolean = false
  @type('int8') selectedTerritoryId: number = -1 // -1 means no selection
  @type('int8') targetTerritoryId: number = -1 // -1 means no target

  @type({ map: Player }) players = new MapSchema<Player>()
  @type({ map: Territory }) territories = new MapSchema<Territory>()

  // For tracking adjacency between territories
  @type({ map: ['uint8'] }) adjacencyMap = new MapSchema<ArraySchema<number>>()

  // For tracking continents and their bonus values
  @type('string') continentData: string = '{}' // JSON string of continent data
}
