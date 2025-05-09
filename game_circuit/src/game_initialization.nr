use std::hash::poseidon2::Poseidon2::hash as poseidon2;

use crate::common::{AdjacencyMap, GameState, MPCState, PlayerState, Territory};
use crate::common::constants::{
    INITIAL_TROOPS_PER_PLAYER, MAX_PLAYERS, MAX_TERRITORIES, MIN_REINFORCEMENTS,
};

#[export]
pub fn initialize_game_state(num_players: u32) -> GameState {
    assert(num_players >= 2 & num_players <= MAX_PLAYERS, "Invalid number of players");

    let mut game_state = GameState::default();

    for i in 0..MAX_TERRITORIES {
        let mut territory = Territory::default();
        territory.id = i as Field;
        game_state.territories[i] = territory;
    }

    game_state.game_ended = false;
    game_state.turn_count = 0;
    game_state.current_player = 1;
    game_state.winner = 0;

    game_state
}

#[export]
pub fn initialize_player_state(
    player_id: Field,
    encrypt_secret: Field,
    mask_secret: Field,
) -> PlayerState {
    assert(player_id as u32 > 0 & player_id as u32 <= MAX_PLAYERS, "Invalid player ID");

    // Validate secrets are non-zero
    assert(encrypt_secret != 0, "Encryption secret cannot be zero");
    assert(mask_secret != 0, "Mask secret cannot be zero");

    let mut player_state = PlayerState::default();
    player_state.player_id = player_id;
    player_state.encrypt_secret = encrypt_secret;
    player_state.mask_secret = mask_secret;
    player_state.unallocated_troops = INITIAL_TROOPS_PER_PLAYER;
    player_state.reinforcements = 0;
    player_state.has_conquered_territory = false;

    // Initialize territory visibility to false
    for i in 0..MAX_TERRITORIES {
        player_state.visible_territories[i] = false;
    }

    // Initialize territory view
    for i in 0..MAX_TERRITORIES {
        let mut territory = Territory::default();
        territory.id = i as Field;
        player_state.territories_view[i] = territory;
    }

    player_state
}

#[export]
pub fn create_risk_adjacency_map() -> AdjacencyMap {
    let mut map = AdjacencyMap::default();

    // Map Connectivity As per frontend UI map
    map = map.add_adjacency(0, 1); // NA1 - NA2
    map = map.add_adjacency(0, 2); // NA1 - NA3
    map = map.add_adjacency(0, 4); // NA1 - SA1

    map = map.add_adjacency(1, 2); // NA2 - NA3
    map = map.add_adjacency(1, 3); // NA2 - NA4

    map = map.add_adjacency(2, 9); // NA3 - NA4
    map = map.add_adjacency(2, 18); // NA3 - EU5
    map = map.add_adjacency(2, 9); // NA3 - AF1

    map = map.add_adjacency(3, 15); // NA4 - EU2

    map = map.add_adjacency(4, 5); // SA1 - SA5
    map = map.add_adjacency(4, 6); // SA1 - SA6
    map = map.add_adjacency(4, 13); // SA1 - AF5

    map = map.add_adjacency(5, 6); // SA2 - SA3
    map = map.add_adjacency(5, 7); // SA2 - SA4

    map = map.add_adjacency(6, 7); // SA3 - SA4
    map = map.add_adjacency(6, 8); // SA3- SA5
    map = map.add_adjacency(6, 12); // SA3- AF4

    map = map.add_adjacency(7, 8); // SA4 - SA5

    map = map.add_adjacency(8, 24); // SA5 - AU5

    map = map.add_adjacency(9, 10); // AF1 - AF2
    map = map.add_adjacency(9, 13); // AF1 - AF5
    map = map.add_adjacency(9, 18); // AF1 - EU5

    map = map.add_adjacency(10, 11); // AF2 - AF3
    map = map.add_adjacency(10, 13); // AF2 - AF5
    map = map.add_adjacency(10, 14); // AF2 - EU1
    map = map.add_adjacency(10, 17); // AF2 - EU4
    map = map.add_adjacency(10, 20); // AF2 - AU1

    map = map.add_adjacency(11, 12); // AF3 - AF4
    map = map.add_adjacency(11, 20); // AF3 - AU1
    map = map.add_adjacency(11, 21); // AF3 - AU2

    map = map.add_adjacency(12, 13); // AF4 - AF5
    map = map.add_adjacency(12, 21); // AF4 - AU2

    map = map.add_adjacency(14, 17); // EU1-EU4
    map = map.add_adjacency(14, 19); // EU1-EU6
    map = map.add_adjacency(14, 20); // EU1-AU1

    map = map.add_adjacency(15, 16); // EU2-EU3
    map = map.add_adjacency(15, 18); // EU2-EU5

    map = map.add_adjacency(15, 18); // EU2-EU5
    map = map.add_adjacency(15, 19); // EU2-EU6

    map = map.add_adjacency(16, 17); // EU3-EU4
    map = map.add_adjacency(16, 18); // EU3-EU5
    map = map.add_adjacency(16, 19); // EU3-EU6

    map = map.add_adjacency(17, 18); // EU4-EU5
    map = map.add_adjacency(17, 19); // EU4-EU6

    map = map.add_adjacency(20, 21); // AU1 - AU2
    map = map.add_adjacency(20, 22); // AU1 - AU3

    map = map.add_adjacency(21, 22); // AU2 - AU3
    map = map.add_adjacency(21, 23); // AU2 - AU4
    map = map.add_adjacency(21, 24); // AU2 - AU5

    map = map.add_adjacency(22, 23); // AU3 - AU4
    map = map.add_adjacency(22, 24); // AU3 - AU5

    map = map.add_adjacency(23, 24); // AU4 - AU5
    // // Europe (7 territories)

    map
}

#[export]
pub fn assign_initial_territories(
    game_state: GameState,
    num_players: u32,
    random_seed: Field,
) -> GameState {
    assert(num_players >= 2 & num_players <= MAX_PLAYERS, "Invalid number of players");

    let mut updated_state = game_state;

    // Create deterministic "random" assignments based on the seed
    for i in 0..MAX_TERRITORIES {
        // Use poseidon hash to create pseudorandom values based on seed and territory ID
        let hash_input = [random_seed, i as Field];
        let rand_value = poseidon2(hash_input, 2);

        // Assign to player 1 through num_players
        let player = (rand_value as u32 % num_players) + 1;

        // Update the game state
        updated_state.territories[i].owner_id = player as Field;
        updated_state.territories[i].troop_count = 1; // Start with 1 troop per territory
    }

    updated_state
}

#[export]
pub fn commit_to_user_secrets(
    game_state: GameState,
    encrypt_secret: Field,
    mask_secret: Field,
    player_id: Field,
) -> GameState {
    assert(player_id as u32 > 0 & player_id as u32 <= MAX_PLAYERS, "Invalid player ID");
    assert(encrypt_secret != 0, "Encryption secret cannot be zero");
    assert(mask_secret != 0, "Mask secret cannot be zero");

    let mut updated = game_state;

    // Hash the secrets to create commitments
    let encrypt_hash = poseidon2([encrypt_secret, player_id], 2);
    let mask_hash = poseidon2([mask_secret, player_id], 2);

    // Store the commitments
    let idx = (player_id - 1) as u32;
    updated.mpc_state.user_encrypt_secret_hashes[idx] = encrypt_hash;
    updated.mpc_state.user_mask_secret_hashes[idx] = mask_hash;

    updated
}

#[export]
pub fn register_all_players(
    game_state: GameState,
    player_secrets: [(Field, Field); MAX_PLAYERS],
) -> GameState {
    let mut updated = game_state;

    for i in 0..MAX_PLAYERS {
        let player_id = (i + 1) as Field;
        let (encrypt_secret, mask_secret) = player_secrets[i];

        // Only process valid players with non-zero secrets
        if (encrypt_secret as u32 != 0) & (mask_secret as u32 != 0) {
            updated = commit_to_user_secrets(updated, encrypt_secret, mask_secret, player_id);
        }
    }

    updated
}

#[export]
pub fn count_player_territories(game_state: GameState) -> [Field; MAX_PLAYERS + 1] {
    let mut counts = [0; MAX_PLAYERS + 1];

    for i in 0..MAX_TERRITORIES {
        let owner = game_state.territories[i].owner_id;
        if owner as u32 > 0 & owner as u32 <= MAX_PLAYERS {
            let owner_idx = owner as u32;
            counts[owner_idx] += 1;
        }
    }

    counts
}

pub fn calculate_reinforcements(game_state: GameState, player_id: Field) -> Field {
    let territory_counts = count_player_territories(game_state);
    let player_idx = player_id as u32;
    let player_territory_count = territory_counts[player_idx];

    // Basic rule: Number of territories divided by 3, with a minimum of 3
    let reinforcements = player_territory_count / 3;

    if reinforcements as u32 < MIN_REINFORCEMENTS {
        MIN_REINFORCEMENTS as Field
    } else {
        reinforcements
    }
}

pub fn get_turn_reinforcements(game_state: GameState, player_state: PlayerState) -> PlayerState {
    assert(game_state.current_player == player_state.player_id, "Not this player's turn");

    let reinforcements = calculate_reinforcements(game_state, player_state.player_id);

    // Update player state with new reinforcements
    let mut updated_player = player_state;
    updated_player.reinforcements = reinforcements as u32;
    updated_player.unallocated_troops += reinforcements as u32;

    updated_player
}
