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
  private joinContainer!: Phaser.GameObjects.Container
  private inputCode: string = ''
  private inputText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'LobbyScene' })
  }

  init(data: any): void {
    this.isHost = data.isHost || false
    this.lobbyCode = data.lobbyCode || ''
    this.inputCode = ''
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

    // Create join UI container
    this.createJoinUI()

    // Connect to Colyseus server
    this.connectToServer()
  }

  createJoinUI(): void {
    // Create a container for join UI elements
    this.joinContainer = this.add.container(this.cameras.main.width / 2, 400)
    this.joinContainer.setVisible(false)

    // Input field background
    const inputBg = this.add.rectangle(0, 0, 300, 50, 0x444444)
    this.joinContainer.add(inputBg)

    // Input text
    this.inputText = this.add
      .text(0, 0, '', {
        fontSize: '20px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
    this.joinContainer.add(this.inputText)

    // Instruction text
    const instruction = this.add
      .text(0, -50, 'Enter Lobby Code:', {
        fontSize: '24px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
    this.joinContainer.add(instruction)

    // Join button
    const joinButton = this.add.rectangle(0, 80, 200, 50, 0x33aa33).setInteractive()
    const joinText = this.add
      .text(0, 80, 'Join Lobby', {
        fontSize: '20px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
    this.joinContainer.add(joinButton)
    this.joinContainer.add(joinText)

    // Add hover effect
    joinButton.on('pointerover', () => {
      joinButton.setFillStyle(0x44bb44)
    })
    joinButton.on('pointerout', () => {
      joinButton.setFillStyle(0x33aa33)
    })

    // Join button functionality
    joinButton.on('pointerdown', () => {
      if (this.inputCode.trim().length > 0) {
        this.joinLobbyWithCode(this.inputCode.trim())
        this.joinContainer.setVisible(false)
      }
    })

    // Set up keyboard input
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (!this.joinContainer.visible) return

      if (event.keyCode === 8 && this.inputCode.length > 0) {
        // Backspace - remove last character
        this.inputCode = this.inputCode.slice(0, -1)
      } else if (event.keyCode === 13) {
        // Enter - submit
        if (this.inputCode.trim().length > 0) {
          this.joinLobbyWithCode(this.inputCode.trim())
          this.joinContainer.setVisible(false)
        }
      } else if (
        (event.keyCode >= 48 && event.keyCode <= 90) ||
        (event.keyCode >= 96 && event.keyCode <= 111) ||
        event.keyCode === 189 ||
        event.keyCode === 187
      ) {
        // Alphanumeric and some special characters
        // Make sure we don't get too long
        if (this.inputCode.length < 15) {
          this.inputCode += event.key
        }
      }

      // Update the text display
      this.inputText.setText(this.inputCode)
    })
  }

  async connectToServer(): Promise<void> {
    try {
      // TODO: import Colyseus.js properly and not use any/unknown types
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
    this.statusText.setText('Enter a lobby code to join')
    this.joinContainer.setVisible(true)
    this.inputCode = ''
    this.inputText.setText('')
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
    } catch (error: any) {
      console.error('Failed to join lobby:', error)
      this.statusText.setText(`Failed to join lobby: ${error.message || 'Unknown error'}`)

      // Re-show join UI after failed attempt
      setTimeout(() => {
        this.showJoinUI()
      }, 3000)
    }
  }

  setupRoomEvents(): void {
    if (!this.room) return

    // Listen for state changes (players joining/leaving)
    this.room.onStateChange((state: any) => {
      this.updatePlayerList(state)
    })

    // Handle when the game starts
    this.room.onMessage('startGame', () => {
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
