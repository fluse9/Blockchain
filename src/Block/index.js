import SHA256 from 'crypto-js/sha256.js';

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    createBlock = (difficulty) => {
        const difficultyArray = Array(difficulty + 1).join('0');
        while (this.hash?.substring(0, difficulty) !== difficultyArray) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        return this.hash;
    };

    calculateHash = () => {
        const hash = SHA256(
            this.previousHash +
                this.timestamp +
                JSON.stringify(this.transactions) +
                this.nonce
        ).toString();
        return hash;
    };
}

export default Block;
