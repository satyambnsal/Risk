'use client'

import { useEffect, useRef } from 'react'

export default function Game() {
  const gameRef = useRef<HTMLDivElement>(null)
  const gameInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically import Phaser and the game module
    const initGame = async () => {
      try {
        // Only import phaser and the game on the client
        const { createGame } = await import('../phaser/main')

        // Create the game instance
        if (gameRef.current && !gameInstanceRef.current) {
          gameInstanceRef.current = createGame()
        }
      } catch (error) {
        console.error('Failed to load Phaser game:', error)
      }
    }

    initGame()

    // Cleanup function to destroy the game instance
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true)
        gameInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      id="game-container"
      ref={gameRef}
      className="shadow-lg rounded-lg overflow-hidden"
    ></div>
  )
}
