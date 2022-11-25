import p2p from 'p2p';

const P2P_PORT = process.env.P2P_PORT || 5001;
console.log(P2P_PORT);

const PEERS = process.env.PEERS ? process.env.PEERS.split(',') : [];

const MESSAGE_TYPE = {
    REQUEST_SYNCED_CHAIN: 'requestSyncedChain',
    RECEIVE_SYNCED_CHAIN: 'receiveSyncedChain',
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEXT_BLOCK: 'receiveNextBlock',
    RECEIVE_NEW_BLOCK: 'receiveNewBlock',
    REQUEST_ALL_REGISTERED_VALIDATORS: 'requestAllRegisteredValidators',
    RECEIVE_ALL_REGISTERED_VALIDATORS: 'receiveAllRegisteredValidators',
    REGISTER_VALIDATOR: 'registerValidator',
};

class P2P {
    constructor(blockchain) {
        this.peer = p2p.peer({
            host: 'localhost',
            port: parseInt(P2P_PORT),
            wellKnownPeers: [
                { host: 'localhost', port: parseInt(5001) },
                { host: 'localhost', port: parseInt(5002) },
                { host: 'localhost', port: parseInt(5003) },
                { host: 'localhost', port: parseInt(5004) },
            ],
        });
        this.peers = this.peer.wellKnownPeers.get();
        this.blockchain = blockchain;

        this.createMessageToPeerByPeerId(
            5003,
            MESSAGE_TYPE?.REQUEST_SYNCED_CHAIN,
            null
        );
    }

    messageHandler = (message) => {
        console.log('message ', message);

        switch (message?.type) {
            case MESSAGE_TYPE?.REQUEST_SYNCED_CHAIN:
                console.log('--------- REQUEST_SYNCED_CHAIN ---------');
                this.createMessageToPeerByPeerId(
                    message?.from,
                    MESSAGE_TYPE?.RECEIVE_SYNCED_CHAIN,
                    this.blockchain.chain
                );
                console.log('--------- REQUEST_SYNCED_CHAIN ---------');
                break;
            case MESSAGE_TYPE?.RECEIVE_SYNCED_CHAIN:
                console.log('--------- RECEIVE_SYNCED_CHAIN ---------');
                console.log('--------- RECEIVE_SYNCED_CHAIN ---------');
                break;
            case MESSAGE_TYPE?.REQUEST_BLOCK:
                break;
            case MESSAGE_TYPE?.RECEIVE_NEXT_BLOCK:
                break;
            case MESSAGE_TYPE?.RECEIVE_NEW_BLOCK:
                break;
            case MESSAGE_TYPE?.REQUEST_ALL_REGISTERED_VALIDATORS:
                break;
            case MESSAGE_TYPE?.RECEIVE_ALL_REGISTERED_VALIDATORS:
                break;
            case MESSAGE_TYPE?.REGISTER_VALIDATOR:
                break;
            default:
                break;
        }
    };

    createMessageToPeers = (type, data) => {
        this.sendMessage(this.peers, type, data);
    };

    createMessageToPeerByPeerId = (to, type, data) => {
        this.peers?.forEach((peer) => {
            if (peer?.port === to) {
                this.sendMessage([peer], type, data);
            }
        });
    };

    sendMessage = (to, type, data) => {
        this.peer.handle.sendMessage = (message, done) => {
            this.messageHandler(message);
            done(null);
        };

        to?.forEach((peer) => {
            if (peer?.port !== this.peer?.self?.port) {
                this.peer
                    .remote({
                        host: 'localhost',
                        port: peer?.port,
                    })
                    .run(
                        'handle/sendMessage',
                        {
                            to: peer?.port,
                            from: this.peer?.self?.port,
                            type,
                            data,
                        },
                        (error, result) => {}
                    );
            }
        });
    };
}

export default P2P;
