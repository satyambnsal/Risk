use crate::common::{AdjacencyMap, GameState, PlayerState, Territory};
use crate::common::constants::MAX_TERRITORIES;
use std::hash::poseidon2::Poseidon2::hash as poseidon2;

pub fn update_visibility(player_state: &mut PlayerState, adjacency_map: &mut AdjacencyMap) {
    let mut new_visibility: [Field; MAX_TERRITORIES] = [0; MAX_TERRITORIES];

    for i in 0..MAX_TERRITORIES {
        let territory = player_state.territories_view[i];
        if territory.owner_id == player_state.player_id {
            new_visibility[i] = 1;

            // Mark all adjacent teritories as visible

            let neighbours = adjacency_map.adjacency[i];
            for j in 0..MAX_TERRITORIES {
                let is_neighbor = ((neighbours as u32 >> (j as u8)) & 1) == 1;
                if is_neighbor {
                    new_visibility[j] = 1;
                }
            }
        }
    }

    player_state.visible_territories = new_visibility;
}

pub fn is_territory_visible(player_state: &mut PlayerState, territory_id: Field) -> bool {
    player_state.visible_territories[territory_id] == 1
}

//TODO: Maybe we need to pass mutable reference here.

pub fn are_territories_adjacent(
    adjacency_map: AdjacencyMap,
    territory1_id: Field,
    territory2_id: Field,
) -> bool {
    let neighbours = adjacency_map.adjacency[territory1_id];
    ((neighbours as u32 >> territory2_id as u8) & 1) == 1
}

pub fn update_player_view(player_state: &mut PlayerState, game_state: &mut GameState) {
    for i in 0..MAX_TERRITORIES {
        if player_state.visible_territories[i] == 1 {
            player_state.territories_view[i] = game_state.territories[i];
        } else {
            let mut unknown_territory = Territory::default();
            unknown_territory.id = i as Field;
            player_state.territories_view[i] = unknown_territory;
        }
    }
}

pub fn initialize_adjacency_map() -> AdjacencyMap {
    let mut adjacency: [u32; MAX_TERRITORIES] = [0; MAX_TERRITORIES];

    // Example: Create a simple topology where each territory is adjacent to
    // territories with IDs +1 and -1 (wrapping around at edges)
    for i in 0..MAX_TERRITORIES {
        let prev: u32 = if i == 0 { MAX_TERRITORIES - 1 } else { i - 1 };
        let next: u32 = if i == MAX_TERRITORIES - 1 { 0 } else { i + 1 };

        // Set the bits for adjacent territories
        adjacency[i] = (1 << prev as u8) | (1 << next as u8);
    }

    AdjacencyMap { adjacency }
}

pub fn hash_game_state(game_state: &mut GameState) -> Field {
    let mut encoded_territories: [Field; MAX_TERRITORIES] = [0; MAX_TERRITORIES];
    for i in 0..MAX_TERRITORIES {
        encoded_territories[i] = game_state.territories[i].encode();
    }

    let mut hash_input: [Field; MAX_TERRITORIES + 3] = [0; MAX_TERRITORIES + 3];
    for i in 0..MAX_TERRITORIES {
        hash_input[i] = encoded_territories[i];
    }

    hash_input[MAX_TERRITORIES] = game_state.game_ended as Field;
    hash_input[MAX_TERRITORIES + 1] = game_state.turn_count;
    hash_input[MAX_TERRITORIES + 2] = game_state.current_player;

    poseidon2(hash_input, MAX_TERRITORIES + 3)
}

pub fn hash_player_state(player_state: &mut PlayerState) -> Field {
    let mut encoded_territories: [Field; MAX_TERRITORIES] = [0; MAX_TERRITORIES];
    for i in 0..MAX_TERRITORIES {
        encoded_territories[i] = player_state.territories_view[i].encode();
    }

    let mut hash_input: [Field; MAX_TERRITORIES * 2 + 4] = [0; MAX_TERRITORIES * 2 + 4];
    for i in 0..MAX_TERRITORIES {
        hash_input[i] = encoded_territories[i];
        hash_input[i + MAX_TERRITORIES] = player_state.visible_territories[i];
    }

    hash_input[MAX_TERRITORIES * 2] = player_state.player_id;
    hash_input[MAX_TERRITORIES * 2 + 1] = player_state.encrypt_secret;
    hash_input[MAX_TERRITORIES * 2 + 2] = player_state.mask_secret;
    hash_input[MAX_TERRITORIES * 2 + 3] = player_state.unallocated_troops as Field;

    poseidon2(hash_input, MAX_TERRITORIES * 2 + 4)
}
