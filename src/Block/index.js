import SHA256 from 'crypto-js/sha256.js';

class Block {
    constructor(
        index,
        timestamp,
        transactions,
        previousHash,
        hash = 0,
        nonce = 0
    ) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        if (hash) {
            this.hash = hash;
        } else if (previousHash === '0') {
            this.hash =
                '30c8eae89973b668947c8ee09802470d51cedd8dda34841d29a03036ce56df5d';
        } else {
            this.hash = this.createHash();
        }
        this.nonce = nonce;
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
