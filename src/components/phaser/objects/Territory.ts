import * as Phaser from 'phaser'
import { Player, TerritoryHandler } from '../types'

export class Territory {
  public scene: Phaser.Scene & TerritoryHandler
  public id: number
  public name: string
  public owner: number | null
  public armies: number
  public isSelected: boolean
  public continent: string
  public originalScale: number
  public territoryImage: Phaser.GameObjects.Image
  public nameText: Phaser.GameObjects.Text
  public armiesText: Phaser.GameObjects.Text
  private hoverTween: Phaser.Tweens.Tween | null

  constructor(
    scene: Phaser.Scene & TerritoryHandler,
    x: number,
    y: number,
    name: string,
    id: number,
    continent: string
  ) {
    this.scene = scene
    this.id = id
    this.name = name
    this.owner = null
    this.armies = 0
    this.isSelected = false
    this.continent = continent
    this.originalScale = 0.6
    this.hoverTween = null

    // Visual elements - using the neutral version of this specific territory
    this.territoryImage = scene.add.image(x, y, `territory-${id}-neutral`)
    this.territoryImage.setInteractive()
    this.territoryImage.setScale(this.originalScale)
    this.territoryImage.setDepth(1)

    this.territoryImage.on('pointerdown', () => {
      this.scene.handleTerritoryClick(this)
    })

    this.territoryImage.on('pointerover', () => {
      if (!this.isSelected) {
        this.territoryImage.setDepth(105)
        this.nameText.setDepth(105)
        this.armiesText.setDepth(105)

        this.territoryImage.setScale(this.originalScale * 1.1)

        if (this.hoverTween) {
          this.hoverTween.stop()
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
              this.territoryImage.setScale(this.originalScale * 1.1)
            }
          },
        })

        this.nameText.setScale(1.15)
        this.armiesText.setScale(1.15)
      }
    })

    this.territoryImage.on('pointerout', () => {
      if (!this.isSelected) {
        this.armiesText.setDepth(0)
        this.nameText.setDepth(0)
        this.territoryImage.setDepth(0)

        if (this.hoverTween) {
          this.hoverTween.stop()
          this.hoverTween = null
        }

        this.territoryImage.clearTint()
        this.territoryImage.setScale(this.originalScale)

        this.nameText.setScale(1)
        this.armiesText.setScale(1)
      }
    })

    this.nameText = scene.add
      .text(x - 10, y - 15, name, {
        fontSize: '12px',
        color: '#FFF',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(1)

    this.armiesText = scene.add
      .text(x, y, '0', {
        fontSize: '16px',
        color: '#FFF',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(1)
  }

  setOwner(player: Player) {
    this.owner = player.id
    // Color name mapping for territory textures
    const colorNames = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan']
    const colorName = colorNames[player.id]

    // Each territory has its own unique image for each color
    this.territoryImage.setTexture(`territory-${this.id}-${colorName}`)
    this.territoryImage.setScale(this.originalScale)
  }

  setArmies(count: number) {
    this.armies = count
    this.armiesText.setText(count.toString())
  }

  addArmies(count: number) {
    this.armies += count
    this.updateArmiesWithAnimation(count)
  }

  removeArmies(count: number) {
    const previousCount = this.armies
    this.armies = Math.max(0, previousCount - count)
    this.updateArmiesWithAnimation(-count)
  }

  setSelected(selected: boolean) {
    this.isSelected = selected

    // Stop any existing hover tween regardless of selection change
    if (this.hoverTween) {
      this.hoverTween.stop()
      this.hoverTween = null
    }

    if (selected) {
      this.territoryImage.setDepth(200)
      this.nameText.setDepth(200)
      this.armiesText.setDepth(200)

      // Scale the territory when selected
      this.territoryImage.setScale(this.originalScale * 1.15)

      // Pulsing animation when selected
      this.hoverTween = this.scene.tweens.add({
        targets: this.territoryImage,
        scale: { from: this.originalScale * 1.15, to: this.originalScale * 1.25 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      this.nameText.setScale(1.2)
      this.armiesText.setScale(1.2)
    } else {
      // Reset depth to 0 when deselected
      this.territoryImage.setDepth(0)
      this.nameText.setDepth(0)
      this.armiesText.setDepth(0)

      // Remove all effects
      this.territoryImage.clearTint()
      this.territoryImage.setScale(this.originalScale)

      this.scene.tweens.killTweensOf(this.territoryImage)

      this.nameText.setScale(1)
      this.armiesText.setScale(1)
    }
  }

  updateArmiesWithAnimation(count: number) {
    // Update the text display
    this.armiesText.setText(this.armies.toString())

    // Flash effect for the armies counter
    this.scene.tweens.add({
      targets: this.armiesText,
      scale: 1.5,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeOut',
    })

    // If this is a change, add an indicator animation
    if (count !== 0) {
      // Set the sign and color based on whether we're adding or removing
      const sign = count > 0 ? '+' : '-'
      const color = count > 0 ? '#FFFFFF' : '#FF0000'

      const changeText = this.scene.add
        .text(this.territoryImage.x + 20, this.territoryImage.y - 20, sign + Math.abs(count), {
          fontSize: '24px',
          fontStyle: 'bold',
          color: color,
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(1000)

      // Animate the text
      this.scene.tweens.add({
        targets: changeText,
        y: this.territoryImage.y - 200,
        alpha: 0,
        duration: 2400,
        ease: 'Power2',
        onComplete: () => {
          changeText.destroy()
        },
      })
    }

    // Create a territory animation - different based on adding vs removing
    if (count > 0) {
      // Pulsing effect for adding armies
      this.scene.tweens.add({
        targets: this.territoryImage,
        scale: this.originalScale * 1.1,
        duration: 100,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut',
      })
    } else if (count < 0) {
      // Set red tint for army loss
      this.armiesText.setTint(0xff0000)

      this.scene.tweens.add({
        targets: this.armiesText,
        scale: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Reset tint after animation
          this.armiesText.clearTint()
        },
      })

      // Shake animation for damage
      this.scene.tweens.add({
        targets: this.territoryImage,
        x: this.territoryImage.x + 3,
        duration: 50,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
      })
    }
  }
}
