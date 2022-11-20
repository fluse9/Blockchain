import Block from '../Block/index.js';

class Blockchain {
    constructor() {
        const genesisBlock = this.createGenesisBlock();
        this.chain = [genesisBlock];
        this.difficulty = 2;
    }

    createGenesisBlock = () => {
        const index = 0;
        const timestamp = new Date().toISOString();
        const data = 'GenesisBlock';
        const previousHash = '0';
        const genesisBlock = new Block(index, timestamp, data, previousHash);
        return genesisBlock;
    };

    getLastBlock = () => {
        const lastBlockIndex = this.chain?.length - 1;
        const lastBlock = this.chain[lastBlockIndex];
        return lastBlock;
    };

    createNewBlock = (timestamp, data) => {
        const index = this.chain?.length;
        const lastBlock = this.getLastBlock();
        const previousHash = lastBlock?.hash;
        const newBlock = new Block(
            index,
            timestamp,
            data,
            previousHash
        ).forgeNewBlock(this.difficulty);
        this.chain?.push(newBlock);
        return newBlock;
    };

    validateChain = () => {
        for (let i = 1; i < this.chain?.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock?.hash !== currentBlock?.calculateHash()) {
                return false;
            } else if (currentBlock?.previousHash !== previousBlock?.hash) {
                return false;
            } else {
                return true;
            }
        }
    };
}

export default Blockchain;
