import { UltraHonkBackend } from '@aztec/bb.js'
import { Noir } from '@noir-lang/noir_js'

import initNoirC from '@noir-lang/noirc_abi'
import initACVM from '@noir-lang/acvm_js'
// import acvm from '@noir-lang/acvm_js/web/acvm_js_bg.wasm?.url'
// import noirc from '@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url'
// await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))])

// const chessCircuit = await import('../circuit/target/circuit.json')
// const backend = new UltraHonkBackend(chessCircuit.bytecode, {
//   threads: navigator.hardwareConcurrency,
// })
// @ts-ignore
// const noir = new Noir(chessCircuit)

// codegen/index.ts file taken from fog_of_war_chess library
import { initialize_game_state } from './codegen/index'

export async function initGameState() {
  try {
    let gameState = await initialize_game_state('2')
    return gameState
  } catch (e) {
    console.log('error? ', e)
  }
}
