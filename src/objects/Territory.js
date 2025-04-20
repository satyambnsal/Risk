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
        //TODO: Please put a neutral image of the territory
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
        const previousCount = this.armies;
        this.armies += count;

        this.armiesText.setText(this.armies.toString());

        // Flash effect for the armies counter
        this.scene.tweens.add({
            targets: this.armiesText,
            scale: 1.5,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeOut'
        });

        // If this is a significant addition, add a "+" indicator animation
        if (count > 0) {
            const plusText = this.scene.add.text(
                this.territoryImage.x + 20,
                this.territoryImage.y - 20,
                "+" + count,
                {
                    fontSize: '18px',
                    fontStyle: 'bold',
                    fill: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5)
                .setDepth(1000);

            // Animate the plus text
            this.scene.tweens.add({
                targets: plusText,
                y: this.territoryImage.y - 200,
                alpha: 0,
                duration: 1600,
                ease: 'Power2',
                onComplete: () => {
                    plusText.destroy();
                }
            });
        }

        // Create a pulsing effect on the territory itself
        this.scene.tweens.add({
            targets: this.territoryImage,
            scale: this.originalScale * 1.1,
            duration: 100,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.easeInOut'
        });
    }



    removeArmies(count) {
        const previousCount = this.armies;
        this.armies = Math.max(0, this.armies - count);

        // Update the text
        this.armiesText.setText(this.armies.toString());

        // Flash red for army loss
        this.armiesText.setTint(0xFF0000);

        this.scene.tweens.add({
            targets: this.armiesText,
            scale: 1.3,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Reset tint after animation
                this.armiesText.clearTint();
            }
        });

        // If loss is significant, show a "-" indicator
        if (count > 0) {
            const minusText = this.scene.add.text(
                this.territoryImage.x + 20,
                this.territoryImage.y - 20,
                "-" + count,
                {
                    fontSize: '18px',
                    fontStyle: 'bold',
                    fill: '#FF0000',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);

            // Animate the minus text
            this.scene.tweens.add({
                targets: minusText,
                y: this.territoryImage.y - 200,
                alpha: 0,
                duration: 1600,
                ease: 'Power2',
                onComplete: () => {
                    minusText.destroy();
                }
            });
        }


        // Small shake animation to indicate damage
        this.scene.tweens.add({
            targets: this.territoryImage,
            x: this.territoryImage.x + 3,
            duration: 50,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
        });
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

            // TODO: Need to veirfy if we need scale or not
            this.territoryImage.setScale(this.originalScale * 1.15);

            // TODO: Need to verify if we need pulsing animation when selected
            this.hoverTween = this.scene.tweens.add({
                targets: this.territoryImage,
                scale: { from: this.originalScale * 1.15, to: this.originalScale * 1.25 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

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