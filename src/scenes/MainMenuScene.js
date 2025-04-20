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
        // dark background with gradient
        const background = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        );

        // Add a subtle moving gradient background
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x001133, 0x001133, 0x002266, 0x002266, 1);
        gradient.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // Title with animation
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            100,
            "RISK GAME",
            {
                fontSize: "64px",
                fill: "#FFF",
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 8
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: titleText,
            y: { from: 50, to: 100 },
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                //  subtle floating animation
                this.tweens.add({
                    targets: titleText,
                    y: '+=10',
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Player selection text with fade-in
        const selectionText = this.add.text(
            this.cameras.main.width / 2,
            200,
            "Select number of players:",
            {
                fontSize: "24px",
                fill: "#FFF"
            }
        ).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: selectionText,
            alpha: 1,
            duration: 800,
            delay: 300,
            ease: 'Power2'
        });

        // player number selection buttons with staggered animation
        const buttonStyle = {
            fontSize: "20px",
            fill: "#000",
            fontStyle: "bold"
        };


        for (let i = 2; i <= 6; i++) {
            let button = this.add.rectangle(
                this.cameras.main.width / 2 - 250 + (i - 2) * 100,
                250,
                80,
                40,
                0x33AA33
            ).setInteractive();

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
                button.setFillStyle(0x44CC44);

                this.tweens.add({
                    targets: [button, text],
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100,
                    ease: 'Sine.easeOut'
                });
            });

            button.on("pointerout", () => {
                button.setFillStyle(0x33AA33);

                // Reset scale on hover out
                this.tweens.add({
                    targets: [button, text],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: 'Sine.easeOut'
                });
            });
        }

        const instructionTextObjects = [];

        for (let i = 0; i < instructions.length; i++) {
            const text = this.add.text(
                this.cameras.main.width / 2,
                350 + i * 30,
                instructions[i],
                {
                    fontSize: "18px",
                    fill: "#FFF"
                }
            ).setOrigin(0.5).setAlpha(0);

            instructionTextObjects.push(text);
        }

        // Animate instructions appearing with stagger
        this.tweens.add({
            targets: instructionTextObjects,
            alpha: 1,
            x: { from: this.cameras.main.width / 2 - 50, to: this.cameras.main.width / 2 },
            duration: 500,
            delay: function (i) { return 800 + i * 200; },
            ease: 'Power2'
        });
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