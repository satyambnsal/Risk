const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: "game-container",
    scene: [BootScene, MainMenuScene, GameScene],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
}

const game = new Phaser.Game(config);

window.gameVars = {
    players: [],
    currentPlayerIndex: 0,
    gamePhase: "placement", // "placement", "attack", "fortity"
    selectedTerritory: null,
    targetTerritory: null
}