use std::hash::poseidon2::Poseidon2::hash as poseidon2;

use crate::common::{AdjacencyMap, GameState, MPCState, PlayerState, Territory};
use crate::common::constants::{
    INITIAL_TROOPS_PER_PLAYER, MAX_PLAYERS, MAX_TERRITORIES, MIN_REINFORCEMENTS,
};

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

pub fn create_risk_adjacency_map() -> AdjacencyMap {
    let mut map = AdjacencyMap::default();

    // Simple version of risk map with just 24 territories due to Noir bitshift constraint
    // North America (9 territories)
    map = map.add_adjacency(0, 1); // Alaska - Northwest Territory
    map = map.add_adjacency(0, 3); // Alaska - Kamchatka (across the Bering Strait)
    map = map.add_adjacency(1, 2); // Northwest Territory - Greenland
    map = map.add_adjacency(1, 4); // Northwest Territory - Alberta
    map = map.add_adjacency(2, 6); // Greenland - Quebec
    map = map.add_adjacency(2, 14); // Greenland - Iceland
    map = map.add_adjacency(3, 4); // Alberta - Ontario
    map = map.add_adjacency(4, 5); // Ontario - Quebec
    map = map.add_adjacency(4, 7); // Ontario - Eastern United States
    map = map.add_adjacency(5, 7); // Quebec - Eastern United States
    map = map.add_adjacency(6, 7); // Western United States - Eastern United States
    map = map.add_adjacency(6, 8); // Western United States - Central America
    map = map.add_adjacency(8, 9); // Central America - Venezuela

    // South America (4 territories)
    map = map.add_adjacency(9, 10); // Venezuela - Peru
    map = map.add_adjacency(9, 11); // Venezuela - Brazil
    map = map.add_adjacency(10, 11); // Peru - Brazil
    map = map.add_adjacency(10, 12); // Peru - Argentina
    map = map.add_adjacency(11, 12); // Brazil - Argentina
    map = map.add_adjacency(11, 15); // Brazil - North Africa

    // // Europe (7 territories)
    map = map.add_adjacency(13, 14); // Great Britain - Iceland
    map = map.add_adjacency(13, 15); // Great Britain - Western Europe
    map = map.add_adjacency(13, 16); // Great Britain - Northern Europe
    map = map.add_adjacency(13, 17); // Great Britain - Scandinavia
    map = map.add_adjacency(14, 17); // Iceland - Scandinavia
    map = map.add_adjacency(15, 16); // Western Europe - Northern Europe
    map = map.add_adjacency(15, 18); // Western Europe - Southern Europe
    map = map.add_adjacency(15, 21); // Western Europe - North Africa
    map = map.add_adjacency(16, 17); // Northern Europe - Scandinavia
    map = map.add_adjacency(16, 18); // Northern Europe - Southern Europe
    map = map.add_adjacency(16, 19); // Northern Europe - Ukraine
    map = map.add_adjacency(17, 19); // Scandinavia - Ukraine
    map = map.add_adjacency(18, 19); // Southern Europe - Ukraine
    map = map.add_adjacency(18, 21); // Southern Europe - North Africa
    map = map.add_adjacency(18, 22); // Southern Europe - Egypt
    // map = map.add_adjacency(18, 24); // Southern Europe - Middle East

    // // Africa (6 territories)
    map = map.add_adjacency(20, 21); // Congo - North Africa
    map = map.add_adjacency(20, 22); // Congo - Egypt
    map = map.add_adjacency(20, 23); // Congo - East Africa

    map
}

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

// Count territories owned by each player
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
