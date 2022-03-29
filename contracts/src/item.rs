// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, log, PanicOnDefault};
use serde::Serialize;

// #[near_bindgen]
#[derive(BorshSerialize, BorshDeserialize, Clone, PanicOnDefault, Serialize, Debug)]
pub struct Item {
    id: u64,
    uri: String,
    title: String,
    description: String,
    image_uri: Option<String>,
    is_published: bool,
}

// Core Logic/Implementation
// #[near_bindgen]
impl Item {
    // Instantiate a new Item
    pub fn new(
        id: u64,
        uri: String,
        title: String,
        description: String,
        image_uri: Option<String>,
        is_published: bool,
    ) -> Self {
        log!("Creating new item with title {},", &title);

        Item {
            id,
            uri,
            title,
            description,
            image_uri,
            is_published,
        }
    }

    /****************
     * VIEW METHODS *
     ****************/
    pub fn id(&self) -> u64 {
        self.id
    }

    pub fn is_published(&self) -> bool {
        self.is_published
    }

    pub fn read(&self) -> ItemInfo {
        if !self.is_published {
            env::panic(b"Can't read an item that is not public.");
        }

        // Not verifing access for v1, if it is public it has access
        // Changing here so there is no need to change the ItemInfo's implementation
        // let has_access = !self.is_premium || Item::has_access(self);

        let has_access = true;
        ItemInfo::map(self, has_access)
    }

    /****************
     * CALL METHODS *
     ****************/
    pub fn set_published(&mut self, is_published: bool) {
        if env::current_account_id() != env::predecessor_account_id() {
            env::panic(b"Only the owner can change the is_published state");
        }

        self.is_published = is_published;
    }

    /************
     * INTERNAL *
     ************/
}

// Helper Strut to return only the allowed info of Items (hide some when there's no access)
// Redudant for v1.
#[derive(BorshSerialize, BorshDeserialize, PanicOnDefault, Serialize)]
pub struct ItemInfo {
    pub id: u64,
    pub uri: Option<String>,
    pub title: String,
    pub description: String,
    pub image: Option<String>,
}

impl ItemInfo {
    pub fn map(from: &Item, has_access: bool) -> Self {
        ItemInfo {
            id: from.id,
            uri: if has_access {
                Some(from.uri.clone())
            } else {
                None
            },
            title: from.title.clone(),
            description: from.description.clone(),
            image: if has_access {
                from.image_uri.clone()
            } else {
                None // from.image_preview_uri.clone()
            },
        }
    }
}

/*********
 * TESTS *
 *********/
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice.testnet".to_string(),
            signer_account_id: "robert.testnet".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "jane.testnet".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    fn generate_item(id: u64, is_published: bool) -> Item {
        Item::new(
            id,
            "https://google.com".to_string(),
            "A random title".to_string(),
            "The item description".to_string(),
            Some("https://s3.envato.com/files/244088191/Google%20Logo.1.jpg".to_string()),
            is_published,
        )
    }

    #[test]
    #[should_panic]
    fn create_with_default_panics() {
        // Given
        let context = get_context(vec![], false);
        testing_env!(context);
        // When
        Item::default();
        // Then
        // - Should panic
    }

    #[test]
    fn init_creates_with_correct_state() {
        // Given
        let context = get_context(vec![], false);
        testing_env!(context);
        // When
        let contract = Item::new(
            123,
            "https://google.com".to_string(),
            "A random title".to_string(),
            "The item description".to_string(),
            Some("https://s3.envato.com/files/244088191/Google%20Logo.1.jpg".to_string()),
            true,
        );
        // Then
        assert_eq!(123, contract.id);
        assert_eq!("https://google.com".to_string(), contract.uri);
        assert_eq!("A random title".to_string(), contract.title);
        assert_eq!("The item description".to_string(), contract.description);
        assert_eq!(
            Some("https://s3.envato.com/files/244088191/Google%20Logo.1.jpg".to_string()),
            contract.image_uri
        );
        assert_eq!(true, contract.is_published);
    }

    #[test]
    fn is_published_returns_correct_state() {
        // Given
        let context = get_context(vec![], false);
        testing_env!(context);
        let item = generate_item(123, true);
        // When
        let result = item.is_published();
        // Then
        assert_eq!(result, true);
    }

    #[test]
    fn item_info_maps_correctly() {
        // Given
        let context = get_context(vec![], false);
        testing_env!(context);
        let item = generate_item(123, true);
        // When
        let item_info = ItemInfo::map(&item, true);
        // Then
        assert_eq!(item_info.id, item.id);
        assert_eq!(item_info.uri, Some(item.uri));
        assert_eq!(item_info.title, item.title);
        assert_eq!(item_info.description, item.description);
        assert_eq!(item_info.image, item.image_uri);
    }

    // Missing test item_info maps correctly when has_access is false
}
