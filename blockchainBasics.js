const SHA256 = require('crypto-js/sha256') //use cryto-js / sha256 library

class Block{
    // constructor method
    constructor(index, timestamp, data, previous_hash = ''){
    //    index: where is this block on the chain
    //    timestamp: when was this created
    //    data
    //    previous_hash: which block comes before this one
    //    nonce: field required to mine - avoiding eternal loop
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previous_hash = previous_hash;
        this.hash = this.calculate_hash();
        this.nonce = 0;
    }

    // calculate_hash method
    calculate_hash(){
        return SHA256(this.index + this.previous_hash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
        // toString to ensure we have a string instead of an object
    }

    // method mineBlock
    // to create better security, only hashes with a 'difficulty' number of zeros will be accepted
    // the higher the difficulty, the higher the processing required
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join('0')){
            this.nonce++;
            this.hash = this.calculate_hash();

        }
        console.log('Block mined : ' + this.hash);
    }
}

class Blockchain{
    // constructor method
    constructor(){
        this.chain = [this.createGenesisBlock()]; // array of blocks
        this.difficulty = 5;
    }

    // createGenesisBlock method
    // first block of the chain (= Genisis block) has to be created manually
    createGenesisBlock(){
        return new Block(0,'08/20/2019','Genesis Block','0');
    }

    // getLatestBlock method
    getLatestBlock(){
        // completed block, i.e. not the one we are currently working with
        return this.chain[this.chain.length - 1];
    }

    // addBlock method
    addBlock(newBlock){
        // get the hash from the previous block
        newBlock.previous_hash = this.getLatestBlock().hash;
        // create new hash
        newBlock.mineBlock(this.difficulty);
        // add new block
        this.chain.push(newBlock);
    }

    // validate chain
    validateChain(){
        for(let i = 1; i < this.chain.length; i++){
            // the previous hash of current record has to line up with the hash of the previous record
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            if(currentBlock.previous_hash !== previousBlock.hash){
                return false;
            }
            // recreate hash to ensure it has not changed
            if(currentBlock.hash !== currentBlock.calculate_hash()){
                return false;
            }
        }
        return true;
    }
}

// test functionality
let fdCoin = new Blockchain();
// note that Genesis block is fixed
console.log('Mining Block 1 : ');
fdCoin.addBlock(new Block(1,Date.now(),{ amount: 200 , currency: 'USD' }));
console.log('Mining Block 2 : ');
fdCoin.addBlock(new Block(2,Date.now(),{ amount: 210 , currency: 'USD' }));

console.log(JSON.stringify(fdCoin,null,4));
console.log('blockchain valid : ' + fdCoin.validateChain());