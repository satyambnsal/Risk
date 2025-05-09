pub mod constants {
    pub global MAX_PLAYERS: u32 = 2;
    pub global MAX_TERRITORIES: u32 = 25;
    pub global MAX_TROOPS_PER_TERRITORY: u32 = 100;
    pub global INITIAL_TROOPS_PER_PLAYER: u32 = 40;
    pub global MIN_REINFORCEMENTS: u32 = 3;
}

pub struct Territory {
    pub id: Field,
    pub owner_id: Field,
    pub troop_count: u32,
}

impl Territory {
    pub fn default() -> Self {
        Territory { id: 0, owner_id: 0, troop_count: 0 }
    }

    pub fn encode(self) -> Field {
        let id_part = self.id;
        let owner_part = self.owner_id * 0x100;
        let troops_part = (self.troop_count as Field) * 0x10000;

        id_part + owner_part + troops_part
    }

    pub fn decode(encoded: Field) -> Self {
        let id = encoded as u32 % 0x100;
        let owner_id = (encoded as u32 / 0x100) % 0x100;
        let troop_count = ((encoded as u32 / 0x10000) % 0x10000) as u32;

        Territory { id: id as Field, owner_id: owner_id as Field, troop_count: troop_count }
    }
}

pub struct AdjacencyMap {
    pub adjacency: [u32; constants::MAX_TERRITORIES],
}

impl AdjacencyMap {
    pub fn default() -> Self {
        AdjacencyMap { adjacency: [0; constants::MAX_TERRITORIES] }
    }

    pub fn are_adjacent(self, from_territory: Field, to_territory: Field) -> bool {
        let from_idx = from_territory as u32;
        let to_bit = 1 << (to_territory as u8);

        (self.adjacency[from_idx] & to_bit) != 0
    }

    // Add an adjacency between two territories (bidirectional)
    pub fn add_adjacency(mut self, territory1: Field, territory2: Field) -> Self {
        assert(
            territory1 as u32 >= 0 & territory1 as u32 < constants::MAX_TERRITORIES,
            "Territory1 ID out of bounds",
        );
        assert(
            territory2 as u32 >= 0 & territory2 as u32 < constants::MAX_TERRITORIES,
            "Territory2 ID out of bounds",
        );

        let t1_idx = territory1 as u32;
        let t2_idx = territory2 as u32;

        let t2_bit = 1 << t2_idx as u8;
        let t1_bit = 1 << t1_idx as u8;

        self.adjacency[t1_idx] |= t2_bit;
        self.adjacency[t2_idx] |= t1_bit;

        self
    }
}

pub struct MPCState {
    pub user_encrypt_secret_hashes: [Field; constants::MAX_PLAYERS],
    pub user_mask_secret_hashes: [Field; constants::MAX_PLAYERS],
    pub round_id: Field,
}

impl MPCState {
    pub fn default() -> Self {
        MPCState {
            user_encrypt_secret_hashes: [0; constants::MAX_PLAYERS],
            user_mask_secret_hashes: [0; constants::MAX_PLAYERS],
            round_id: 0,
        }
    }
}

pub struct GameState {
    pub game_ended: bool,
    pub turn_count: Field,
    pub current_player: Field,
    pub territories: [Territory; constants::MAX_TERRITORIES],
    pub mpc_state: MPCState,
    pub winner: Field, // 0 means no winner yet
}

impl GameState {
    pub fn default() -> Self {
        GameState {
            game_ended: false,
            turn_count: 0,
            current_player: 1,
            territories: [Territory::default(); constants::MAX_TERRITORIES],
            mpc_state: MPCState::default(),
            winner: 0,
        }
    }
}

pub struct PlayerState {
    pub player_id: Field,
    pub encrypt_secret: Field,
    pub mask_secret: Field,
    pub visible_territories: [bool; constants::MAX_TERRITORIES],
    pub territories_view: [Territory; constants::MAX_TERRITORIES],
    pub unallocated_troops: u32,
    pub reinforcements: u32,
    pub has_conquered_territory: bool,
}

impl PlayerState {
    pub fn default() -> Self {
        PlayerState {
            player_id: 0,
            encrypt_secret: 0,
            mask_secret: 0,
            visible_territories: [false; constants::MAX_TERRITORIES],
            territories_view: [Territory::default(); constants::MAX_TERRITORIES],
            unallocated_troops: 0,
            reinforcements: 0,
            has_conquered_territory: false,
        }
    }
}

pub struct TroopPlacementMove {
    pub territory_id: Field,
    pub troop_count: u32,
}

pub struct AttackMove {
    pub from_territory_id: Field,
    pub to_territory_id: Field,
    pub attack_troop_count: u32,
    pub dice_roll_seed: Field,
}

pub struct FortifyMove {
    pub from_territory_id: Field,
    pub to_territory_id: Field,
    pub troop_count: u32,
}

pub enum GameMove {
    PlaceTroops(TroopPlacementMove),
    Attack(AttackMove),
    Fortify(FortifyMove),
    EndTurn,
}

pub struct AttackResult {
    pub success: bool,
    pub attacker_losses: u32,
    pub defender_losses: u32,
    pub territory_captured: bool,
}

impl AttackResult {
    pub fn default() -> Self {
        AttackResult {
            success: false,
            attacker_losses: 0,
            defender_losses: 0,
            territory_captured: false,
        }
    }
}
