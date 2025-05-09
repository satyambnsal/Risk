use dep::std;
use std::hash::poseidon2::Poseidon2::hash as poseidon2;

use crate::common::constants::MAX_TERRITORIES;
use crate::common::{GameState, PlayerState, Territory};

// Create an encrypted view of a territory using player's secret
pub fn encrypt_territory(territory: Territory, encrypt_secret: Field, round_id: Field) -> Field {
    // Use the player's secret to encrypt the territory information
    let territory_data = territory.encode();

    // Add randomness based on the round
    poseidon2([territory_data, encrypt_secret, round_id], 3)
}

// Create a masked version of a territory (for zero-knowledge proofs)
pub fn mask_territory(territory: Territory, mask_secret: Field, player_id: Field) -> Field {
    // Use player's mask secret to create a unique mask
    let territory_data = territory.encode();

    // The mask allows selective disclosure of territory info
    poseidon2([territory_data, mask_secret, player_id], 3)
}

// Update a player's view of territories they can see
pub fn update_player_view(game_state: GameState, player_state: PlayerState) -> PlayerState {
    let mut updated_player = player_state;

    for i in 0..MAX_TERRITORIES {
        let territory = game_state.territories[i];

        // Player can see their own territories and adjacent territories
        let is_visible = (territory.owner_id as u32 == player_state.player_id as u32)
            | player_state.visible_territories[i];

        if is_visible {
            updated_player.territories_view[i] = territory;
        } else {
            // For non-visible territories, show only limited information
            // In a real game, you'd use zero-knowledge proofs here
            let mut hidden_territory = Territory::default();
            hidden_territory.id = territory.id;
            hidden_territory.owner_id = territory.owner_id; // In a real game, this might be hidden
            hidden_territory.troop_count = 0; // Hide troop count

            updated_player.territories_view[i] = hidden_territory;
        }
    }

    updated_player
}

// Reveal visibility of territories after a player's move
pub fn update_territory_visibility(
    player_state: PlayerState,
    game_state: GameState,
) -> PlayerState {
    let mut updated_player = player_state;

    // Update visibility based on owned territories
    for i in 0..MAX_TERRITORIES {
        let territory = game_state.territories[i];

        if territory.owner_id == player_state.player_id {
            // Player can see their own territories
            updated_player.visible_territories[i] = true;

            // Additionally, player can see adjacent territories
            // In a real implementation, you would use the adjacency map here
            // For simplicity, we're using a placeholder approach
            if i > 0 {
                updated_player.visible_territories[i - 1] = true;
            }

            if i < MAX_TERRITORIES - 1 {
                updated_player.visible_territories[i + 1] = true;
            }
        }
    }

    updated_player
}

// Verify that a player's secrets match their commitments
pub fn verify_player_secrets(
    game_state: GameState,
    player_id: Field,
    encrypt_secret: Field,
    mask_secret: Field,
) -> bool {
    let idx = (player_id - 1) as u32;

    // Calculate hashes of the provided secrets
    let encrypt_hash = poseidon2([encrypt_secret, player_id], 2);
    let mask_hash = poseidon2([mask_secret, player_id], 2);

    // Compare with stored commitments
    let encrypt_matches = game_state.mpc_state.user_encrypt_secret_hashes[idx] == encrypt_hash;
    let mask_matches = game_state.mpc_state.user_mask_secret_hashes[idx] == mask_hash;

    encrypt_matches & mask_matches
}

// Generate a proof of territory ownership without revealing the territory
pub fn prove_territory_ownership(
    territory: Territory,
    player_id: Field,
    mask_secret: Field,
) -> Field {
    assert(territory.owner_id == player_id, "Player does not own this territory");

    // Generate a proof that can be verified without revealing the territory details
    poseidon2([territory.encode(), player_id, mask_secret], 3)
}

// Verify a proof of territory ownership
pub fn verify_territory_ownership_proof(
    proof: Field,
    territory_id: Field,
    player_id: Field,
    game_state: GameState,
) -> bool {
    let idx = (player_id - 1) as u32;
    let mask_secret_hash = game_state.mpc_state.user_mask_secret_hashes[idx];

    // Reconstruct what the proof should be
    // In a real implementation, this would use zero-knowledge proofs
    let territory = game_state.territories[territory_id as u32];
    let mut res = false;

    if territory.owner_id != player_id {
        res = false;
    }
    let expected_proof = poseidon2([territory.encode(), player_id, mask_secret_hash], 3);

    res = (proof == expected_proof);
    res

    // This is a simplified verification, in reality you'd use a ZK proof system

}
