class Territory {
    constructor(scene, x, y, name, id) {
        this.scene = scene;
        this.id = id;
        this.name = name;
        this.owner = null; // Player ID who owns this territory
        this.armies = 0;
        this.isSelected = false;

        // Visual elements
        this.circle = scene.add.circle(x, y, 30, 0xCCCCCC, 0.8);
        this.circle.setInteractive();

        this.circle.on('pointerdown', () => {
            scene.handleTerritoryClick(this);
        });

        this.circle.on('pointerover', () => {
            if (!this.isSelected) {
                this.circle.setStrokeStyle(3, 0xFFFFFF);
            }
        });

        this.circle.on('pointerout', () => {
            if (!this.isSelected) {
                this.circle.setStrokeStyle(0);
            }
        });

        // Text label for territory name
        this.nameText = scene.add.text(x, y - 25, name, {
            fontSize: '12px',
            fill: '#FFF',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Text for armies count
        this.armiesText = scene.add.text(x, y, '0', {
            fontSize: '16px',
            fill: '#FFF',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }

    setOwner(player) {
        this.owner = player.id;
        this.circle.setFillStyle(player.color, 0.8);
    }

    setArmies(count) {
        this.armies = count;
        this.armiesText.setText(count.toString());
    }

    addArmies(count) {
        this.armies += count;
        this.armiesText.setText(this.armies.toString());
    }

    removeArmies(count) {
        this.armies = Math.max(0, this.armies - count);
        this.armiesText.setText(this.armies.toString());
    }

    setSelected(selected) {
        this.isSelected = selected;
        if (selected) {
            this.circle.setStrokeStyle(4, 0xFFFF00);
        } else {
            this.circle.setStrokeStyle(0);
        }
    }
}