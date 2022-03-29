import React from 'react';
import ReactDOM from 'react-dom';
import * as nearAPI from 'near-api-js';
import getConfig from './near/config.js';
import './index.css';
import App from './App';
// Import globaly as react-scripts 5.0.0 don't allow poly
global.Buffer = global.Buffer || require('buffer').Buffer

// Taken from: https://github.com/near-examples/rust-status-message/blob/master/frontend/index.js#L8-L41
// Ref: https://github.com/near/near-api-js/blob/master/examples/quick-reference.md
const initContract = async () => {

  const nearConfig = getConfig(process.env.NODE_ENV || 'testnet');
  // Initializing connection to the NEAR TestNet
  const near = await nearAPI.connect({ keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(), ...nearConfig });
  // Needed to access wallet
  const walletConnection = new nearAPI.WalletConnection(near);

  // Load in account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId(),
      balance: (await walletConnection.account().state()).amount
    };
  }

  // Initializing our contract APIs by contract name and configuration
  const contract = new nearAPI.Contract(walletConnection.account(), nearConfig.contractName, {
    viewMethods: ['get'],
    changeMethods: ['create', 'add_link'],
    // Sender is the account ID to initialize transactions.
    // getAccountId() will return empty string if user is still unauthorized
    sender: walletConnection.getAccountId()
  });

  return { contract, currentUser, nearConfig, walletConnection };
}

window.nearInitPromise = initContract().then(({ contract, currentUser, nearConfig, walletConnection }) => {
  ReactDOM.render(
    <React.StrictMode>
      <App
        contract={contract}
        currentUser={currentUser}
        nearConfig={nearConfig}
        wallet={walletConnection}
      />
    </React.StrictMode>,
    document.getElementById('root')
  );
});