import { Room, Client } from 'colyseus'
import { Schema, type, MapSchema } from '@colyseus/schema'

export interface InputData {
  left: false
  right: false
  up: false
  down: false
  tick: number
}

export class Player extends Schema {
  @type('number') x: number
  @type('number') y: number
  @type('number') tick: number

  inputQueue: InputData[] = []
}

export class MyRoomState extends Schema {
  @type('number') mapWidth: number
  @type('number') mapHeight: number
  @type({ map: Player }) players = new MapSchema<Player>()
}

export class Part3Room extends Room<MyRoomState> {
  state = new MyRoomState()
  fixedTimeStep = 1000 / 60

  onCreate(options: any) {
    // set map dimensions
    this.state.mapWidth = 800
    this.state.mapHeight = 600

    this.onMessage(0, (client, input) => {
      // handle player input
      const player = this.state.players.get(client.sessionId)

      // enqueue input to user input buffer.
      player.inputQueue.push(input)
    })

    this.setSimulationInterval((deltaTime) => {
      this.update(deltaTime)
    })
  }

  update(deltaTime: number) {
    const velocity = 2

    this.state.players.forEach((player) => {
      let input: InputData

      // dequeue player inputs
      while ((input = player.inputQueue.shift())) {
        if (input.left) {
          player.x -= velocity
        } else if (input.right) {
          player.x += velocity
        }

        if (input.up) {
          player.y -= velocity
        } else if (input.down) {
          player.y += velocity
        }

        player.tick = input.tick
      }
    })
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!')

    const player = new Player()
    player.x = Math.random() * this.state.mapWidth
    player.y = Math.random() * this.state.mapHeight

    this.state.players.set(client.sessionId, player)
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!')
    this.state.players.delete(client.sessionId)
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...')
  }
}
