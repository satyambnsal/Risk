import * as Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { MainMenuScene } from './scenes/MainMenuScene'
import { GameScene } from './scenes/GameScene'

// Initialize gameVars if not already done
window.gameVars = {
  players: [],
  currentPlayerIndex: 0,
  gamePhase: 'initialPlacement',
  selectedTerritory: null,
  targetTerritory: null,
  initialPlacementDone: false,
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'game-container',
  scene: [BootScene, MainMenuScene, GameScene],
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
