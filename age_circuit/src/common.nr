use mpclib::selective_disclosure::selective_disclosure::RoundState;

pub mod constants {
    pub global MAX_PLAYERS: u32 = 4;
    pub global MAX_TERRITORIES: u32 = 42;
    pub global MAX_TROOPS_PER_TERRITORY: u32 = 100;
    pub global INITIAL_TROOPS_PER_PLAYER: u32 = 40;
}

pub struct Territory {
    pub id: Field,
    pub owner_id: Field,
    pub troop_count: Field,
}

impl std::default::Default for Territory {
    fn default() -> Self {
        Territory { id: 0, owner_id: 0, troop_count: 0 }
    }
}

impl Territory {
    pub fn encode(self) -> Field {
        (self.id) + (self.owner_id * 0x100) + (self.troop_count * 0x10000)
    }

    pub fn decode(encoded: Field) -> Self {
        let bytes: [u8; 3] = encoded.to_le_bytes();
        Territory {
            id: bytes[0] as Field,
            owner_id: bytes[1] as Field,
            troop_count: bytes[2] as Field,
        }
    }
}

pub struct AdjacencyMap {

    // For each territory, store a bit map of its neighbours
    // e.g. adjacency[0] = 0b110 means territory 0 is adjacent to territories 1 and 2
    pub adjacency: [u32; constants::MAX_TERRITORIES],
}

type RoundMpcState = RoundState<constants::MAX_TERRITORIES, constants::MAX_PLAYERS>;

pub struct GameState {
    pub game_ended: bool,
    pub turn_count: Field,
    pub current_player: Field,
    pub territories: [Territory; constants::MAX_TERRITORIES],
    pub mpc_state: RoundMpcState,
}

impl std::default::Default for GameState {
    fn default() -> Self {
        GameState {
            game_ended: false,
            turn_count: 0,
            current_player: 1,
            territories: [Territory::default(); constants::MAX_TERRITORIES],
            mpc_state: RoundMpcState::default(),
        }
    }
}

pub struct PlayerState {
    pub player_id: Field,
    pub encrypt_secret: Field,
    pub mask_secret: Field,
    pub visible_territories: [Field; constants::MAX_TERRITORIES],
    pub territories_view: [Territory; constants::MAX_TERRITORIES],
    pub unallocated_troops: Field,
}

impl std::default::Default for PlayerState {
    fn default() -> Self {
        PlayerState {
            player_id: 0,
            encrypt_secret: 0,
            mask_secret: 0,
            visible_territories: [0; constants::MAX_TERRITORIES],
            territories_view: [Territory::default(); constants::MAX_TERRITORIES],
            unallocated_troops: 0,
        }
    }
}

pub struct TroopPlacementMove {
    pub territory_id: Field,
    pub troop_count: Field,
}

pub struct AttackMove {
    pub from_territory_id: Field,
    pub to_territory_id: Field,
    pub attack_troop_count: Field,
    pub dice_roll_seed: Field,
}

pub enum GameMove {
    PlaceTroops(TroopPlacementMove),
    Attack(AttackMove),
    EndTurn,
}
