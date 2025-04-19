class Territory {
    constructor(scene, x, y, name, id, continent) {
        this.scene = scene;
        this.id = id;
        this.name = name;
        this.owner = null;
        this.armies = 0;
        this.isSelected = false;
        this.continent = continent;

        // Visual elements - using the neutral version of this specific territory
        //TODO: right now we also don't have any image for the the neutral but it's not compulsory to add
        this.territoryImage = scene.add.image(x, y, `territory-${id}-neutral`);
        this.territoryImage.setScale(0.6)
        this.territoryImage.setInteractive();

        this.territoryImage.on('pointerdown', () => {
            scene.handleTerritoryClick(this);
        });

        this.territoryImage.on('pointerover', () => {
            if (!this.isSelected) {
                this.territoryImage.setTint(0xFFFFFF);
            }
        });

        this.territoryImage.on('pointerout', () => {
            if (!this.isSelected) {
                this.territoryImage.clearTint();
            }
        });

        this.nameText = scene.add.text(x - 10, y - 15, name, {
            fontSize: '12px',
            fill: '#FFF',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

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
        //TODO: We are not using cyan color, so right now it will show broken image if user choose 6 players
        const colorNames = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
        const colorName = colorNames[player.id];

        // Each territory has its own unique image for each color
        this.territoryImage.setTexture(`territory-${this.id}-${colorName}`);
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
            this.territoryImage.setTint(0xFFFF00); // Yellow highlight
        } else {
            this.territoryImage.clearTint();
        }
    }
}