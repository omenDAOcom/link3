// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::{env, near_bindgen, AccountId};
// Crates
use crate::link3::Link3;
mod item;
mod link3;

near_sdk::setup_alloc!();

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

    pub fn add_link(
        &mut self,
        uri: String,
        title: String,
        description: String,
        image_uri: Option<String>,
        is_published: Option<bool>,
    ) {
        let mut link3: Link3 = Self::get(&self, env::signer_account_id())
            .unwrap_or_else(|| env::panic(b"Could not find link3 for this account."));

        // Add item
        link3.create_link(
            uri,
            title,
            description,
            image_uri,
            is_published.unwrap_or(true),
        );

        // Save to hub state
        self.hub.insert(&env::signer_account_id(), &link3);
    }

    pub fn update_link(
        &mut self,
        id: u64,
        uri: String,
        title: String,
        description: String,
        image_uri: Option<String>,
        is_published: Option<bool>,
    ) {
        let mut link3: Link3 = Self::get(&self, env::signer_account_id())
            .unwrap_or_else(|| env::panic(b"Could not find link3 for this account."));

        // Update item
        link3.update_link(
            id,
            uri,
            title,
            description,
            image_uri,
            is_published.unwrap_or(true),
        );

        // Save to hub state
        self.hub.insert(&env::signer_account_id(), &link3);
    }
}

/*********
 * TESTS *
 *********/
// use the attribute below for unit tests
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::{testing_env, VMContext, log};
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

    fn get_alternative_context(
        input: Vec<u8>,
        is_view: bool,
        deposit: Option<Balance>,
    ) -> VMContext {
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
            Some("image_uri".to_string()),
            Some(true),
        );
        // Then
        let link3 = main.get("alice.testnet".to_string());
        assert!(link3.unwrap().list().len() > 0);
    }
    #[test]
    fn update_link_saves_link_to_state() {
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
            Some("image_uri".to_string()),
            Some(true),
        );
        main.update_link(
            1,
            "uri".to_string(),
            "title".to_string(),
            "description".to_string(),
            Some("image_uri".to_string()),
            Some(true),
        );
        // Then
        let link3 = main.get("alice.testnet".to_string());
        log!("link3: {:?}", link3.unwrap().list().get(0).unwrap().uri);
        // assert!(link3.unwrap().list().len() > 0);
    }
}
