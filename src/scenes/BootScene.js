class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Display loading text
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Loading...', {
            fontSize: '32px',
            fill: '#FFF'
        }).setOrigin(0.5);

        // loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.width / 2 - 160, this.cameras.main.height / 2 + 30, 320, 50);

        // Text showing loading percentage
        const percentText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 55, '0%', {
            fontSize: '18px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);

        this.load.image('world-map', 'assets/images/world-map.png');

        const colors = ['neutral', 'red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
        const numTerritories = 25; // Total number of territories from the design

        for (let i = 0; i < numTerritories; i++) {
            for (let color of colors) {
                this.load.image(`territory-${i}-${color}`, `assets/images/territories/territory-${i}-${color}.png`);
            }
        }


        this.load.spritesheet('dice', 'assets/images/dice.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.image('button', 'assets/images/button.png');

        // Update loading bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(
                this.cameras.main.width / 2 - 150,
                this.cameras.main.height / 2 + 40,
                300 * value,
                30
            );
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
        });
    }

    create() {
        // Go to the main menu
        this.scene.start('MainMenuScene');
    }
}