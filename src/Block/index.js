import SHA256 from 'crypto-js/sha256.js';

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.createHash();
        this.nonce = 0;
    }

    createBlock = (difficulty) => {
        const difficultyArray = Array(difficulty + 1).join('0');
        while (this.hash?.substring(0, difficulty) !== difficultyArray) {
            this.nonce++;
            this.hash = this.createHash();
        }

        return this.hash;
    };

    createHash = () => {
        const hash = SHA256(
            this.previousHash +
                this.timestamp +
                JSON.stringify(this.transactions) +
                this.nonce
        ).toString();
        return hash;
    };

    validateTransactions = () => {
        for (const transaction of this.transactions) {
            const isTransactionValid = transaction?.validateTransaction();
            if (!isTransactionValid) {
                return false;
            }
        }

        return true;
    };
}

export default Block;
