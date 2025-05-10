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
  @type('boolean') gameStarted: boolean = false
}

export class LobbyRoom extends Room<LobbyState> {
  maxClients = 6
  autoDispose = true // Automatically dispose the room when empty

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
      if (player && typeof value === 'string' && value.trim().length > 0) {
        player.name = value.trim()
        console.log(`Player changed name to ${value}`)
      }
    })

    // Handle starting the game (only host can do this)
    this.onMessage('startGame', (client) => {
      if (client.sessionId === this.state.hostId) {
        // Check if we have at least 2 players
        if (this.state.players.size >= 2) {
          console.log('Host started the game!')
          this.state.gameStarted = true

          // Broadcast to all clients that the game is starting
          this.broadcast('startGame')

          // Lock the room to prevent new players from joining
          this.lock()
        } else {
          // Send message only to host that we need more players
          client.send('errorMessage', 'Need at least 2 players to start the game')
        }
      } else {
        client.send('errorMessage', 'Only the host can start the game')
      }
    })

    // Handle chat messages
    this.onMessage('chat', (client, message) => {
      const player = this.state.players.get(client.sessionId)
      if (player && typeof message === 'string' && message.trim().length > 0) {
        // Broadcast the chat message to all clients
        this.broadcast('chatMessage', {
          sender: player.name,
          message: message.trim(),
        })
      }
    })
  }

  onJoin(client: Client, options: any) {
    console.log(`Player ${client.sessionId} joined the lobby!`)

    // Don't allow joins if game has already started
    if (this.state.gameStarted) {
      throw new Error('Game has already started')
    }

    // Create new player in the lobby
    const player = new LobbyPlayer()
    player.sessionId = client.sessionId

    if (options.playerName && typeof options.playerName === 'string') {
      player.name = options.playerName.substring(0, 20) // Limit name length
    } else {
      player.name = `Player ${this.state.players.size + 1}`
    }

    this.state.players.set(client.sessionId, player)

    // Set the first player as the host
    if (this.state.players.size === 1) {
      this.state.hostId = client.sessionId
      console.log(`Player ${client.sessionId} is the host`)
    }

    // Notify other players that someone joined
    this.broadcast(
      'playerJoin',
      {
        id: client.sessionId,
        name: player.name,
      },
      { except: client }
    )
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Player ${client.sessionId} left the lobby!`)
    const player = this.state.players.get(client.sessionId)
    const playerName = player ? player.name : 'Unknown player'

    this.state.players.delete(client.sessionId)

    // Notify other players that someone left
    this.broadcast('playerLeave', {
      id: client.sessionId,
      name: playerName,
    })

    // If the host left, assign a new host if there are remaining players
    if (client.sessionId === this.state.hostId && this.state.players.size > 0) {
      this.state.hostId = this.state.players.keys().next().value
      console.log(`New host assigned: ${this.state.hostId}`)

      // Notify players of the new host
      this.broadcast('newHost', {
        id: this.state.hostId,
        name: this.state.players.get(this.state.hostId).name,
      })
    }
  }

  onDispose() {
    console.log('Lobby room disposed!')
  }
}
