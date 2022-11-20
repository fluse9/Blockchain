import Block from '../Block/index.js';
import Transaction from '../Transaction/index.js';

class Blockchain {
    constructor() {
        const genesisBlock = this.createGenesisBlock();
        this.chain = [genesisBlock];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.stakingReward = 100;
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

    writePendingTransactions = (stakingRewardAddress) => {
        const timestamp = new Date().toISOString();
        const transactions = this.pendingTransactions;
        let block = new Block(timestamp, transactions);
        block.createBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [];

        const fromAddress = null;
        const toAddress = stakingRewardAddress;
        const amount = this.stakingReward;
        const stakingRewardTransaction = new Transaction(
            fromAddress,
            toAddress,
            amount
        );
        this.createPendingTransaction(stakingRewardTransaction);
        return this.pendingTransactions;
    };

    createPendingTransaction = (transaction) => {
        this.pendingTransactions?.push(transaction);
        return this.pendingTransactions;
    };

    getAddressBalance = (address) => {
        let balance = 0;
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (address === transaction?.fromAddress) {
                    balance -= transaction?.amount;
                }

                if (address === transaction?.toAddress) {
                    balance += transaction?.amount;
                }
            }
        }

        return balance;
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
