import * as Phaser from 'phaser'
import { Client, Room } from 'colyseus.js'

export class NetworkManager {
  private client: Client
  private room: Room | null = null
  private scene: Phaser.Scene
  private connected: boolean = false
  private reconnectionAttempts: number = 0
  private maxReconnectionAttempts: number = 5

  // Callback handlers for game events
  private onStateChangeCallback: ((state: any) => void) | null = null
  private onPlayerJoinCallback: ((player: any) => void) | null = null
  private onPlayerLeaveCallback: ((player: any) => void) | null = null
  private onGameOverCallback: ((data: any) => void) | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    // Connect to Colyseus server (default localhost:2567 in development)
    const serverUrl =
      process.env.NODE_ENV === 'production'
        ? 'wss://your-production-server.com' //TODO: Replace with production server URL
        : 'ws://localhost:2567'
    console.log('serverUrl', serverUrl)

    this.client = new Client(serverUrl)
    console.log('NetworkManager initialized with server URL:', serverUrl)
  }

  async connect(): Promise<boolean> {
    try {
      console.log('Connecting to Colyseus server...')

      // Join or create a fog_of_noir room
      // this.room = await this.client.joinOrCreate('part1_room')
      this.room = await this.client.joinOrCreate('fog_of_noir')
      this.connected = true

      console.log('Connected to room:', this.room.roomId)

      // Set up room event handlers
      this.setupRoomHandlers()

      return true
    } catch (error) {
      console.error('Failed to connect to Colyseus server:', error)
      return false
    }
  }

  private setupRoomHandlers() {
    if (!this.room) return

    // Handle state changes from the server
    this.room.onStateChange((state) => {
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(state)
      }
    })

    // Handle when a player joins
    this.room.onMessage('playerJoin', (player) => {
      console.log('Player joined:', player)
      if (this.onPlayerJoinCallback) {
        this.onPlayerJoinCallback(player)
      }
    })

    // Handle when a player leaves
    this.room.onMessage('playerLeave', (player) => {
      console.log('Player left:', player)
      if (this.onPlayerLeaveCallback) {
        this.onPlayerLeaveCallback(player)
      }
    })

    // Handle game over message
    this.room.onMessage('gameOver', (data) => {
      console.log('Game over:', data)
      if (this.onGameOverCallback) {
        this.onGameOverCallback(data)
      }
    })

    // Handle disconnection
    this.room.onLeave((code) => {
      this.connected = false
      console.log('Disconnected from room with code:', code)

      // Attempt to reconnect if disconnected unexpectedly
      if (code >= 1000) {
        this.attemptReconnection()
      }
    })
  }

  private async attemptReconnection() {
    if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectionAttempts++
    console.log(
      `Attempting to reconnect (${this.reconnectionAttempts}/${this.maxReconnectionAttempts})...`
    )

    try {
      // Wait before trying to reconnect
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Try to reconnect
      const success = await this.connect()
      if (success) {
        this.reconnectionAttempts = 0
        console.log('Reconnected successfully')
      } else {
        this.attemptReconnection()
      }
    } catch (error) {
      console.error('Reconnection attempt failed:', error)
      this.attemptReconnection()
    }
  }

  // Public methods for game interaction

  // Send a territory selection to the server
  selectTerritory(territoryId: number) {
    if (!this.room || !this.connected) return
    this.room.send('selectTerritory', territoryId)
  }

  // End the current phase
  endPhase() {
    if (!this.room || !this.connected) return
    this.room.send('endPhase')
  }

  // Set callbacks
  setOnStateChangeCallback(callback: (state: any) => void) {
    this.onStateChangeCallback = callback
  }

  setOnPlayerJoinCallback(callback: (player: any) => void) {
    this.onPlayerJoinCallback = callback
  }

  setOnPlayerLeaveCallback(callback: (player: any) => void) {
    this.onPlayerLeaveCallback = callback
  }

  setOnGameOverCallback(callback: (data: any) => void) {
    this.onGameOverCallback = callback
  }

  // Get the session ID assigned by Colyseus
  getSessionId(): string {
    return this.room ? this.room.sessionId : ''
  }

  // Check if connected to the server
  isConnected(): boolean {
    return this.connected
  }

  // Disconnect from the server
  disconnect() {
    if (this.room) {
      this.room.leave()
      this.room = null
    }
    this.connected = false
  }
}
