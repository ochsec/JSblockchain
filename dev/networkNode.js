const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const rp = require('request-promise');
const Blockchain = require('./blockchain');
const port = process.argv[3];
const currentNodeUrl = 'http://localhost:' + port;
const bc = new Blockchain(currentNodeUrl);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/register-and-broadcast-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const regNodesPromises = [];
    if (bc.networkNodes.indexOf(newNodeUrl) === -1)
        bc.networkNodes.push(newNodeUrl);
    bc.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl },
            json: true
        };
        regNodesPromises.push(rp(requestOptions));
    });
    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [...bc.networkNodes, bc.currentNodeUrl] },
            json: true
        };
        return rp(bulkRegisterOptions);
    })
    .then(data => {
        res.json({ message: 'New node registered with network successfully.' });
    });
});

app.post('/register-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if ((bc.networkNodes.indexOf(newNodeUrl) === -1) && (bc.currentNodeUrl !== newNodeUrl))
        bc.networkNodes.push(newNodeUrl);
    res.json({ message: 'New node registered successfully.' });
});

app.post('/register-nodes-bulk', function(req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        if ((bc.networkNodes.indexOf(networkNodeUrl) === -1) && (bc.currentNodeUrl !== networkNodeUrl))
            bc.networkNodes.push(networkNodeUrl);
    });
    res.json({ message: 'Bulk registration successful.' });
});

app.post('/transaction/broadcast', function(req, res) {
    const newTransaction = bc.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bc.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];
    bc.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true,
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(data => {
        res.json({ message: 'Transaction created and broadcast successfully.' });
    })
});

app.get('/blockchain', function(req, res) {
    res.send(bc);
});

app.post('/transaction', function(req, res) {
    const newTransaction = req.body;
    const blockIndex = bc.addTransactionToPendingTransactions(newTransaction);
    res.json({ message: `Transaction will be added in block ${blockIndex}.` });
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

app.listen(port, () => console.log(`listening on port ${port}...`));
