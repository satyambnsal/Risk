class Territory {
    constructor(scene, x, y, name, id, continent) {
        this.scene = scene;
        this.id = id;
        this.name = name;
        this.owner = null;
        this.armies = 0;
        this.isSelected = false;
        this.continent = continent;
        this.originalScale = 0.6;
        this.hoverTween = null;

        // Visual elements - using the neutral version of this specific territory
        //TODO: right now we also don't have any image for the the neutral but it's not compulsory to add
        this.territoryImage = scene.add.image(x, y, `territory-${id}-neutral`);
        this.territoryImage.setInteractive();
        this.territoryImage.setScale(this.originalScale);
        this.territoryImage.setDepth(1)

        this.territoryImage.on('pointerdown', () => {
            scene.handleTerritoryClick(this);
        });

        this.territoryImage.on('pointerover', () => {
            if (!this.isSelected) {
                this.territoryImage.setDepth(105);
                this.nameText.setDepth(105);
                this.armiesText.setDepth(105);

                this.territoryImage.setScale(this.originalScale * 1.1);

                if (this.hoverTween) {
                    this.hoverTween.stop();
                }

                this.hoverTween = this.scene.tweens.add({
                    targets: this.territoryImage,
                    scale: this.originalScale * 1.15,
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        // Ensure scale is correct when tween completes
                        if (!this.isSelected) {
                            this.territoryImage.setScale(this.originalScale * 1.1);
                        }
                    }
                });

                this.nameText.setScale(1.15);
                this.armiesText.setScale(1.15);
            }
        });

        this.territoryImage.on('pointerout', () => {
            if (!this.isSelected) {
                this.armiesText.setDepth(0);
                this.nameText.setDepth(0);
                this.territoryImage.setDepth(0);

                if (this.hoverTween) {
                    this.hoverTween.stop();
                    this.hoverTween = null;
                }

                this.territoryImage.clearTint();
                this.territoryImage.setScale(this.originalScale);

                this.nameText.setScale(1);
                this.armiesText.setScale(1);
            }
        });

        // TODO: fix name positions
        this.nameText = scene.add.text(x - 10, y - 15, name, {
            fontSize: '12px',
            fill: '#FFF',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(1)

        this.armiesText = scene.add.text(x, y, '0', {
            fontSize: '16px',
            fill: '#FFF',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(1)
    }



    setOwner(player) {
        this.owner = player.id;
        //TODO: We are not using cyan color, so right now it will show broken image if user choose 6 players
        const colorNames = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
        const colorName = colorNames[player.id];

        // Each territory has its own unique image for each color
        this.territoryImage.setTexture(`territory-${this.id}-${colorName}`);
        this.territoryImage.setScale(this.originalScale);
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

        // Stop any existing hover tween regardless of selection change
        if (this.hoverTween) {
            this.hoverTween.stop();
            this.hoverTween = null;
        }

        if (selected) {
            this.territoryImage.setDepth(200);
            this.nameText.setDepth(200);
            this.armiesText.setDepth(200);

            // this.territoryImage.setTint(0xFFFF00); // Yellow highlight
            this.territoryImage.setScale(this.originalScale * 1.15); // Make it bigger

            this.nameText.setScale(1.2);
            this.armiesText.setScale(1.2);
        } else {
            // Reset depth to 0 when deselected
            this.territoryImage.setDepth(0);
            this.nameText.setDepth(0);
            this.armiesText.setDepth(0);

            // Remove all effects
            this.territoryImage.clearTint();
            this.territoryImage.setScale(this.originalScale);

            this.scene.tweens.killTweensOf(this.territoryImage);

            this.nameText.setScale(1);
            this.armiesText.setScale(1);
        }
    }
}