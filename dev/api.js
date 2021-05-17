const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const Blockchain = require('./blockchain');
const bc = new Blockchain();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/blockchain', function(req, res) {
    res.send(bc);
});

app.post('/transaction', function(req, res) {
    const blockIndex = bc.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({ message: `Transaction will be added in block ${blockIndex}.`});
});

app.get('/mine', function(req, res) {
    const lastBlock = bc.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bc.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = bc.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bc.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = bc.createNewBlock(nonce, previousBlockHash, blockHash);
    const nodeAddress = uuidv4().split('-').join('');

    bc.createNewTransaction(12.5, "00", nodeAddress);

    res.json({
        message: "New block mined successfully!",
        block: newBlock
    });
});

app.listen(3000, () => console.log('listening on port 3000...'));

