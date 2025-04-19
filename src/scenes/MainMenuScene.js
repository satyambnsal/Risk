const instructions = [
    'How to Play:',
    '1. Place your armies on territories.',
    '2. Attack adjacent enemy territories.',
    '3. Fortify your position at the end of your turn.',
    '4. Capture all territories to win!'
];

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MainMenuScene" })
    }


    create() {
        //Title
        this.add.text(this.cameras.main.width / 2, 100, "RISK GAME", {
            fontSize: "64px",
            fill: "#FFF",
            fontStyle: "bold"
        }).setOrigin(0.5)

        // Player selection
        this.add.text(this.cameras.main.width / 2, 200, "Select number of players:", {
            fontSize: "24px",
            fill: "#FFF"
        }).setOrigin(0.5);


        // Player buttons
        const buttonStyle = {
            fontSize: "20px",
            fill: "#000",
            fontStyle: "bold"
        }

        // Create player number selection buttons

        for (let i = 2; i <= 6; i++) {
            let button = this.add.rectangle(
                this.cameras.main.width / 2 - 250 + (i - 2) * 100,
                250,
                80,
                40,
                0x33AA33
            ).setInteractive()

            let text = this.add.text(
                this.cameras.main.width / 2 - 250 + (i - 2) * 100,
                250,
                `${i}`,
                buttonStyle
            ).setOrigin(0.5);

            button.on("pointerdown", () => {
                this.setupPlayers(i);
                this.scene.start("GameScene")
            })


            button.on("pointerover", () => {
                button.setFillStyle(0x44CC44)
            })

            button.on("pointerout", () => {
                button.setFillStyle(0x33AA33)
            })
        }



        for (let i = 0; i < instructions.length; i++) {
            this.add.text(this.cameras.main.width / 2, 350 + i * 30, instructions[i], {
                fontSize: "18px",
                fill: "#FFF"
            }).setOrigin(0.5)
        }
    }


    setupPlayers(numPlayers) {
        // Clear existing Players
        window.gameVars.players = [];

        // Player colors
        const colors = [0xCF402E, 0x2CA5C7, 0x96C72C, 0xC7B52C, 0xB52CC7, 0x00FFFF];

        // Create players
        for (let i = 0; i < numPlayers; i++) {
            window.gameVars.players.push({
                id: i,
                color: colors[i],
                armies: 0,
                territories: [],
                reinforcements: 0,
                eliminated: false
            })
        }

        // Reset game state
        window.gameVars.currentPlayerIndex = 0;
        window.gameVars.gamePhase = "placement";
    }
}