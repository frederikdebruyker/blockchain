const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); // secp256k1 is the algorithm that is the basis for BitCoin wallets

const keypair = ec.genKeyPair();
const publicKey = keypair.getPublic('hex');
const privateKey = keypair.getPrivate('hex');

console.log('Public key  : '+ publicKey);
console.log('Private key : '+ privateKey);

