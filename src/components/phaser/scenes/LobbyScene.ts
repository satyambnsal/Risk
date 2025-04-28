import * as Phaser from 'phaser'
import { Client } from 'colyseus.js'

export class LobbyScene extends Phaser.Scene {
  private client: Client | null = null
  private room: any = null
  private isHost: boolean = false
  private lobbyCode: string = ''
  private statusText!: Phaser.GameObjects.Text
  private playerListText!: Phaser.GameObjects.Text
  private backButton!: Phaser.GameObjects.Rectangle
  private startButton!: Phaser.GameObjects.Rectangle
  private startButtonText!: Phaser.GameObjects.Text
  private lobbyCodeText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'LobbyScene' })
  }

  init(data: any): void {
    this.isHost = data.isHost || false
    this.lobbyCode = data.lobbyCode || ''
  }

  create(): void {
    // Background
    this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    )

    // Add gradient background
    const gradient = this.add.graphics()
    gradient.fillGradientStyle(0x001133, 0x001133, 0x002266, 0x002266, 1)
    gradient.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)

    // Title
    this.add
      .text(this.cameras.main.width / 2, 80, 'GAME LOBBY', {
        fontSize: '48px',
        color: '#FFF',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)

    // Status Text
    this.statusText = this.add
      .text(this.cameras.main.width / 2, 150, 'Connecting to server...', {
        fontSize: '24px',
        color: '#FFF',
      })
      .setOrigin(0.5)

    // Lobby Code Display
    this.lobbyCodeText = this.add
      .text(this.cameras.main.width / 2, 200, '', {
        fontSize: '28px',
        color: '#FFFF00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // Player List
    this.add
      .text(this.cameras.main.width / 2, 250, 'PLAYERS:', {
        fontSize: '28px',
        color: '#FFF',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.playerListText = this.add
      .text(this.cameras.main.width / 2, 350, '', {
        fontSize: '20px',
        color: '#FFF',
        align: 'center',
      })
      .setOrigin(0.5)

    // Back Button
    this.backButton = this.add.rectangle(150, 700, 200, 50, 0xaa3333).setInteractive()

    this.add
      .text(150, 700, 'Back to Menu', {
        fontSize: '20px',
        color: '#FFF',
      })
      .setOrigin(0.5)

    this.backButton.on('pointerdown', () => {
      if (this.room) {
        this.room.leave()
      }
      this.scene.start('MainMenuScene')
    })

    // Start Game Button (only visible to host)
    this.startButton = this.add
      .rectangle(this.cameras.main.width - 150, 700, 200, 50, 0x33aa33)
      .setInteractive()

    this.startButtonText = this.add
      .text(this.cameras.main.width - 150, 700, 'Start Game', {
        fontSize: '20px',
        color: '#FFF',
      })
      .setOrigin(0.5)

    // Start button is initially hidden
    this.startButton.setVisible(false)
    this.startButtonText.setVisible(false)

    // Connect to Colyseus server
    this.connectToServer()
  }

  async connectToServer(): Promise<void> {
    try {
      // In a real app, you would import Colyseus.js and not use any/unknown types
      // This is a simplified example
      const colyseusJs = await import('colyseus.js')
      this.client = new colyseusJs.Client('ws://localhost:2567')

      if (this.isHost) {
        this.createLobby()
      } else if (this.lobbyCode) {
        this.joinLobbyWithCode(this.lobbyCode)
      } else {
        this.showJoinUI()
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      this.statusText.setText('Failed to connect to server. Check console.')
    }
  }

  async createLobby(): Promise<void> {
    if (!this.client) return

    try {
      this.statusText.setText('Creating lobby...')

      // Create a lobby room
      this.room = await this.client.create('lobby', {
        roomName: 'My Game Room',
        playerName: 'Host Player',
      })

      console.log('Created room:', this.room.roomId)
      this.lobbyCode = this.room.roomId
      this.lobbyCodeText.setText(`Lobby Code: ${this.lobbyCode}`)
      this.statusText.setText('Waiting for players...')

      // Show the start button for host
      this.startButton.setVisible(true)
      this.startButtonText.setVisible(true)

      // Set up room event handlers
      this.setupRoomEvents()
    } catch (error) {
      console.error('Failed to create lobby:', error)
      this.statusText.setText('Failed to create lobby. Check console.')
    }
  }

  showJoinUI(): void {
    this.statusText.setText('Enter a lobby code to join:')

    // TODO: Create an input field for the lobby code
    // This is a simplified example for demonstration

    // For now, we'll simulate joining with a random code
    const simulatedCode = 'ZZqcmFWKx'
    this.joinLobbyWithCode(simulatedCode)
  }

  async joinLobbyWithCode(code: string): Promise<void> {
    if (!this.client) return

    try {
      this.statusText.setText('Joining lobby...')

      // Join the lobby room with the provided code
      this.room = await this.client.joinById(code, {
        playerName: 'Guest Player',
      })

      console.log('Joined room:', code)
      this.lobbyCode = code
      this.lobbyCodeText.setText(`Lobby Code: ${code}`)
      this.statusText.setText('Waiting for host to start game...')

      // Setup room event handlers
      this.setupRoomEvents()
    } catch (error) {
      console.error('Failed to join lobby:', error)
      this.statusText.setText('Failed to join lobby. Check console.')
    }
  }

  setupRoomEvents(): void {
    if (!this.room) return

    // Listen for state changes (players joining/leaving)
    this.room.onStateChange((state: any) => {
      this.updatePlayerList(state)
    })

    // Handle when the game starts
    this.room.onMessage('gameStart', () => {
      this.statusText.setText('Game is starting...')
      // In a real implementation, you would transition to the game scene here
      setTimeout(() => this.scene.start('GameScene'), 2000)
    })

    // Handle when a player joins
    this.room.onMessage('playerJoin', (message: any) => {
      console.log(`Player joined: ${message.name}`)
    })

    // Start button handler (for host)
    this.startButton.on('pointerdown', () => {
      if (this.room && this.isHost) {
        this.room.send('startGame')
      }
    })
  }

  updatePlayerList(state: any): void {
    if (!state || !state.players) return

    let playerListString = ''
    let playerCount = 0

    // Iterate through players in the room state
    for (const [sessionId, player] of Object.entries(state.players)) {
      const playerObj = player as any
      playerListString += `${playerObj.name} ${playerObj.ready ? '(Ready)' : '(Not Ready)'}\n`
      playerCount++
    }

    this.playerListText.setText(playerListString || 'No players yet')

    // Enable/disable start button based on player count
    if (this.isHost) {
      const canStart = playerCount >= 2
      this.startButton.setFillStyle(canStart ? 0x33aa33 : 0x666666)
      this.startButton.input!.enabled = canStart
    }
  }

  update(): void {
    // Regular updates if needed
  }
}
