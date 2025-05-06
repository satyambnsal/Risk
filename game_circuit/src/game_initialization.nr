use crate::common::{AdjacencyMap, GameState, PlayerState, Territory};
use crate::common::constants::{INITIAL_TROOPS_PER_PLAYER, MAX_PLAYERS, MAX_TERRITORIES};
use std::hash::poseidon2::Poseidon2::hash as poseidon2;

pub fn initialize_game_state(num_players: Field) -> GameState {
    assert(
        num_players as u32 >= 2 & num_players as u32 <= MAX_PLAYERS,
        "Invalid number of players",
    );

    let mut game_state = GameState::default();

    for i in 0..MAX_TERRITORIES {
        let mut territory = Territory::default();
        territory.id = i as Field;
        game_state.territories[i] = territory;
    }

    game_state.game_ended = false;
    game_state.turn_count = 0;
    game_state.current_player = 1;

    game_state
}

pub fn initialize_player_state(
    player_id: Field,
    encrypt_secret: Field,
    mask_secret: Field,
) -> PlayerState {
    assert(player_id as u32 > 0 & player_id as u32 <= MAX_PLAYERS, "Invalid player ID");

    let mut player_state = PlayerState::default();
    player_state.player_id = player_id;
    player_state.encrypt_secret = encrypt_secret;
    player_state.mask_secret = mask_secret;
    player_state.unallocated_troops = INITIAL_TROOPS_PER_PLAYER as Field;
    player_state.visible_territories = [0; MAX_TERRITORIES];

    for i in 0..MAX_TERRITORIES {
        let mut territory = Territory::default();
        territory.id = i as Field;
        player_state.territories_view[i] = territory;
    }
    player_state
}

pub fn assign_initial_territories(
    game_state: &mut GameState,
    num_players: u32,
    random_seed: Field,
) {
    assert(num_players >= 2 & num_players <= MAX_PLAYERS, "Invalid number of players");

    // Create a deterministic "random" assignment based on the seed
    // In a real implementation, this would use MPC or commit-reveal for fairness
    let mut assignments = [0; MAX_TERRITORIES];

    for i in 0..MAX_TERRITORIES {
        // Use poseidon hash to create pseudorandom values based on seed and territory ID
        let rand_value = poseidon2([random_seed, i as Field], 2);

        // Assign to player 1 through num_players
        let player = (rand_value as u32 % num_players) + 1;
        assignments[i] = player;

        // Update the game state
        game_state.territories[i].owner_id = player as Field;
        game_state.territories[i].troop_count = 1; // Start with 1 troop per territory
    }

    // Adjust player's unallocated troops based on their territory count
    // This would be handled by the player state update function in a real game
}

pub fn commit_to_user_secrets(
    game_state: GameState,
    encrypt_secret: Field,
    mask_secret: Field,
    player_id: Field,
) -> GameState {
    let mut updated = game_state;

    let secret_hashes = [poseidon2([encrypt_secret, -1], 2), poseidon2([mask_secret, -1], 2)];

    updated.mpc_state.user_encrypt_secret_hashes[player_id - 1] = secret_hashes[0];
    updated.mpc_state.user_mask_secret_hashes[player_id - 1] = secret_hashes[1];

    updated
}

pub fn register_all_players(
    game_state: GameState,
    player_secrets: [(Field, Field); MAX_PLAYERS],
) -> GameState {
    let mut updated = game_state;

    for i in 0..MAX_PLAYERS {
        let player_id = i + 1;
        let (encrypt_secret, mask_secret) = player_secrets[i];

        // Only process valid players with non-zero secrets
        if ((encrypt_secret as u32 != 0) & (mask_secret as u32 != 0)) {
            updated =
                commit_to_user_secrets(updated, encrypt_secret, mask_secret, player_id as Field);
        }
    }

    updated
}

/// Helper function to count territories owned by each player
pub fn count_player_territories(game_state: GameState) -> [Field; MAX_PLAYERS + 1] {
    let mut counts = [0; MAX_PLAYERS + 1];

    for i in 0..MAX_TERRITORIES {
        let owner = game_state.territories[i].owner_id;
        if (owner as u32) > 0 & owner as u32 <= MAX_PLAYERS {
            counts[owner] += 1;
        }
    }

    counts
}

/// Helper function to calculate reinforcements for a player
pub fn calculate_reinforcements(game_state: GameState, player_id: Field) -> Field {
    let territory_counts = count_player_territories(game_state);
    let player_territory_count = territory_counts[player_id];

    // Basic rule: Number of territories divided by 3, with a minimum of 3
    let reinforcements = player_territory_count / 3;
    if reinforcements as u32 < 3 {
        3
    } else {
        reinforcements
    }
    // Note: This is a simplified version; a real game would include continent bonuses, etc.
}
