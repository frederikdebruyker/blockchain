const SHA256 = require('crypto-js/sha256') //use cryto-js / sha256 library

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
}

class Block {
    // constructor method
    constructor(timestamp, transactions, previous_hash = '') {
        //    index: where is this block on the chain
        //    timestamp: when was this created
        //    data
        //    previous_hash: which block comes before this one
        //    nonce: field required to mine - avoiding eternal loop
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previous_hash = previous_hash;
        this.hash = this.calculate_hash();
        this.nonce = 0;
    }

    // calculate_hash method
    calculate_hash() {
        return SHA256(this.previous_hash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
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
    createTransactions(transaction) {
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
            // the previous hash of current record has to line up with the hash of the previous record
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
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

// test functionality
let fdCoin = new Blockchain();

// payments
fdCoin.createTransactions(new Transaction('my address','other1',200));
fdCoin.createTransactions(new Transaction('my address','other2',300));
fdCoin.createTransactions(new Transaction('my address','other5',850));
fdCoin.createTransactions(new Transaction('other1','my address',2000));
fdCoin.createTransactions(new Transaction('other2','my address',2000));
fdCoin.createTransactions(new Transaction('other3','my address',1050));
console.log(JSON.stringify(fdCoin,null,4));

// mining
fdCoin.minePendingTransactions('pay address');

// balance
console.log('Balance : ' + fdCoin.getBalance('my address'));