'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Load the Game component dynamically with no SSR
const Game = dynamic(() => import('@/components/game/Game'), { ssr: false })

// Load GameControls dynamically as well
// const GameControls = dynamic(() => import('@/components/ui/GameControls'), { ssr: false })

export default function Home() {
  return (
    <>
      <Suspense
        fallback={
          <div className="text-white text-xl p-12 bg-gray-900 rounded-lg text-center">
            Loading game...
          </div>
        }
      >
        <Game />
      </Suspense>

      {/* <div className="lg:w-1/4 w-full">
          <Suspense
            fallback={
              <div className="text-white p-4 bg-gray-900 rounded-lg">Loading controls...</div>
            }
          >
            <GameControls />
          </Suspense>
        </div> */}
    </>
  )
}
