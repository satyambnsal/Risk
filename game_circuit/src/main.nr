mod common;

// mod visibility;
mod game_initialization;
mod game_mechanics;
mod mpc;

use crate::common::{
    AdjacencyMap, AttackMove, FortifyMove, GameMove, GameState, PlayerState, TroopPlacementMove,
};
use crate::common::constants;

fn main(num_players: u32, random_seed: Field) -> pub GameState {
    let game_state = game_initialization::initialize_game_state(num_players);
    let adjacency_map = game_initialization::create_risk_adjacency_map();

    // Assign territories to players
    let updated_game =
        game_initialization::assign_initial_territories(game_state, num_players, random_seed);

    updated_game
}

fn register_player(
    game_state: GameState,
    player_id: Field,
    encrypt_secret: Field,
    mask_secret: Field,
) -> pub (GameState, PlayerState) {
    // Initialize player state
    let player_state =
        game_initialization::initialize_player_state(player_id, encrypt_secret, mask_secret);

    // Commit player secrets to the game state
    let updated_game = game_initialization::commit_to_user_secrets(
        game_state,
        encrypt_secret,
        mask_secret,
        player_id,
    );

    // Update player's visibility and view
    let updated_player = mpc::update_territory_visibility(player_state, updated_game);
    let final_player = mpc::update_player_view(updated_game, updated_player);

    (updated_game, final_player)
}

fn place_troops(
    game_state: GameState,
    player_state: PlayerState,
    territory_id: Field,
    troop_count: u32,
) -> pub (GameState, PlayerState, bool) {
    let move_data = TroopPlacementMove { territory_id: territory_id, troop_count: troop_count };

    let game_move = GameMove::PlaceTroops(move_data);
    let adjacency_map = game_initialization::create_risk_adjacency_map();

    let (updated_game, updated_player, success) =
        game_mechanics::execute_move(game_state, player_state, adjacency_map, game_move);

    (updated_game, updated_player, success)
}

fn attack(
    game_state: GameState,
    player_state: PlayerState,
    from_territory_id: Field,
    to_territory_id: Field,
    attack_troop_count: u32,
    dice_roll_seed: Field,
) -> pub (GameState, PlayerState, bool, u32, u32, bool) {
    let move_data = AttackMove {
        from_territory_id: from_territory_id,
        to_territory_id: to_territory_id,
        attack_troop_count: attack_troop_count,
        dice_roll_seed: dice_roll_seed,
    };

    let adjacency_map = game_initialization::create_risk_adjacency_map();

    let (updated_game, updated_player, result) =
        game_mechanics::execute_attack(game_state, player_state, adjacency_map, move_data);

    (
        updated_game, updated_player, result.success, result.attacker_losses,
        result.defender_losses, result.territory_captured,
    )
}
