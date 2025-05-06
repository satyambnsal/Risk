use crate::common::{
    AdjacencyMap, AttackMove, GameMove, GameState, PlayerState, Territory, TroopPlacementMove,
};
use crate::common::constants::{INITIAL_TROOPS_PER_PLAYER, MAX_PLAYERS, MAX_TERRITORIES};
use std::hash::poseidon2::Poseidon2::hash as poseidon2;

pub fn place_troops(
    game_state: &mut GameState,
    player_state: &mut PlayerState,
    move_data: TroopPlacementMove,
) -> bool {
    // Validate player's turn
    let mut response = false;
    let territory_id = move_data.territory_id;
    let troop_count = move_data.troop_count;
    if game_state.current_player != player_state.player_id {
        response = false;
    } else if game_state.territories[territory_id].owner_id != player_state.player_id {
        response = false;
    } else if (troop_count as u32 <= 0)
        | (troop_count as u32 > player_state.unallocated_troops as u32) {
        response = false;
    } else {
        // Execute the move
        game_state.territories[territory_id].troop_count += troop_count;
        player_state.unallocated_troops -= troop_count;
        response = true;
    }
    response
}

/// Generate a deterministic but unpredictable dice roll
/// Uses the player's secret, the attack data, and a nonce for randomness
fn roll_dice(
    attacker_secret: Field,
    defender_id: Field,
    from_territory: Field,
    to_territory: Field,
    num_dice: Field,
    nonce: Field,
) -> [Field; 3] {
    // Return up to 3 dice values
    let mut dice_values: [Field; 3] = [0; 3];

    for i in 0..num_dice as u32 {
        if i < 3 {
            // Maximum 3 dice
            // Create a unique seed for each die
            let seed = poseidon2(
                [
                    attacker_secret,
                    defender_id,
                    from_territory,
                    to_territory,
                    i as Field, // Die index
                    nonce,
                ],
                6,
            );

            // Convert the hash to a number between 1-6
            dice_values[i] = (((seed as u32) % 6) + 1) as Field;
        }
    }

    dice_values
}

/// Validate and execute an attack move
/// Returns (success, attacker_losses, defender_losses)
/// Validate and execute an attack move
/// Returns (success, attacker_losses, defender_losses)
pub fn execute_attack(
    game_state: &mut GameState,
    player_state: &mut PlayerState,
    adjacency_map: &AdjacencyMap,
    move_data: AttackMove,
) -> (Field, Field, Field) {
    // Using Field for boolean success flag
    let mut success = 1; // 1 = true, 0 = false
    let mut attacker_losses = 0;
    let mut defender_losses = 0;

    // Validate player's turn
    let valid_player = game_state.current_player == player_state.player_id;

    let from_territory_id = move_data.from_territory_id;
    let to_territory_id = move_data.to_territory_id;

    // Validate territory ownership
    let valid_from_territory =
        game_state.territories[from_territory_id].owner_id == player_state.player_id;

    // Validate target territory is not owned by attacker
    let valid_to_territory =
        game_state.territories[to_territory_id].owner_id != player_state.player_id;

    // Validate territories are adjacent
    let neighbors = adjacency_map.adjacency[from_territory_id];
    let are_adjacent = ((neighbors >> to_territory_id) & 1) == 1;

    // Validate attacker has enough troops
    let attack_troop_count = move_data.attack_troop_count;
    let has_enough_troops = (attack_troop_count > 0)
        & (attack_troop_count < game_state.territories[from_territory_id].troop_count);

    // Combined validation check
    let is_valid =
        valid_player & valid_from_territory & valid_to_territory & are_adjacent & has_enough_troops;

    // Only process attack if all validations pass
    if is_valid == 1 {
        // Determine number of dice for attacker and defender
        let mut attacker_dice = 0;
        if attack_troop_count >= 3 {
            attacker_dice = 3;
        } else {
            attacker_dice = attack_troop_count;
        }

        let defender_troops = game_state.territories[to_territory_id].troop_count;
        let mut defender_dice = 0;
        if defender_troops >= 2 {
            defender_dice = 2;
        } else {
            defender_dice = 1;
        }

        // Roll dice for both sides
        let defender_id = game_state.territories[to_territory_id].owner_id;
        let nonce = move_data.dice_roll_seed;

        let attacker_rolls = roll_dice(
            player_state.encrypt_secret,
            defender_id,
            from_territory_id,
            to_territory_id,
            attacker_dice,
            nonce,
        );

        // In a real game, the defender would use their own secret
        // Here we use a derivative of the attacker's secret for simplicity
        let defender_secret = poseidon2([player_state.encrypt_secret, defender_id], 2);

        let defender_rolls = roll_dice(
            defender_secret,
            player_state.player_id,
            to_territory_id,
            from_territory_id,
            defender_dice,
            nonce,
        );

        // Sort dice in descending order (simplified for demo)
        let mut sorted_attacker_rolls = attacker_rolls;
        let mut sorted_defender_rolls = defender_rolls;

        // Simple bubble sort (in a real implementation, use a more efficient sort)
        for i in 0..2 {
            for j in 0..(2 - i) {
                if sorted_attacker_rolls[j] < sorted_attacker_rolls[j + 1] {
                    let temp = sorted_attacker_rolls[j];
                    sorted_attacker_rolls[j] = sorted_attacker_rolls[j + 1];
                    sorted_attacker_rolls[j + 1] = temp;
                }

                // Be careful with the bounds check here
                let j_plus_1 = j + 1;
                let check_defender = j < (defender_dice as Field - 1);
                if check_defender & (sorted_defender_rolls[j] < sorted_defender_rolls[j_plus_1]) {
                    let temp = sorted_defender_rolls[j];
                    sorted_defender_rolls[j] = sorted_defender_rolls[j_plus_1];
                    sorted_defender_rolls[j_plus_1] = temp;
                }
            }
        }

        // Compare dice and compute casualties
        attacker_losses = 0;
        defender_losses = 0;

        for i in 0..defender_dice {
            let i_in_bounds = i < attacker_dice;
            if i_in_bounds {
                // Ensure we don't go out of bounds
                if sorted_attacker_rolls[i] > sorted_defender_rolls[i] {
                    defender_losses += 1;
                } else {
                    attacker_losses += 1;
                }
            }
        }

        // Update game state based on battle outcome
        game_state.territories[from_territory_id].troop_count -= attacker_losses;

        let conquered = defender_losses >= defender_troops;
        if conquered {
            // Attacker conquers the territory
            let remaining_attack_troops = attack_troop_count - attacker_losses;
            game_state.territories[to_territory_id].owner_id = player_state.player_id;
            game_state.territories[to_territory_id].troop_count = remaining_attack_troops;
            game_state.territories[from_territory_id].troop_count -= remaining_attack_troops;
        } else {
            // Defender keeps the territory with reduced troops
            game_state.territories[to_territory_id].troop_count -= defender_losses;
        }

        // Check win condition
        check_win_condition(game_state);
    } else {
        success = 0;
    }

    (success, attacker_losses, defender_losses)
}
