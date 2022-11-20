import Block from '../Block/index.js';
import Transaction from '../Transaction/index.js';

class Blockchain {
    constructor() {
        const genesisBlock = this.createGenesisBlock();
        this.chain = [genesisBlock];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.reward = 100;
    }

    createGenesisBlock = () => {
        const timestamp = new Date().toISOString();
        const transactions = [];
        const previousHash = '0';
        const genesisBlock = new Block(timestamp, transactions, previousHash);
        return genesisBlock;
    };

    createBlock = (rewardAddress) => {
        const timestamp = new Date().toISOString();
        const transactions = this.pendingTransactions;
        const previousHash = this.readLastBlock()?.hash;

        let block = new Block(timestamp, transactions, previousHash);
        block.createBlock(this.difficulty);

        this.chain.push(block);
        this.pendingTransactions = [];

        const fromAddress = null;
        const toAddress = rewardAddress;
        const amount = this.reward;
        const rewardTransaction = new Transaction(
            fromAddress,
            toAddress,
            amount
        );
        this.createRewardTransaction(rewardTransaction);
        return this.pendingTransactions;
    };

    createRewardTransaction = (transaction) => {
        this.pendingTransactions?.push(transaction);
        return this.pendingTransactions;
    };

    createPendingTransaction = (transaction) => {
        if (!transaction?.fromAddress || !transaction?.toAddress) {
            throw new Error('Transaction must include a from and to address');
        } else if (!transaction.validateTransaction()) {
            throw new Error('Cannot add an invalid transaction to the chain');
        }

        this.pendingTransactions?.push(transaction);
        return this.pendingTransactions;
    };

    readAddressBalance = (address) => {
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

    readLastBlock = () => {
        const lastBlockIndex = this.chain?.length - 1;
        const lastBlock = this.chain[lastBlockIndex];
        return lastBlock;
    };

    validateChain = () => {
        for (let i = 1; i < this.chain?.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.validateTransactions()) {
                return false;
            } else if (currentBlock?.hash !== currentBlock?.createHash()) {
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
