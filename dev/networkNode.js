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

});

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

app.listen(port, () => console.log(`listening on port ${port}...`));
