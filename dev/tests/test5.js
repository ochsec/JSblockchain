const Blockchain = require('../blockchain');
const bc = new Blockchain();
const previousBlockHash = 'OINAIOSDFN09N09ASDNF90N90ASNDF';
const currentBlockData = [
    {
        amount: 101,
        sender: 'N90ANS90N90ANSDFN',
        recipient: '9WERGJG3WT0JG0SS7'
    },
    {
        amount: 30,
        sender: 'GDFS0SDFGU90SDU0SDFGSD',
        recipient: 'FSDG999JEGR9JSDJ9SDF'
    },
    {
        amount: 200,
        sender: 'G0DSG08W4H8SRG0H8DFGSFDG',
        recipient: '099HSF9H8SF9HWQR23234'
    }
];

const nonce = bc.proofOfWork(previousBlockHash, currentBlockData)

console.log('nonce: ' + nonce);

console.log('hash with leading zeros: ' + bc.hashBlock(previousBlockHash, currentBlockData, nonce));
