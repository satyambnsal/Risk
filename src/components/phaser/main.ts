import * as Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { MainMenuScene } from './scenes/MainMenuScene'
import { GameScene } from './scenes/GameScene'
import { LobbyScene } from './scenes/LobbyScene'

// Initialize gameState if not already done
window.gameState = {
  players: [],
  currentPlayerIndex: 0,
  gamePhase: 'initialPlacement',
  selectedTerritoryId: null,
  targetTerritoryId: null,
  initialPlacementDone: false,
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'game-container',
  scene: [BootScene, MainMenuScene, LobbyScene, GameScene],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
}

// Create the game instance
export function createGame(): Phaser.Game {
  return new Phaser.Game(config)
}
