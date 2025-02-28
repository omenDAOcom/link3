use std::convert::TryFrom;
use std::vec;
// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, log, AccountId, PanicOnDefault};
use serde::Serialize;
// Crates
use crate::item::Item;
use crate::item::ItemInfo;

#[derive(BorshSerialize, BorshDeserialize, Clone, PanicOnDefault, Serialize)]
pub struct Link3 {
  title: String,
  description: String,
  image_uri: Option<String>,
  owner_account_id: AccountId,
  links: Vec<Item>,
  is_published: bool,
}

// Core Logic/Implementation
impl Link3 {
  // Instantiate a new Item
  pub fn new(
    title: String,
    description: String,
    image_uri: Option<String>,
    is_published: Option<bool>,
  ) -> Self {
    // if env::state_exists() {
    //     env::panic(b"The contract is already initialized");
    // }

    log!(
      "Creating new Link3 contract with account id: {} and deposite of: {}",
      env::current_account_id(),
      env::attached_deposit()
    );

    Link3 {
      title,
      description,
      image_uri,
      owner_account_id: env::signer_account_id(),
      links: vec![],
      is_published: is_published.unwrap_or(true),
    }
  }

  /****************
   * VIEW METHODS *
   ****************/
  pub fn info(&self) -> (String, String, String, Option<String>) {
    if !self.is_published {
      env::panic(b"This contract is not published");
    }

    (
      self.title.clone(),
      self.description.clone(),
      self.owner_account_id.clone(),
      self.image_uri.clone(),
    )
  }

  pub fn list(&self) -> Vec<ItemInfo> {
    if !self.is_published {
      env::panic(b"This contract is not published");
    }

    let links_ref = &self.links;
    links_ref.iter().map(|item| item.read()).collect()
  }

  /****************
   * CALL METHODS *
   ****************/
  pub fn update_published_status(&mut self, is_published: bool) {
    if env::signer_account_id() != self.owner_account_id {
      env::panic(b"Only the owner can change published state");
    }

    if self.is_published != is_published {
      self.is_published = is_published;
    }
  }

  pub fn list_all(&self) -> Vec<Item> {
    if env::signer_account_id() != self.owner_account_id {
      env::panic(b"Only the owner can view all items.");
    }
    self.links.clone()
  }

  pub fn update(
    &mut self,
    title: String,
    description: String,
    image_uri: Option<String>,
  ) -> &Link3 {
    if env::signer_account_id() != self.owner_account_id {
      panic!("Only the owner can update the contract.");
    }

    if self.title != title && self.is_valid_title(&title) {
      self.title = title;
    }

    if self.description != description && self.is_valid_description(&description) {
      self.description = description;
    }

    if image_uri.is_some()
      && self.image_uri != image_uri
      && self.is_valid_image_uri(&image_uri.clone().unwrap())
    {
      self.image_uri = image_uri;
    }

    return self;
  }

  pub fn create_link(
    &mut self,
    uri: String,
    title: String,
    description: String,
    image_uri: Option<String>,
  ) -> &Item {
    if env::signer_account_id() != self.owner_account_id {
      env::panic(b"Only the owner can create a link");
    }

    let last = self.links.last();
    let id = u64::try_from(if last.is_some() {
      last.unwrap().id() + 1
    } else {
      1
    })
    .unwrap();
    let item = Item::new(id, uri, title, description, image_uri);

    self.links.push(item);
    // Return created item
    &self.links[self.links.len() - 1]
  }

  pub fn update_link(
    &mut self,
    id: u64,
    uri: String,
    title: String,
    description: String,
    image_uri: Option<String>,
  ) -> &Item {
    if env::signer_account_id() != self.owner_account_id {
      env::panic(b"Only the owner can update a link");
    }
    let index = self.get_index(id);

    let item = Item::new(id, uri, title, description, image_uri);

    // Update item
    self.links[index] = item;
    // Return updated item
    &self.links[index]
  }

  pub fn delete_link(&mut self, id: u64) {
    if env::signer_account_id() != self.owner_account_id {
      panic!("Only the owner can delete a link");
    }

    let index = self.get_index(id);

    // Remove item
    self.links.remove(index);
  }

  /*******************
   * PRIVATE METHODS *
   *******************/

  fn get_index(&mut self, id: u64) -> usize {
    self
      .links
      .iter()
      .position(|item| item.id() == id)
      .unwrap_or_else(|| {
        panic!("Link does not exist");
      })
  }

  fn is_valid_title(&mut self, title: &String) -> bool {
    if title.is_empty() {
      panic!("Title cannot be empty");
    }

    if title.len() < 3 {
      panic!("Title must be at least 3 characters long");
    }

    if title.len() > 20 {
      panic!("Title must be at most 20 characters long");
    }

    return true;
  }

  fn is_valid_description(&mut self, description: &String) -> bool {
    if description.is_empty() {
      panic!("Description cannot be empty");
    }

    if description.len() < 3 {
      panic!("Description must be at least 3 characters long");
    }

    if description.len() > 200 {
      panic!("Description must be at most 200 characters long");
    }

    return true;
  }

  fn is_valid_image_uri(&mut self, image_uri: &String) -> bool {
    if image_uri.is_empty() {
      panic!("Image uri cannot be empty");
    }
    if image_uri.len() != 46 {
      panic!("Image uri must be a valid ipfs hash");
    }

    return true;
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
      current_account_id: "alice.testnet".to_string(),
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
      current_account_id: "alice.testnet".to_string(),
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

  fn generate_contract(is_published: Option<bool>) -> Link3 {
    Link3::new(
      "This is an awesome title".to_string(),
      "This is the perfect description".to_string(),
      Some(VALID_IMAGE_URI.to_string()),
      is_published,
    )
  }

  #[test]
  #[should_panic]
  fn create_with_default_panics() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    // When
    Link3::default();
    // Then
    // - Panics
  }

  // #[test]
  // #[should_panic(
  //     expected = "A deposit of at least 1 token is required to create a Link3 contract"
  // )]
  // fn init_without_deposit_panics() {
  //     // Given
  //     let context = get_context(vec![], false, None);
  //     testing_env!(context);
  //     // When
  //     Link3::new(
  //         "This is an awesome title".to_string(),
  //         "This is the perfect description".to_string(),
  //         Some("image_uri".to_string()),
  //         None,
  //     );
  //     // Then
  //     // - Should panic
  // }

  #[test]
  fn init_creates_with_correct_state() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    // When
    let contract = generate_contract(None);
    // Then
    assert_eq!(contract.title, "This is an awesome title".to_string());
    assert_eq!(
      contract.description,
      "This is the perfect description".to_string()
    );
    assert_eq!(contract.image_uri, Some(VALID_IMAGE_URI.to_string()));
    assert_eq!(contract.is_published, true);
  }

  #[test]
  fn init_with_published_false_is_not_published() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    // When
    let contract = generate_contract(Some(false));
    // Then
    assert_eq!(contract.is_published, false);
  }

  #[test]
  fn get_info_returns_correct_state() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let contract = generate_contract(None);
    // When
    let info = contract.info();
    // Then
    assert_eq!(info.0, contract.title);
    assert_eq!(info.1, contract.description);
    assert_eq!(info.2, contract.owner_account_id);
    assert_eq!(info.3, contract.image_uri);
  }

  #[test]
  #[should_panic(expected = "This contract is not published")]
  fn get_info_panics_if_contract_is_not_published() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    // Create contract that is not published
    let contract = generate_contract(Some(false));
    // When
    contract.info();
    // Then
    // - Should panic
  }

  #[test]
  fn update_published_status_updates_state() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let initial_is_published_value = false;
    let mut contract = generate_contract(Some(initial_is_published_value));

    // When
    contract.update_published_status(!initial_is_published_value);

    // Then
    assert_eq!(
      contract.is_published, !initial_is_published_value,
      "Published status should've been updated"
    );
  }

  #[test]
  #[should_panic(expected = "Only the owner can change published state")]
  fn update_published_status_with_wrong_owner_panics() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);

    let initial_is_published_value = false;
    let mut contract = generate_contract(Some(initial_is_published_value));

    // When
    let alterinative_context = get_alternative_context(vec![], false, None);
    testing_env!(alterinative_context);
    contract.update_published_status(!initial_is_published_value);

    // Then
    // - Should panic
  }

  #[test]
  fn create_link_adds_link() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(true));

    // When
    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    // Then
    assert!(contract.list().len() == 1, "Should have at one item");
  }

  #[test]
  #[should_panic(expected = "Only the owner can create a link")]
  fn create_link_with_wrong_owner_panics() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(true));

    // When
    let alterinative_context = get_alternative_context(vec![], false, None);
    testing_env!(alterinative_context);
    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );
    // Then
    // - Should panic
  }

  #[test]
  #[should_panic(expected = "This contract is not published")]
  fn list_panics_if_link3_is_not_published() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let contract = generate_contract(Some(false));
    // When
    contract.list();
    // Then
    // - Should panic
  }

  #[test]
  fn list_all_should_return_all_items() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    contract.create_link(
      "another_some_uri".to_string(),
      "another_some_title".to_string(),
      "another_some_description".to_string(),
      Some("another_image".to_string()),
    );

    contract.create_link(
      "pvt_some_uri".to_string(),
      "pvt_some_title".to_string(),
      "pvt_some_description".to_string(),
      Some("pvt_another_image".to_string()),
    );

    let result = contract.list_all();

    // Then
    assert_eq!(result.len(), 3, "Should've returned all items.");
  }

  #[test]
  #[should_panic(expected = "Only the owner can view all items")]
  fn list_all_with_wrong_owner_panics() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    contract.create_link(
      "another_some_uri".to_string(),
      "another_some_title".to_string(),
      "another_some_description".to_string(),
      Some("another_image".to_string()),
    );

    contract.create_link(
      "pvt_some_uri".to_string(),
      "pvt_some_title".to_string(),
      "pvt_some_description".to_string(),
      Some("pvt_another_image".to_string()),
    );

    // When
    let alt_context = get_alternative_context(vec![], false, Some(1));
    testing_env!(alt_context);
    contract.list_all();
    // Then
    // - Should panic
  }

  #[test]
  #[should_panic(expected = "Only the owner can update a link")]
  fn update_item_with_wrong_owner_panics() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    // When
    let alt_context = get_alternative_context(vec![], false, Some(1));
    testing_env!(alt_context);
    contract.update_link(
      1,
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );
    // Then
    // - Should panic
  }

  #[test]
  #[should_panic(expected = "Link does not exist")]
  fn update_item_with_wrong_id_panics() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    // When
    contract.update_link(
      2,
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );
    // Then
    // - Should panic
  }

  #[test]
  fn update_item() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context.clone());
    let mut contract = generate_contract(Some(false));

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    // When
    let id = 1;
    testing_env!(context);
    let item = contract.update_link(
      id,
      "some_uri".to_string(),
      "another_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );
    // Then
    assert_eq!(
      item.read().title,
      "another_title".to_string(),
      "Should've returned an item"
    );
  }

  #[test]
  #[should_panic(expected = "Only the owner can delete a link")]
  fn delete_item_not_own() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );
    let id = 1;
    // When
    let alt_context = get_alternative_context(vec![], false, Some(1));
    testing_env!(alt_context);
    contract.delete_link(id);
    // Then
    // - Should panic
  }

  #[test]
  fn delete_last_item() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    let id = 1;
    // When
    contract.delete_link(id);
    // Then
    assert!(contract.list_all().is_empty(), "Should've deleted the item");
  }

  #[test]
  fn delete_item() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    let list_lenght = contract.list_all().len();
    // When
    let id = 1;
    contract.delete_link(id);
    // Then
    assert_eq!(
      list_lenght - 1,
      contract.list_all().len(),
      "Should've deleted the item"
    );
  }

  #[test]
  #[should_panic(expected = "Link does not exist")]
  fn get_index_with_no_items() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    let id = 1;
    // When
    contract.get_index(id);
    // Then
    // - Should panic
  }

  #[test]
  fn get_index_with_one_item() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    contract.create_link(
      "some_uri".to_string(),
      "some_title".to_string(),
      "some_description".to_string(),
      Some("image".to_string()),
    );

    // When
    let id = 1;
    let index = contract.get_index(id);
    // Then
    assert_eq!(index, 0, "Should've returned the index of the item");
  }

  #[test]
  #[should_panic(expected = "Title cannot be empty")]
  fn validate_title_empty_string() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_title(&"".to_string());
    // Then
    // - Should panic
  }

  #[test]
  #[should_panic(expected = "Title must be at least 3 characters long")]
  fn validate_title_less_chars_than_required() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_title(&"ab".to_string());
    // Then
    // - Should panic
  }

  #[test]
  #[should_panic(expected = "Title must be at most 20 characters long")]
  fn validate_title_more_chars_than_allowed() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_title(&"abcdefghijklmnopqrstuvwxyz".to_string());
    // Then
    // - Should panic
  }

  #[test]
  fn validate_title() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_title(&"abc".to_string());
    // Then
    // - Should not panic
  }

  #[test]
  #[should_panic(expected = "Description cannot be empty")]
  fn validate_description_empty_string() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_description(&"".to_string());
    // Then
    // - Should panic
  }

  #[test]
  #[should_panic(expected = "Description must be at least 3 characters long")]
  fn validate_description_less_chars_than_required() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_description(&"ab".to_string());
    // Then
    // - Should panic
  }

  #[test]
  #[should_panic(expected = "Description must be at most 200 characters long")]
  fn validate_description_more_chars_than_allowed() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_description(&"200JVqNGFrN3R8OC0DreT9yUEw6dkzCgyzLv9a6QslWC2wqdRkfjRD6ErbgUFYKHZdCzgFn1l9U719ANtFw6uDoNoIXoN0Q8c8RINKEZPDbpohxhDTnjl2YljFbP4JX2blOdpoCqglKxL6kZjPkqn2TXy6b9R54B8vmSDX3bQD6pnzdfR7l6MaFssnjsW7hLgp1mo61Gzy".to_string());
    // Then
    // - Should panic
  }

  #[test]
  fn validate_description() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_description(&"abc".to_string());
    // Then
    // - Should not panic
  }

  #[test]
  #[should_panic(expected = "Image uri cannot be empty")]
  fn validate_image_uri_empty_string() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_image_uri(&"".to_string());
    // Then
    // - Should panic
  }

  #[test]
  #[should_panic(expected = "Image uri must be a valid ipfs hash")]
  fn validate_image_uri_more_chars_than_allowed() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_image_uri(&"3r131r31r31".to_string());
    // Then
    // - Should panic
  }

  #[test]
  fn validate_image_uri() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.is_valid_image_uri(&VALID_IMAGE_URI.to_string());
    // Then
    // - Should not panic
  }

  #[test]
  #[should_panic(expected = "Only the owner can update the contract.")]
  fn update_not_own() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(true));

    // When
    let alt_context = get_alternative_context(vec![], false, Some(1));
    testing_env!(alt_context);
    contract.update(
      "some_title".to_string(),
      "some_description".to_string(),
      Some("imagecid".to_string()),
    );
    // Then
    // - Should panic
  }

  #[test]
  fn update_without_image() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(true));

    // When
    contract.update(
      "some_title".to_string(),
      "some_description".to_string(),
      None,
    );
    // Then
    assert_eq!(
      contract.image_uri,
      Some(VALID_IMAGE_URI.to_string()),
      "Image uri should not be updated"
    );
  }

  #[test]
  fn update_successfully() {
    // Given
    let context = get_context(vec![], false, Some(1));
    testing_env!(context);
    let mut contract = generate_contract(Some(false));

    // When
    contract.update(
      "another_title".to_string(),
      "another_description".to_string(),
      Some("QmUtLVS6EiS93sAFPpPXX8hEM4Gw1T3FTr7YWb2hMM7uhz".to_string()),
    );
    // Then
    assert_eq!(
      contract.title,
      "another_title".to_string(),
      "Should've updated the title"
    );
    assert_eq!(
      contract.description,
      "another_description".to_string(),
      "Should've updated the description"
    );
    assert_eq!(
      contract.image_uri,
      Some("QmUtLVS6EiS93sAFPpPXX8hEM4Gw1T3FTr7YWb2hMM7uhz".to_string()),
      "Should've updated the image cid"
    );
  }
}
