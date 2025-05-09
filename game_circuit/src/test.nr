use crate::common::{AttackMove, FortifyMove, GameMove, GameState, PlayerState, TroopPlacementMove};
use crate::common::constants::MAX_TERRITORIES;
use crate::game_initialization;
use crate::game_mechanics;
use crate::mpc;
use super::common::AdjacencyMap;

unconstrained fn get_player_territory(game_state: GameState, player_id: u32) -> Field {
    let mut p1_territory = 0;
    for i in 0..MAX_TERRITORIES {
        if game_state.territories[i].owner_id as u32 == player_id {
            p1_territory = i;
            break;
        }
    }
    p1_territory as Field
}

unconstrained fn find_attackable_territories(
    game_state: GameState,
    adjacency_map: AdjacencyMap,
    player1_id: Field,
    player2_id: Field,
) -> (bool, Field, Field) {
    let mut from_territory = 0;
    let mut to_territory = 0;
    let mut found_attackable = false;

    for i in 0..MAX_TERRITORIES {
        if (game_state.territories[i].owner_id == player1_id)
            & (game_state.territories[i].troop_count > 1) {
            for j in 0..MAX_TERRITORIES {
                if game_state.territories[j].owner_id == player2_id {
                    if adjacency_map.are_adjacent(i as Field, j as Field) {
                        from_territory = i;
                        to_territory = j;
                        found_attackable = true;
                        break;
                    }
                }
            }
            if found_attackable {
                break;
            }
        }
    }
    (found_attackable, from_territory as Field, to_territory as Field)
}

#[test]
fn test_2_player_flow() {
    // This tests the entire flow of a two-player game
    // Step 1: Initialize a new game with 2 players
    let num_players = 2;
    let random_seed = 1994; // Deterministic seed for testing

    let game_state = game_initialization::initialize_game_state(num_players);
    let adjacency_map = game_initialization::create_risk_adjacency_map();

    println("Game initialized with 2 players");

    // Step 2: Assign territories to players
    let game_state =
        game_initialization::assign_initial_territories(game_state, num_players, random_seed);

    // // Print initial territory ownership
    println("Initial territory assignment:");
    for i in 0..MAX_TERRITORIES {
        let owner_id = game_state.territories[i].owner_id;
        let troop_count = game_state.territories[i].troop_count;
        println(
            f"territory {i}, owner: {owner_id}, troop_count = {troop_count}",
        );
    }

    // Step 3: Register players with their secrets
    // Player 1 secrets
    let p1_encrypt_secret = 9876210;
    let p1_mask_secret = 1234590;

    // Player 2 secrets
    let p2_encrypt_secret = 1124455;
    let p2_mask_secret = 5567789;

    // // Register Player 1
    let p1_id = 1;
    let player1_state =
        game_initialization::initialize_player_state(p1_id, p1_encrypt_secret, p1_mask_secret);

    let game_state = game_initialization::commit_to_user_secrets(
        game_state,
        p1_encrypt_secret,
        p1_mask_secret,
        p1_id,
    );

    let player1_state = mpc::update_territory_visibility(player1_state, game_state);
    let player1_state = mpc::update_player_view(game_state, player1_state);

    // // Register Player 2
    let p2_id = 2;
    let player2_state =
        game_initialization::initialize_player_state(p2_id, p2_encrypt_secret, p2_mask_secret);

    let game_state = game_initialization::commit_to_user_secrets(
        game_state,
        p2_encrypt_secret,
        p2_mask_secret,
        p2_id,
    );

    let player2_state = mpc::update_territory_visibility(player2_state, game_state);
    let player2_state = mpc::update_player_view(game_state, player2_state);

    println("Players registered successfully");
    let mut p1_unallocated_troops = player1_state.unallocated_troops;
    let mut p2_unallocated_troops = player2_state.unallocated_troops;

    println(f"Player 1 unallocated troops: {p1_unallocated_troops}");
    println(f"Player 2 unallocated troops: {p2_unallocated_troops}");

    // // Step 4: Player 1's Turn - Place troops
    println("\n--- Player 1's Turn ---");

    // // Find a territory owned by Player 1
    let mut p1_territory: Field = 0;
    unsafe {
        p1_territory = get_player_territory(game_state, p1_id as u32);
    }
    assert(p1_territory as u32 < MAX_TERRITORIES, "Territory id should be less than max");

    println(f"Player 1 placing troops on territory {p1_territory}");

    // // Player 1 places 5 troops on their territory
    let troop_placement = TroopPlacementMove { territory_id: p1_territory, troop_count: 5 };

    let (game_state, player1_state, success) =
        game_mechanics::place_troops(game_state, player1_state, troop_placement);

    assert(success, "Troop placement should succeed");

    let p1_troop_count = game_state.territories[p1_territory].troop_count;
    p1_unallocated_troops = player1_state.unallocated_troops;
    println(
        f"Player 1 placed troops. Territory {p1_territory} now has {p1_troop_count} troops.",
    );
    println(f"Player 1 remaining troops: {p1_unallocated_troops}");

    // // End Player 1's turn
    let game_state = game_mechanics::end_turn(game_state);
    assert(game_state.current_player == p2_id, "Current player should be Player 2");

    // Step 5: Player 2's Turn - Place troops
    println("\n--- Player 2's Turn ---");

    // // Find a territory owned by Player 2
    let mut p2_territory = 0;
    unsafe {
        p2_territory = get_player_territory(game_state, p2_id as u32);
    }
    assert(p2_territory as u32 < MAX_TERRITORIES, "Territory id should be less than max");

    println(f"Player 2 placing troops on territory {p2_territory}");

    // // Player 2 places 5 troops on their territory
    let troop_placement = TroopPlacementMove { territory_id: p2_territory, troop_count: 5 };

    let (game_state, player2_state, success) =
        game_mechanics::place_troops(game_state, player2_state, troop_placement);

    assert(success, "Troop placement should succeed");

    let p2_troop_count = game_state.territories[p2_territory].troop_count;
    p2_unallocated_troops = player2_state.unallocated_troops;
    println(
        f"Player 2 placed troops. Territory {p2_territory} now has {p2_troop_count} troops.",
    );
    println(f"Player 2 remaining troops: {p2_unallocated_troops}");

    // // End Player 2's turn
    let game_state = game_mechanics::end_turn(game_state);
    assert(game_state.current_player == p1_id, "Current player should be Player 1");

    // // Step 6: Find two adjacent territories with different owners for an attack
    let mut from_territory = 0;
    let mut to_territory = 0;
    let mut found_attackable = false;

    unsafe {
        let result = find_attackable_territories(game_state, adjacency_map, p1_id, p2_id);
        found_attackable = result.0;
        from_territory = result.1;
        to_territory = result.2;
    }
    // // If we found adjacency, test attack
    if found_attackable {
        println("\n--- Player 1 attacks ---");
        let from_troop_count = game_state.territories[from_territory].troop_count;
        let to_troop_count = game_state.territories[to_territory].troop_count;
        println(
            f"Player 1 attacking from territory {from_territory} ({from_troop_count} troops) to territory {to_territory} ({to_troop_count} troops)",
        );

        //     // Create attack move
        let attack_troops = game_state.territories[from_territory].troop_count - 1;
        let attack_move = AttackMove {
            from_territory_id: from_territory,
            to_territory_id: to_territory,
            attack_troop_count: attack_troops,
            dice_roll_seed: 54321,
        };

        // Execute attack
        let (game_state, player1_state, result) =
            game_mechanics::execute_attack(game_state, player1_state, adjacency_map, attack_move);
        let result_success = result.success;
        let result_attacker_losses = result.attacker_losses;
        let result_defender_losses = result.defender_losses;
        let result_territory_captured = result.territory_captured;
        println(f"Attack result: success = {result_success}");
        println(f"Attacker losses: {result_attacker_losses}");
        println(f"Defender losses: {result_defender_losses}");
        println(f"Territory captured: {result_territory_captured}");

        let mut t_troop_count = game_state.territories[from_territory].troop_count;
        let mut owner_id = game_state.territories[from_territory].owner_id;

        println(
            f"After attack: Territory {from_territory} has {t_troop_count} troops (owner {owner_id})",
        );
        t_troop_count = game_state.territories[to_territory].troop_count;
        owner_id = game_state.territories[to_territory].owner_id;

        println(
            f"After attack: Territory {to_territory} has {t_troop_count} troops (owner {owner_id})",
        );
    }
    println("\n--- Game Status ---");

    // // Count territories by player
    let mut p1_territories = 0;
    let mut p2_territories = 0;

    for i in 0..MAX_TERRITORIES {
        if game_state.territories[i].owner_id == p1_id {
            p1_territories += 1;
        } else if game_state.territories[i].owner_id == p2_id {
            p2_territories += 1;
        }
    }

    println(f"Player 1 territories: {p1_territories}");
    println(f"Player 2 territories: {p2_territories}");

    // // Check win condition
    let game_state = game_mechanics::check_win_condition(game_state);
    let is_game_ended = game_state.game_ended;
    println(f"Game ended: {is_game_ended}");

    if game_state.game_ended {
        let winner = game_state.winner;
        println("Winner: Player {winner}");
    }

    println("Test completed successfully!");
}
