const SHA256 = require('crypto-js/sha256') //use cryto-js / sha256 library

class Block{
    // constructor method
    constructor(index, timestamp, data, previous_hash = ''){
    //    index: where is this block on the chain
    //    timestamp: when was this created
    //    data
    //    previous_hash: which block comes before this one
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previous_hash = previous_hash;
    this.hash = this.calculate_hash();
    }

    // calculate_hash method
    calculate_hash(){
        return SHA256(this.index + this.previous_hash + this.timestamp + JSON.stringify(this.data)).toString();
        // toString to ensure we have a string instead of an object
    }
}

class Blockchain{
    // constructor method
    constructor(){
        this.chain = [this.createGenesisBlock()]; // array of blocks
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
        newBlock.hash = newBlock.calculate_hash();
        // add new block
        this.chain.push(newBlock);
    }
}

// test functionality
let fdCoin = new Blockchain();
// note that Genesis block is fixed
fdCoin.addBlock(new Block(1,Date.now(),{ amount: 200 , currency: 'USD' }));
fdCoin.addBlock(new Block(2,Date.now(),{ amount: 210 , currency: 'USD' }));

console.log(JSON.stringify(fdCoin,null,4));