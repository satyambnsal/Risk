mod common;
mod visibility;
mod game_initialization;

use crate::common::constants;

fn main(age: u32) {
    assert(age >= 18);
    let message = "Noir Gud";
    let arr = message.as_bytes().map(|charCode| charCode as Field);
    println(arr);
    // let field_arr = arr;


    let hash = std::hash::pedersen_hash(arr);
    println(constants::MAX_TERRITORIES);

    let commitment = std::hash::pedersen_commitment(arr);
    println(hash);
    println(commitment);
}

#[test]
fn test_main() {
    main(20);
}
