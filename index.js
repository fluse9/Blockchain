import crypto from 'crypto';
import Swarm from 'discovery-swarm';
import defaults from 'dat-swarm-defaults';
import getPort from 'get-port';

import Blockchain from './src/Blockchain/index.js';
import Wallet from './src/Wallet/index.js';
import Transaction from './src/Transaction/index.js';
import { CronJob } from 'cron';

const myBlockchain = new Blockchain();

const publicKey =
    '04f947e4518d6cb2cf36d50d031493080be3638a62b204cab7051f27df8ddc1a7416c8aed95c3cc75c37009b22fb5a899abd3b6961caf7277c46d442edf5e04e35';
const privateKey =
    '2884c3b7c21d71f7fbee7dd10ff7c03040f35908aa6f13d142f6186816139145';

const wallet = new Wallet();
console.log(wallet);
const myWallet = wallet?.ec?.keyFromPrivate(privateKey);
console.log(myWallet);
const myWalletAddress = myWallet?.getPublic(wallet?.keyType);
console.log(myWalletAddress);

const peers = {};
let connectionSequence = 0;
let channel = 'myBlockchain';

const myPeerId = crypto.randomBytes(32);

const config = defaults({
    id: myPeerId,
});
const swarm = Swarm(config);

const MessageType = {
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEXT_BLOCK: 'receiveNextBlock',
    RECEIVE_NEW_BLOCK: 'receiveNewBlock',
    REQUEST_ALL_REGISTERED_VALIDATORS: 'requestAllRegisterValidators',
    REGISTER_VALIDATOR: 'registerValidator',
};

(async () => {
    const port = await getPort();
    swarm.listen(port);

    swarm.join(channel);
    swarm.on('connection', (connection, info) => {
        const sequence = connectionSequence;
        const peerId = info.id.toString('hex');
        console.log(`Connected ${sequence} to peer: ${peerId}`);

        if (info.initiator) {
            try {
                connection.setKeepAlive(true, 600);
            } catch (exception) {
                console.log('exception', exception);
            }
        }

        connection.on('data', (data) => {
            let message = JSON.parse(data);
            console.log('----------- Received Message start -------------');
            console.log(
                'from: ' + peerId.toString('hex'),
                'to: ' + peerId.toString(message.to),
                'my: ' + myPeerId.toString('hex'),
                'type: ' + JSON.stringify(message.type)
            );
            console.log('----------- Received Message end -------------');

            switch (message?.type) {
                case MessageType.REQUEST_BLOCK:
                    console.log('-----------REQUEST_BLOCK-------------');
                    let requestedIndex = JSON.parse(
                        JSON.stringify(message.data)
                    ).index;
                    let requestedBlock = myBlockchain.readBlock(requestedIndex);
                    if (requestedBlock)
                        writeMessageToPeerToId(
                            peerId.toString('hex'),
                            MessageType.RECEIVE_NEXT_BLOCK,
                            requestedBlock
                        );
                    else
                        console.log(
                            'No block found @ index: ' + requestedIndex
                        );
                    console.log('-----------REQUEST_BLOCK-------------');
                    break;
                case MessageType.RECEIVE_NEXT_BLOCK:
                    console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                    let nextBlockIndex = myBlockchain.readLastBlock().index + 1;
                    console.log(
                        '-- request next block @ index: ' + nextBlockIndex
                    );
                    writeMessageToPeers(MessageType.REQUEST_BLOCK, {
                        index: nextBlockIndex,
                    });
                    console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                    break;
                case MessageType.RECEIVE_NEW_BLOCK:
                    if (
                        message.to === myPeerId.toString('hex') &&
                        message.from !== myPeerId.toString('hex')
                    ) {
                        console.log(
                            '-----------RECEIVE_NEW_BLOCK------------- ' +
                                message.to
                        );
                        const { newBlock, validatorOfNewBlockWalletAddress } =
                            JSON.parse(JSON.stringify(message.data));
                        myBlockchain.addBlock(
                            newBlock,
                            validatorOfNewBlockWalletAddress
                        );
                        myBlockchain.validatorOfLastBlockWalletAddress =
                            validatorOfNewBlockWalletAddress;
                        console.log(JSON.stringify(newBlock));
                        console.log(JSON.stringify(myBlockchain.chain));
                        console.log(
                            '-----------RECEIVE_NEW_BLOCK------------- ' +
                                message.to
                        );
                    }
                    break;
                case MessageType.REQUEST_ALL_REGISTERED_VALIDATORS:
                    console.log(
                        '-----------REQUEST_ALL_REGISTER_ VALIDATORS------------- ' +
                            message.to
                    );
                    writeMessageToPeers(
                        MessageType.REGISTER_VALIDATOR,
                        myBlockchain.validators
                    );
                    myBlockchain.validators = JSON.stringify(message.data);
                    console.log(
                        '-------------REQUEST_ALL_REGISTER_ VALIDATORS------------- ' +
                            message.to
                    );
                    break;
                case MessageType.REGISTER_VALIDATOR:
                    console.log(
                        '-----------REGISTER_VALIDATOR------------- ' +
                            message.to
                    );
                    console.log(message);
                    let validators = JSON.stringify(message.data);
                    console.log(validators);
                    myBlockchain.validators = JSON.parse(validators);
                    console.log(myBlockchain.validators);
                    console.log(
                        '-----------REGISTER_VALIDATOR------------- ' +
                            message.to
                    );
                    break;
                default:
                    break;
            }
        });

        connection.on('close', () => {
            console.log(`Connection ${sequence} closed, peerId: ${peerId}`);
            if (peers[peerId].sequence === sequence) {
                delete peers[peerId];
            }
        });

        if (!peers[peerId]) {
            peers[peerId] = {};
        }
        peers[peerId].connection = connection;
        peers[peerId].sequence = sequence;
        connectionSequence++;
    });
})();

const writeMessageToPeers = (type, data) => {
    for (let id in peers) {
        console.log('-------- writeMessageToPeers start -------- ');
        console.log('type: ' + type + ', to: ' + id);
        console.log('-------- writeMessageToPeers end ----------- ');
        sendMessage(id, type, data);
    }
};

const writeMessageToPeerToId = (toId, type, data) => {
    for (let id in peers) {
        if (id === toId) {
            console.log('-------- writeMessageToPeerToId start -------- ');
            console.log('type: ' + type + ', to: ' + toId);
            console.log('-------- writeMessageToPeerToId end ----------- ');
            sendMessage(id, type, data);
        }
    }
};

const sendMessage = (id, type, data) => {
    peers[id].connection.write(
        JSON.stringify({
            to: id,
            from: myPeerId,
            type: type,
            data: data,
        })
    );
};

setTimeout(() => {
    writeMessageToPeers(
        MessageType.REQUEST_ALL_REGISTERED_VALIDATORS,
        myBlockchain.validators
    );
}, 5000);

setTimeout(function () {
    writeMessageToPeers(MessageType.REQUEST_BLOCK, {
        index: myBlockchain.readLastBlock().index,
    });
}, 5000);

setTimeout(() => {
    myBlockchain.createValidator(myPeerId.toString('hex'));
    console.log(myBlockchain.validators);
    writeMessageToPeers(
        MessageType.REGISTER_VALIDATOR,
        myBlockchain.validators
    );
    console.log(myBlockchain.validators);
}, 7000);

const validateNextBlock = new CronJob('10 * * * * *', () => {
    const validatorOfNextBlock = myBlockchain.updateValidatorOfLastBlock();
    console.log('-- REQUESTING NEW BLOCK FROM: ' + validatorOfNextBlock);
    console.log('-----------create next block -----------------');
    if (validatorOfNextBlock === myPeerId.toString('hex')) {
        const validatorOfNewBlockWalletAddress =
            myBlockchain.updateValidatorOfLastBlock();
        const newBlock = myBlockchain.createBlock(
            validatorOfNewBlockWalletAddress
        );
        myBlockchain.addBlock(newBlock, validatorOfNewBlockWalletAddress);
        console.log(JSON.stringify(newBlock));
        writeMessageToPeers(MessageType.RECEIVE_NEW_BLOCK, {
            newBlock: newBlock,
            validatorOfNewBlockWalletAddress: validatorOfNewBlockWalletAddress,
        });
    }
    console.log(myBlockchain.chain);
    console.log('-----------create next block -----------------');
});
validateNextBlock.start();

/*
const testBlockchain = new Blockchain();
testBlockchain.createValidator(myWalletAddress);

const transaction1 = new Transaction(myWalletAddress, 'wallet2', 10);
transaction1.signTransaction(myWallet, wallet?.keyType);
console.log(transaction1);

testBlockchain.createPendingTransaction(transaction1);

console.log(testBlockchain);
console.log(testBlockchain.readAddressBalance(myWalletAddress));

testBlockchain.chain[1].transactions[0].amount = 1;

console.log(testBlockchain.validateChain());
*/
