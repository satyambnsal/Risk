import { Room, Client } from 'colyseus'
import { Schema, type, MapSchema } from '@colyseus/schema'

export class LobbyPlayer extends Schema {
  @type('string') sessionId: string
  @type('string') name: string = 'Player'
  @type('boolean') ready: boolean = false
}

export class LobbyState extends Schema {
  @type({ map: LobbyPlayer }) players = new MapSchema<LobbyPlayer>()
  @type('string') hostId: string
  @type('string') roomName: string = 'New Lobby'
}

export class LobbyRoom extends Room<LobbyState> {
  maxClients = 4

  onCreate(options: any) {
    console.log('Lobby room created!', options)

    this.setState(new LobbyState())

    if (options.roomName) {
      this.state.roomName = options.roomName
    }

    // Handle player ready/not ready status
    this.onMessage('ready', (client, value) => {
      const player = this.state.players.get(client.sessionId)
      if (player) {
        player.ready = value
        console.log(`Player ${player.name} is ${value ? 'ready' : 'not ready'}`)
      }
    })

    // Handle name changes
    this.onMessage('setName', (client, value) => {
      const player = this.state.players.get(client.sessionId)
      if (player) {
        player.name = value
        console.log(`Player changed name to ${value}`)
      }
    })

    // Handle starting the game (only host can do this)
    this.onMessage('startGame', (client) => {
      if (client.sessionId === this.state.hostId) {
        console.log('Host started the game!')
        // In a real implementation, you would transition to the game room here
      }
    })
  }

  onJoin(client: Client, options: any) {
    console.log(`Player ${client.sessionId} joined the lobby!`)

    // Create new player in the lobby
    const player = new LobbyPlayer()
    player.sessionId = client.sessionId

    if (options.playerName) {
      player.name = options.playerName
    }

    this.state.players.set(client.sessionId, player)

    // Set the first player as the host
    if (this.state.players.size === 1) {
      this.state.hostId = client.sessionId
      console.log(`Player ${client.sessionId} is the host`)
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Player ${client.sessionId} left the lobby!`)
    this.state.players.delete(client.sessionId)

    // If the host left, assign a new host if there are remaining players
    if (client.sessionId === this.state.hostId && this.state.players.size > 0) {
      this.state.hostId = this.state.players.keys().next().value
      console.log(`New host assigned: ${this.state.hostId}`)
    }
  }

  onDispose() {
    console.log('Lobby room disposed!')
  }
}
