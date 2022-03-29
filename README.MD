### 🚨 Under HEAVY development

- The current state of the project is under heavy development, the APIs might change. This is the first NEAR project that I'm writing, using it to learn react, rust (and the NEAR protocol). 
  
- If you are reading this project to learn any of the tech mentioned above, take everything with a huge grain of salt.

- Most (if not all) of the frontend code is throwaway to simply make it "work".

![Logo](./client-web/src/link3_logo.svg) 
# Link3

- [x] Create Links (similar to linktree)

- [ ] Allow to add categories to links

- [ ] Allow to charge/buy to reveal link `uri` (Gated content)

- [ ] Allow to hide the link for certain wallet(s) - ban

### Extras
- [ ] Expirity (becomes invalid after X timestamp)
- [ ] Category metadata

### Maybe
- [ ] Validate wallets by using other chain contracts etc.
- [ ] Count # of clicks with frontend tracking call
- [ ] Add some sort of analytics
- [ ] Add social media profile(s) verification 


### Useful links
- https://github.com/near-apps/linkdrop-proxy
  
- https://www.producthunt.com/posts/metabio

# Development & Testing

## Compile for release
```
RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
```
## Deploy you own contract to devnet
```bash
near dev-deploy --wasmFile target/wasm32-unknown-unknown/release/link3.wasm
````

### Load dev account ENV variable
```bash
source neardev/dev-account.env
```

Check if it was correctly loaded
```bash
echo $CONTRACT_NAME
```

Should print the dev account id (something like this):
```bash
dev-1642022356114-95915049874087
````

# Interacting with the contract via the [near-cli](https://github.com/near/near-cli)
There are two types of interactions with the contract: `view` or `call` 

```bash
// View method
near view $CONTRACT_NAME method_name

// Call a function (passing 1 NEAR)
near call $CONTRACT_NAME --accountId $ACCOUNT_ID method_name '{ "param": "value" }' --amount 1
```
_`near-cli` Call methods require an account id to be specified (use --accountId or --account_id)_

# Contract

## `VIEW` methods
### Fetching a Link3 profile by `account_id`
```bash
near view $CONTRACT_NAME get '{ "account_id" : "some_account.testnet" }'
```

## `CALL` methods

### Creates a Link3 profile for the `signer_account_id`
```bash
near call $CONTRACT_NAME --accountId $YOU_ACCOUNT_ID create '{ "title": "TITLE", "description":"DESCRIPTION", "image_uri": "IMAGE_URL", "is_published" : true|false }'
```

## Create a link item for the `signer_account_id` Link3 profile

```bash
near call $CONTRACT_NAME --accountId $YOU_ACCOUNT_ID add_link '{ "uri": "URI", "title": "TITLE", "description":"DESCRIPTION", "image_uri": "IMAGE_URL", "is_published" : true|false }'
```

### Example links

**GitHub**
```bash
near call $CONTRACT_NAME --accountId $YOU_ACCOUNT_ID add_link '{ "uri": "https://github.com/joaquimley", "title": "GitHub", "description":"My GitHub profile page", "image_uri": "https://github.githubassets.com/images/modules/logos_page/Octocat.png", "is_published" : true }'
```

**LinkedIn**
```bash
near call $CONTRACT_NAME --accountId $YOU_ACCOUNT_ID add_link '{ "uri": "https://linkedin.com/in/joaquimley", "title": "LinkedIn", "description":"My premium linkedin page", "image_uri": "https://cdn-icons-png.flaticon.com/512/174/174857.png", "is_published":true  }'
```

**NEAR.org**
```bash
near call $CONTRACT_NAME --accountId $YOU_ACCOUNT_ID add_link '{ "uri": "https://near.org", "title": "NEAR", "description":"NEAR is on a mission to empower everyone to take back control of their money, their data, and their identity.", "image_uri": "https://research.binance.com/static/images/projects/near-protocol/logo.png", "is_published" : true }'
```
