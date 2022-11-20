import SHA256 from 'crypto-js/sha256.js';
import Key from '../Key/index.js';

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    createHash = () => {
        return SHA256(
            this.fromAddress + this.toAddress + this.amount
        ).toString();
    };

    signTransaction = (key, keyType) => {
        if (key?.getPublic(keyType) !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets');
        }

        const transactionHash = this.createHash();
        const signatureType = 'base64';
        const signature = key?.sign(transactionHash, signatureType);
        this.signature = signature.toDER(keyType);

        return this.signature;
    };

    validateTransaction = () => {
        if (this.fromAddress === null) {
            return true;
        } else if (!this.signature || this.signature?.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const key = new Key();
        const publicKey = key?.ec?.keyFromPublic(
            this.fromAddress,
            key?.keyType
        );
        const isPublicKeySigned = publicKey?.verify(
            this.createHash(),
            this.signature
        );

        return isPublicKeySigned;
    };
}

export default Transaction;
