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

        // Load assets
        this.load.image('world-map', 'assets/images/world-map.png');
        this.load.image('territory', 'assets/images/territory.png');
        this.load.image('button', 'assets/images/button.png');

        // Load audio (optional)
        // this.load.audio('click', 'assets/audio/click.mp3');
        // this.load.audio('battle', 'assets/audio/battle.mp3');

        // Show loading progress
        this.load.on('progress', (value) => {
            console.log(`Loading: ${parseInt(value * 100)}%`);
        });

        this.load.on('complete', () => {
            console.log('Loading complete');
        });
    }

    create() {
        // Go to the main menu
        this.scene.start('MainMenuScene');
    }
}