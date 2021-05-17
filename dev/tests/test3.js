const Blockchain = require('../blockchain');
const bc = new Blockchain();
const previousBlockHash = '87765DA6CCF0668238C1D27C35692E11';
const currentBlockData = [
    {
        amount: 10,
        sender: 'B4CEE9C0E5CD571',
        recipient: '3A3F6E462D48E9',  
    }  
];
const nonce = 100;

console.log(bc.hashBlock(previousBlockHash, currentBlockData, nonce));
