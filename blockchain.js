// Blockchain classes and methods
const SHA256 = require('crypto-js/sha256') //use cryto-js / sha256 library
const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); // secp256k1 is the algorithm that is the basis for BitCoin wallets

class Transaction {
    // constructor method
    constructor(fromAddress, toAddress, amount) {
        // fromAddress: who is sending 
        // toAddress: who is receiving
        // amount
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    // calculate_hash method based upon constructor input fields
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
        // toString to ensure we have a string instead of an object
    }

    // signTransaction method
    // signing key includes the private key, the public key can be found based upon the private key
    signTransaction(signingKey){
        // ensure you can only sign your address
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error['You can only sign transactions for your own wallet(s)!']
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx,'base64');
        this.signature = sig.toDER('hex');
    }

    // isValid method
    isValid(){
        // accomodate for mining reward
        if(this.fromAddress === null) return true;
        // error out if signature does not exist or the signature is empty
        if(!this.signature || this.signature.length){
            throw new Error('No signature in this transaction');
        }
        // we have a signature: verify calculated hash is same as signature provided
        const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
}

class Block {
    // constructor method
    constructor(timestamp, transactions, previous_hash = '') {
        //    index: where is this block on the chain
        //    timestamp: when was this created
        //    data
        //    previous_hash: which block comes before this one
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previous_hash = previous_hash;
        this.hash = this.calculate_hash();
    }

        // calculate_hash method
        calculate_hash() {
            return SHA256(this.previous_hash + this.timestamp + JSON.stringify(this.data)).toString();
            // toString to ensure we have a string instead of an object
        }
    
    
    // method mineBlock
    // to create better security, only hashes with a 'difficulty' number of zeros will be accepted
    // the higher the difficulty, the higher the processing required
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculate_hash();

        }
        console.log('Block mined : ' + this.hash);
    }

    // verify all transactions
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain {
    // constructor method
    constructor() {
        // chain: chain of blocks
        // difficulty: increase security by forcing a fixed framework
        // pendingTransactions: blockchains can only be updated every 10 minutes, so a pending blocks array is required
        // miningReward
        this.chain = [this.createGenesisBlock()]; // array of blocks
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    // createGenesisBlock method
    // first block of the chain (= Genisis block) has to be created manually
    createGenesisBlock() {
        return new Block('08/20/2019', 'Genesis Block', '0');
    }

    // getLatestBlock method
    getLatestBlock() {
        // completed block, i.e. not the one we are currently working with
        return this.chain[this.chain.length - 1];
    }

    // minePendingTransactions method
    minePendingTransactions(mineRewardAddress) {
        let block = new Block(Date.now(),this.pendingTransactions);

        // mine pending transactions
        block.mineBlock(this.difficulty);
        console.log('Block succesfully mined');

        // push pending transactions to chain
        this.chain.push(block);
        
        // initialize pendingTransactions as the existing have been pushed
        this.pendingTransactions = [ new Transaction(null, mineRewardAddress, this.miningReward)];
    }    

    // createTransactions method
    // push transactions into array of pending transactions
    addTransactions(transaction) {
        // is from/to address filled in
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include a from and to address');
        }
        // validate transaction is valid
        if(!transaction.isValid){
            throw new Error('Transaction is not valid');
        }
        // add transaction to pending transaction
        this.pendingTransactions.push(transaction);
    }

    // balance: no intermediate amount kept, need to run through the whole chain
    getBalance(address){
        let balance = 0;
        for( const block of this.chain){
            for( const trans of block.transactions){
                if(trans.toAddress === address){
                    // amount sent to address - add to balance
                    balance += trans.amount;
                }
                if(trans.fromAddress === address){
                    // amount sent from address - subtract from balance
                    balance -= trans.amount;
                }
            }
        }
        return balance;
    }

    // validate chain
    validateChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // all valid transactions validation
            if (!currentBlock.hasValidTransactions()){
                return false;
            }
            // the previous hash of current record has to line up with the hash of the previous record
            if (currentBlock.previous_hash !== previousBlock.hash) {
                return false;
            }
            // recreate hash to ensure it has not changed
            if (currentBlock.hash !== currentBlock.calculate_hash()) {
                return false;
            }
        }
        return true;
    }
}


// make classes available for export
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;