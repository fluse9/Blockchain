import SHA256 from 'crypto-js/sha256.js';

class Block {
    constructor(index, timestamp, transactions, previousHash) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash =
            previousHash === '0'
                ? '30c8eae89973b668947c8ee09802470d51cedd8dda34841d29a03036ce56df5d'
                : this.createHash();
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
            this.index +
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
