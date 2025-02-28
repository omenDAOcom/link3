// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::{env, near_bindgen, AccountId};
// Crates
use crate::link3::Link3;
mod item;
mod link3;

near_sdk::setup_alloc!();

const LINK_LIMIT: i32 = 10;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct MainHub {
  hub: LookupMap<AccountId, Link3>,
}

impl Default for MainHub {
  fn default() -> Self {
    Self {
      hub: LookupMap::new(b"a".to_vec()),
    }
  }
}

#[near_bindgen]
impl MainHub {
  /****************
   * VIEW METHODS *
   ****************/
  pub fn get(&self, account_id: AccountId) -> Option<Link3> {
    self.hub.get(&account_id)
  }

  pub fn get_plan_limit(&self) -> i32 {
    // for now, we are hardcoding the plan limit
    return LINK_LIMIT;
  }

  /****************
   * CALL METHODS *
   ****************/
  pub fn create(
    &mut self,
    title: String,
    description: String,
    image_uri: Option<String>,
    is_published: Option<bool>,
  ) -> Link3 {
    if Self::get(&self, env::signer_account_id()).is_some() {
      env::panic(b"Can't create, account has Link3 already")
    }

    let link3 = Link3::new(title, description, image_uri, is_published);
    self.hub.insert(&env::signer_account_id(), &link3);

    return link3;
  }

  pub fn update_profile(
    &mut self,
    title: String,
    description: String,
    image_uri: Option<String>,
  ) -> Link3 {
    let mut link3 = Self::get(&self, env::signer_account_id()).unwrap();

    link3.update(title, description, image_uri);

    self.hub.insert(&env::signer_account_id(), &link3);

    return link3;
  }

  pub fn add_link(
    &mut self,
    uri: String,
    title: String,
    description: String,
    image_uri: Option<String>,
  ) -> Link3 {
    let mut link3: Link3 = Self::get(&self, env::signer_account_id())
      .unwrap_or_else(|| env::panic(b"Could not find link3 for this account."));

    // Add item
    if link3.list_all().len() >= LINK_LIMIT as usize {
      panic!("You can only have {} links", LINK_LIMIT);
    }
    link3.create_link(uri, title, description, image_uri);

    // Save to hub state
    self.hub.insert(&env::signer_account_id(), &link3);
    return link3;
  }

  pub fn update_link(
    &mut self,
    id: u64,
    uri: String,
    title: String,
    description: String,
    image_uri: Option<String>,
  ) -> Link3 {
    let mut link3: Link3 = Self::get(&self, env::signer_account_id())
      .unwrap_or_else(|| env::panic(b"Could not find link3 for this account."));

    // Update item
    link3.update_link(id, uri, title, description, image_uri);

    // Save to hub state
    self.hub.insert(&env::signer_account_id(), &link3);
    return link3;
  }

  pub fn delete_link(&mut self, id: u64) -> Link3 {
    let mut link3: Link3 = Self::get(&self, env::signer_account_id())
      .unwrap_or_else(|| env::panic(b"Could not find link3 for this account."));

    // Delete item
    link3.delete_link(id);

    // Save to hub state
    self.hub.insert(&env::signer_account_id(), &link3);

    // Return self
    return link3;
  }
}

/*********
 * TESTS *
 *********/
// use the attribute below for unit tests
#[cfg(test)]
mod tests {
  use super::*;
  use near_sdk::{testing_env, VMContext};
  use near_sdk::{Balance, MockedBlockchain};

  fn get_context(input: Vec<u8>, is_view: bool, deposit: Option<Balance>) -> VMContext {
    VMContext {
      current_account_id: "contract.testnet".to_string(),
      signer_account_id: "alice.testnet".to_string(),
      signer_account_pk: vec![0, 1, 2],
      predecessor_account_id: "alice.testnet".to_string(),
      input,
      block_index: 0,
      block_timestamp: 0,
      account_balance: 0,
      account_locked_balance: 0,
      storage_usage: 0,
      attached_deposit: deposit.unwrap_or(0),
      prepaid_gas: 10u64.pow(18),
      random_seed: vec![0, 1, 2],
      is_view,
      output_data_receivers: vec![],
      epoch_height: 19,
    }
  }

  fn get_alternative_context(input: Vec<u8>, is_view: bool, deposit: Option<Balance>) -> VMContext {
    VMContext {
      current_account_id: "contract.testnet".to_string(),
      signer_account_id: "robert.testnet".to_string(),
      signer_account_pk: vec![0, 1, 2],
      predecessor_account_id: "robert.testnet".to_string(),
      input,
      block_index: 0,
      block_timestamp: 0,
      account_balance: 0,
      account_locked_balance: 0,
      storage_usage: 0,
      attached_deposit: deposit.unwrap_or(0),
      prepaid_gas: 10u64.pow(18),
      random_seed: vec![0, 1, 2],
      is_view,
      output_data_receivers: vec![],
      epoch_height: 19,
    }
  }

  const VALID_IMAGE_URI: &str = "QmUtLVS6EiS93sAFPpPXX8hEM4Gw1T3FTr7YWb2hMM7uhz";

  // mark individual unit tests with #[test] for them to be registered and fired
  #[test]
  fn create_link3_creates_with_correct_state() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    // When
    let mut main = MainHub::default();
    main.create("Hello".to_string(), "World".to_string(), None, Some(true));
    // Then
    let link3 = main.get("alice.testnet".to_string());
    assert!(&link3.is_some());
  }
  #[test]
  fn create_link3_multiple_adds_to_hub() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    // When
    let mut main = MainHub::default();
    main.create("Hello".to_string(), "World".to_string(), None, Some(true));

    let context_alternative = get_alternative_context(vec![], false, Some(1));
    testing_env!(context_alternative);
    main.create("Hello2".to_string(), "World2".to_string(), None, Some(true));

    // Then
    let link3 = main.get("robert.testnet".to_string());
    assert!(&link3.is_some());
  }

  // mark individual unit tests with #[test] for them to be registered and fired
  #[test]
  fn add_link_saves_link_to_state() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);

    let mut main = MainHub::default();
    main.create("Hello".to_string(), "World".to_string(), None, Some(true));
    // When
    main.add_link(
      "uri".to_string(),
      "title".to_string(),
      "description".to_string(),
      Some(VALID_IMAGE_URI.to_string()),
    );
    // Then
    let link3 = main.get("alice.testnet".to_string());
    assert!(link3.unwrap().list().len() > 0);
  }

  #[test]
  #[should_panic]
  fn create_link_over_limit() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);

    let mut main = MainHub::default();
    main.create("Hello".to_string(), "World".to_string(), None, Some(true));

    // When
    for _i in 0..11 {
      main.add_link(
        "uri".to_string(),
        "title".to_string(),
        "description".to_string(),
        Some(VALID_IMAGE_URI.to_string()),
      );
    }

    // Then
    // Should panic
  }

  #[test]
  fn update_link_saves_link_to_state() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);

    let mut main = MainHub::default();
    main.create("Hello".to_string(), "World".to_string(), None, Some(true));
    main.add_link(
      "uri".to_string(),
      "title".to_string(),
      "description".to_string(),
      Some(VALID_IMAGE_URI.to_string()),
    );
    // When
    let id = 1;
    main.update_link(
      id,
      "uri".to_string(),
      "title".to_string(),
      "description".to_string(),
      Some(VALID_IMAGE_URI.to_string()),
    );
    // Then
    let link3 = main.get("alice.testnet".to_string());

    assert_eq!(
      link3.unwrap().list().get(0).unwrap().title,
      "title".to_string(),
      "title should be updated"
    );
  }

  #[test]
  fn delete_link_and_remove_it() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);

    let mut main = MainHub::default();
    main.create("Hello".to_string(), "World".to_string(), None, Some(true));
    main.add_link(
      "uri".to_string(),
      "title".to_string(),
      "description".to_string(),
      Some(VALID_IMAGE_URI.to_string()),
    );

    let id = 1;
    // When
    main.delete_link(id);
    // Then
    let link3 = main.get("alice.testnet".to_string());
    assert!(
      link3.unwrap().list_all().is_empty(),
      "Link should be deleted"
    );
  }

  #[test]
  fn update_profile() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);

    let mut main = MainHub::default();
    main.create("Hello".to_string(), "World".to_string(), None, Some(true));

    // When
    main.update_profile(
      "title".to_string(),
      "description".to_string(),
      Some(VALID_IMAGE_URI.to_string()),
    );
    // Then
    let link3 = main.get("alice.testnet".to_string());
    let info = link3.unwrap().info();

    assert_eq!(info.0, "title".to_string(), "Title should be updated");
  }
}
