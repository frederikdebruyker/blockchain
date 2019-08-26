const {Blockchain, Transaction} = require('./blockchain'); // import classes as defined in blockchain.js
const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); // secp256k1 is the algorithm that is the basis for BitCoin wallets

const myKey = ec.keyFromPrivate('82f15569689dafdeb33811ed2f7e605469824704e3f958408a6972e6c3e92a96');
const myWalletAddress = myKey.getPublic('hex');

// test functionality
let fdCoin = new Blockchain();

// payments
const tx1 = new Transaction(myWalletAddress,'someone else public key',100);
tx1.signTransaction(myKey);
fdCoin.addTransactions(tx1);
console.log(JSON.stringify(fdCoin,null,4));

// mining
fdCoin.minePendingTransactions(myWalletAddress);

// balance
console.log('Balance : ' + fdCoin.getBalance(myWalletAddress));