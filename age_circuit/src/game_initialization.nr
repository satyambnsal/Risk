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
    game_state: &mut GameState,
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
