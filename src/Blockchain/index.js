import Block from '../Block/index.js';
import Transaction from '../Transaction/index.js';

class Blockchain {
    constructor() {
        const genesisBlock = this.createGenesisBlock();
        this.chain = [genesisBlock];
        this.difficulty = 1;
        this.pendingTransactions = [];
        this.reward = 100;
        this.validators = [];
        this.validatorOfLastBlock = null;
    }

    createGenesisBlock = () => {
        const index = 0;
        const timestamp = new Date().toISOString();
        const transactions = [];
        const previousHash = '0';
        const genesisBlock = new Block(
            index,
            timestamp,
            transactions,
            previousHash
        );
        return genesisBlock;
    };

    createBlock = () => {
        const index = this.readLastBlock().index++;
        const timestamp = new Date().toISOString();
        const transactions = this.pendingTransactions;
        const previousHash = this.readLastBlock()?.hash;

        let block = new Block(index, timestamp, transactions, previousHash);
        block.createBlock(this.difficulty);

        return block;
    };

    addBlock = (block, rewardAddress) => {
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
        return block;
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

    readBlock = (index) => {
        if (index > this.chain?.length - 1) {
            return null;
        }

        const block = this.chain[index];
        return block;
    };

    readLastBlock = () => {
        const lastBlockIndex = this.chain?.length - 1;
        const lastBlock = this.chain[lastBlockIndex];
        return lastBlock;
    };

    createValidator = (peerId) => {
        if (!peerId) {
            throw new Error('A valid peerId is required to become a validator');
        }

        this.validators?.push(peerId);
        console.log(this.validators);
        return peerId;
    };

    deleteValidator = (peerId) => {
        let index = this.validators?.indexOf(peerId);
        if (index > -1) {
            this.validators?.splice(index, 1);
        }

        return peerId;
    };

    updateValidatorOfLastBlock = () => {
        let index = 0;

        if (this.validatorOfLastBlock) {
            let validatorOfLastBlockIndex = this.validators?.indexOf(
                this.validatorOfLastBlock
            );
            if (validatorOfLastBlockIndex < this.validators?.length - 1) {
                index = validatorOfLastBlockIndex++;
            }
        }

        this.validatorOfLastBlock = this.validators[index];
        return this.validatorOfLastBlock;
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
