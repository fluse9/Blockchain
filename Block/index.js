import SHA256 from 'crypto-js/sha256.js';

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    forgeNewBlock = (difficulty) => {
        const difficultyArray = Array(difficulty + 1).join('0');
        while (this.hash?.substring(0, difficulty) !== difficultyArray) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        return this.hash;
    };

    calculateHash = () => {
        const hash = SHA256(
            this.index +
                this.previousHash +
                this.timestamp +
                JSON.stringify(this.data) +
                this.nonce
        ).toString();
        return hash;
    };
}

export default Block;
