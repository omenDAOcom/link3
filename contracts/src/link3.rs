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
        links_ref
            .iter()
            .filter(|item| item.is_published())
            .map(|item| item.read())
            .collect()
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

    pub fn create_link(
        &mut self,
        uri: String,
        title: String,
        description: String,
        image_uri: Option<String>,
        is_published: bool,
    ) -> &Item {
        if env::signer_account_id() != self.owner_account_id {
            env::panic(b"Only the owner can create a link");
        }
        let last = self.links.last();
        let id = u64::try_from(if last.is_some() { last.unwrap().id() + 1 } else { 0 }).unwrap();
        let item = Item::new(id, uri, title, description, image_uri, is_published);

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
        is_published: bool,
    ) -> &Item {
        if env::signer_account_id() != self.owner_account_id {
            env::panic(b"Only the owner can update a link");
        }
        let index = self
            .links
            .iter()
            .position(|item| item.id() == id)
            .unwrap_or_else(|| {
                env::panic(b"Link does not exist");
            });
        log!("Updating link with index: {}", id);

        let item = Item::new(id, uri, title, description, image_uri, is_published);

        // Update item
        self.links[index] = item;
        // Return updated item
        &self.links[index]
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

    fn get_alternative_context(
        input: Vec<u8>,
        is_view: bool,
        deposit: Option<Balance>,
    ) -> VMContext {
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

    fn generate_contract(is_published: Option<bool>) -> Link3 {
        Link3::new(
            "This is an awesome title".to_string(),
            "This is the perfect description".to_string(),
            Some("image_uri".to_string()),
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
        assert_eq!(contract.image_uri, Some("image_uri".to_string()));
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
            true,
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
            true,
        );
        // Then
        // - Should panic
    }

    #[test]
    fn list_only_returns_published_links() {
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
            true,
        );

        contract.create_link(
            "another_some_uri".to_string(),
            "another_some_title".to_string(),
            "another_some_description".to_string(),
            Some("another_image".to_string()),
            true,
        );

        contract.create_link(
            "pvt_some_uri".to_string(),
            "pvt_some_title".to_string(),
            "pvt_some_description".to_string(),
            Some("pvt_another_image".to_string()),
            false,
        );

        let result = contract.list();

        // Then
        assert_eq!(result.len(), 2, "Should've returned 2 elements");
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
            true,
        );

        contract.create_link(
            "another_some_uri".to_string(),
            "another_some_title".to_string(),
            "another_some_description".to_string(),
            Some("another_image".to_string()),
            true,
        );

        contract.create_link(
            "pvt_some_uri".to_string(),
            "pvt_some_title".to_string(),
            "pvt_some_description".to_string(),
            Some("pvt_another_image".to_string()),
            false,
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
            true,
        );

        contract.create_link(
            "another_some_uri".to_string(),
            "another_some_title".to_string(),
            "another_some_description".to_string(),
            Some("another_image".to_string()),
            true,
        );

        contract.create_link(
            "pvt_some_uri".to_string(),
            "pvt_some_title".to_string(),
            "pvt_some_description".to_string(),
            Some("pvt_another_image".to_string()),
            false,
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
            true,
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
            true,
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
            true,
        );

        // When
        contract.update_link(
            2,
            "some_uri".to_string(),
            "some_title".to_string(),
            "some_description".to_string(),
            Some("image".to_string()),
            true,
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
            true,
        );

        // When
        testing_env!(context);
        let item = contract.update_link(
            0,
            "some_uri".to_string(),
            "some_title".to_string(),
            "some_description".to_string(),
            Some("image".to_string()),
            true,
        );
        // Then
        assert_eq!(
            item.read().title,
            "some_title".to_string(),
            "Should've returned an item"
        );
    }
}
