// game_mechanics.nr
use dep::std;
use std::hash::poseidon2::Poseidon2::hash as poseidon2;

use crate::common::{
    AdjacencyMap, AttackMove, AttackResult, FortifyMove, GameMove, GameState, PlayerState,
    Territory, TroopPlacementMove,
};
use crate::common::constants::{MAX_PLAYERS, MAX_TERRITORIES};

// Place troops on a territory
pub fn place_troops(
    game_state: GameState,
    player_state: PlayerState,
    move_data: TroopPlacementMove,
) -> (GameState, PlayerState, bool) {
    let territory_id = move_data.territory_id;
    let troop_count = move_data.troop_count;

    // Validation checks
    let player_turn = game_state.current_player == player_state.player_id;
    let owns_territory =
        game_state.territories[territory_id as u32].owner_id == player_state.player_id;
    let has_enough_troops = troop_count > 0 & troop_count <= player_state.unallocated_troops;

    let valid_move = player_turn & owns_territory & has_enough_troops;

    if valid_move {
        // Update game and player state
        let mut updated_game = game_state;
        let mut updated_player = player_state;

        updated_game.territories[territory_id as u32].troop_count += troop_count;
        updated_player.unallocated_troops -= troop_count;

        (updated_game, updated_player, true)
    } else {
        (game_state, player_state, false)
    }
}

// Generate a dice roll using player secrets for randomness
fn roll_dice(
    attacker_secret: Field,
    defender_id: Field,
    from_territory: Field,
    to_territory: Field,
    num_dice: u32,
    nonce: Field,
) -> [u32; 3] {
    // Return up to 3 dice values
    let mut dice_values = [0; 3];

    for i in 0..3 {
        if i < num_dice {
            // Create a unique seed for each die
            let hash_input =
                [attacker_secret, defender_id, from_territory, to_territory, i as Field, nonce];

            let seed = poseidon2(hash_input, 6);

            // Convert to a number between 1-6
            dice_values[i] = ((seed as u32 % 6) + 1) as u32;
        }
    }

    dice_values
}

// Sort an array of dice values in descending order
fn sort_dice(dice: [u32; 3], count: u32) -> [u32; 3] {
    let mut sorted = dice;

    // Simple bubble sort
    for i in 0..count {
        for j in 0..(count - i - 1) {
            if sorted[j] < sorted[j + 1] {
                let temp = sorted[j];
                sorted[j] = sorted[j + 1];
                sorted[j + 1] = temp;
            }
        }
    }

    sorted
}

// Execute an attack move
pub fn execute_attack(
    game_state: GameState,
    player_state: PlayerState,
    adjacency_map: AdjacencyMap,
    move_data: AttackMove,
) -> (GameState, PlayerState, AttackResult) {
    let from_territory_id = move_data.from_territory_id as u32;
    let to_territory_id = move_data.to_territory_id as u32;
    let attack_troop_count = move_data.attack_troop_count;

    // Default result
    let mut result = AttackResult::default();

    // Validation checks
    let player_turn = game_state.current_player == player_state.player_id;
    let owns_from = game_state.territories[from_territory_id].owner_id == player_state.player_id;
    let doesnt_own_to = game_state.territories[to_territory_id].owner_id != player_state.player_id;
    let territories_adjacent =
        adjacency_map.are_adjacent(from_territory_id as Field, to_territory_id as Field);
    let from_troops = game_state.territories[from_territory_id].troop_count;
    let has_enough_troops = attack_troop_count > 0 & attack_troop_count < from_troops;

    let valid_attack =
        player_turn & owns_from & doesnt_own_to & territories_adjacent & has_enough_troops;

    assert(valid_attack == true, "attack should be valid");

    // The attack is valid, proceed with the battle
    result.success = true;

    // Determine number of dice
    let attacker_dice = if attack_troop_count >= 3 {
        3
    } else {
        attack_troop_count
    };

    let defender_troops = game_state.territories[to_territory_id].troop_count;
    let defender_dice = if defender_troops >= 2 { 2 } else { 1 };

    // Roll and sort dice
    let defender_id = game_state.territories[to_territory_id].owner_id;
    let nonce = move_data.dice_roll_seed;

    let attacker_rolls = roll_dice(
        player_state.encrypt_secret,
        defender_id,
        from_territory_id as Field,
        to_territory_id as Field,
        attacker_dice,
        nonce,
    );

    // Simulate defender rolls (in real game, defender would use their own secret)
    let defender_secret = poseidon2([player_state.encrypt_secret, defender_id], 2);

    let defender_rolls = roll_dice(
        defender_secret,
        player_state.player_id,
        to_territory_id as Field,
        from_territory_id as Field,
        defender_dice,
        nonce,
    );

    // Sort dice in descending order
    let sorted_attacker = sort_dice(attacker_rolls, attacker_dice);
    let sorted_defender = sort_dice(defender_rolls, defender_dice);

    // Compare dice and compute casualties
    let mut attacker_losses = 0;
    let mut defender_losses = 0;

    let compare_count = if defender_dice < attacker_dice {
        defender_dice
    } else {
        attacker_dice
    };

    for i in 0..compare_count {
        if sorted_attacker[i] > sorted_defender[i] {
            defender_losses += 1;
        } else {
            attacker_losses += 1;
        }
    }

    // Update result with battle outcome
    result.attacker_losses = attacker_losses;
    result.defender_losses = defender_losses;

    // Update game state based on the outcome
    let mut updated_game = game_state;
    let mut updated_player = player_state;

    // Check if the territory was conquered
    let territory_conquered = defender_losses >= defender_troops;
    result.territory_captured = territory_conquered;

    if territory_conquered {
        // Attacker conquers the territory
        let remaining_attack_troops = attack_troop_count - attacker_losses;
        updated_game.territories[to_territory_id].owner_id = player_state.player_id;
        updated_game.territories[to_territory_id].troop_count = remaining_attack_troops;
        updated_game.territories[from_territory_id].troop_count -=
            (remaining_attack_troops + attacker_losses);

        // Mark that player has conquered a territory this turn (for cards)
        updated_player.has_conquered_territory = true;
    } else {
        // Defender keeps the territory with reduced troops
        updated_game.territories[from_territory_id].troop_count -= attacker_losses;
        updated_game.territories[to_territory_id].troop_count -= defender_losses;
    }

    // Check for win condition
    updated_game = check_win_condition(updated_game);

    (updated_game, updated_player, result)
}

// Execute a fortify move (move troops between territories)
pub fn execute_fortify(
    game_state: GameState,
    player_state: PlayerState,
    adjacency_map: AdjacencyMap,
    move_data: FortifyMove,
) -> (GameState, PlayerState, bool) {
    let from_territory_id = move_data.from_territory_id as u32;
    let to_territory_id = move_data.to_territory_id as u32;
    let troop_count = move_data.troop_count;

    // Validation checks
    let player_turn = game_state.current_player == player_state.player_id;
    let owns_from = game_state.territories[from_territory_id].owner_id == player_state.player_id;
    let owns_to = game_state.territories[to_territory_id].owner_id == player_state.player_id;
    let territories_adjacent =
        adjacency_map.are_adjacent(from_territory_id as Field, to_territory_id as Field);
    let from_troops = game_state.territories[from_territory_id].troop_count;
    let has_enough_troops = troop_count > 0 & troop_count < from_troops;

    let valid_fortify =
        player_turn & owns_from & owns_to & territories_adjacent & has_enough_troops;

    if valid_fortify {
        // Update game state
        let mut updated_game = game_state;

        updated_game.territories[from_territory_id].troop_count -= troop_count;
        updated_game.territories[to_territory_id].troop_count += troop_count;

        (updated_game, player_state, true)
    } else {
        (game_state, player_state, false)
    }
}

// Check if any player has won the game
pub fn check_win_condition(game_state: GameState) -> GameState {
    let mut updated_game = game_state;
    let territory_counts = count_player_territories(game_state);

    // Check if any player owns all territories
    for player_id in 1..=MAX_PLAYERS {
        if territory_counts[player_id] as u32 == MAX_TERRITORIES {
            updated_game.game_ended = true;
            updated_game.winner = player_id as Field;
        }
    }

    updated_game
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

// End the current player's turn and move to the next player
pub fn end_turn(game_state: GameState) -> GameState {
    // Ensure the game has not ended
    assert(!game_state.game_ended, "Game has already ended");

    let mut updated_game = game_state;

    // Find the next active player
    let current_player = game_state.current_player;
    let mut next_player = current_player + 1;

    // Wrap around to player 1 if we reach beyond max players
    if next_player as u32 > MAX_PLAYERS {
        next_player = 1;
    }

    // Update game state
    updated_game.current_player = next_player;
    updated_game.turn_count += 1;

    updated_game
}

// Execute a game move based on its type
pub fn execute_move(
    game_state: GameState,
    player_state: PlayerState,
    adjacency_map: AdjacencyMap,
    game_move: GameMove,
) -> (GameState, PlayerState, bool) {
    match game_move {
        GameMove::PlaceTroops(move_data) => { place_troops(game_state, player_state, move_data) },
        GameMove::Attack(move_data) => {
            let (updated_game, updated_player, result) =
                execute_attack(game_state, player_state, adjacency_map, move_data);
            (updated_game, updated_player, result.success)
        },
        GameMove::Fortify(move_data) => {
            execute_fortify(game_state, player_state, adjacency_map, move_data)
        },
        GameMove::EndTurn => {
            if game_state.current_player == player_state.player_id {
                let updated_game = end_turn(game_state);
                (updated_game, player_state, true)
            } else {
                (game_state, player_state, false)
            }
        },
    }
}
